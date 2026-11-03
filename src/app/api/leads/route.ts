import { NextResponse, type NextRequest } from "next/server";
import { db, type LeadRow } from "@/lib/db";
import { clientIp, clip, isEmail, newToken, normalizePhone, siteUrl } from "@/lib/server-utils";
import { emailLeadConfirmation, notifyAdminNewLead, notifyAdminLeadReply, smsLeadConfirmation } from "@/lib/notify";
import { sendCapiEvent } from "@/lib/meta";
import { META_LEAD_VALUE } from "@/lib/config";

const SOURCE_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "variant", "page", "referrer", "cta"];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  // Honeypot anti-spam: campo invisível que só bots preenchem
  if (clip(body.website, 200)) return NextResponse.json({ ok: true, token: "ok" });

  const name = clip(body.name, 80);
  const phone = normalizePhone(clip(body.phone, 30));
  const emailRaw = clip(body.email, 120).toLowerCase();
  const message = clip(body.message, 2000);
  const intent = clip(body.intent, 40) || null;
  const lot = clip(body.lot, 40) || null;

  if (name.length < 2) return NextResponse.json({ error: "Indique o seu nome.", field: "name" }, { status: 422 });
  if (!phone) return NextResponse.json({ error: "Verifique o número de telemóvel.", field: "phone" }, { status: 422 });
  if (emailRaw && !isEmail(emailRaw)) return NextResponse.json({ error: "O email não parece válido.", field: "email" }, { status: 422 });
  if (message.length < 2) return NextResponse.json({ error: "Escreva uma mensagem.", field: "message" }, { status: 422 });
  const email = emailRaw || null;

  const src = (typeof body.source === "object" && body.source) || {};
  const source: Record<string, string> = {};
  for (const k of SOURCE_KEYS) {
    const v = clip((src as Record<string, unknown>)[k], 300);
    if (v) source[k] = v;
  }
  if (process.env.NEXT_PUBLIC_SITE_VARIANT && !source.variant) source.variant = process.env.NEXT_PUBLIC_SITE_VARIANT;

  const ip = clientIp(req);
  const ua = clip(req.headers.get("user-agent"), 400);
  const sql = await db();

  // Limite simples: 6 envios por IP por hora
  if (ip) {
    const [{ n }] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM leads WHERE ip = ${ip} AND created_at > now() - interval '1 hour'`;
    if (n >= 6) return NextResponse.json({ error: "Recebemos várias mensagens deste dispositivo. Por favor contacte-nos por WhatsApp." }, { status: 429 });
  }

  // Mesma pessoa (mesmo telemóvel nos últimos 60 dias) → junta à conversa existente
  const existing = await sql<LeadRow[]>`
    SELECT * FROM leads WHERE phone = ${phone} AND created_at > now() - interval '60 days'
    ORDER BY created_at DESC LIMIT 1`;

  let lead: LeadRow;
  let isNew = true;
  if (existing.length) {
    isNew = false;
    [lead] = await sql<LeadRow[]>`
      UPDATE leads SET
        name = ${name},
        email = COALESCE(${email}, email),
        intent = COALESCE(${intent}, intent),
        lot = COALESCE(${lot}, lot),
        unread = TRUE,
        updated_at = now(),
        last_message_at = now()
      WHERE id = ${existing[0].id}
      RETURNING *`;
  } else {
    [lead] = await sql<LeadRow[]>`
      INSERT INTO leads (token, name, phone, email, intent, lot, source, ip, user_agent)
      VALUES (${newToken()}, ${name}, ${phone}, ${email}, ${intent}, ${lot}, ${sql.json(source)}, ${ip}, ${ua})
      RETURNING *`;
  }
  await sql`INSERT INTO messages (lead_id, sender, body) VALUES (${lead.id}, 'lead', ${message})`;

  const base = siteUrl(req);
  const chatUrl = `${base}/conversa/${lead.token}`;
  const eventId = clip(body.eventId, 80) || `lead-${lead.id}-${Date.now()}`;

  // Notificações e Conversions API em paralelo (o email para o André é o mais importante)
  await Promise.allSettled([
    isNew ? notifyAdminNewLead(lead, message, base) : notifyAdminLeadReply(lead, message, base),
    isNew ? emailLeadConfirmation(lead, chatUrl) : Promise.resolve(false),
    isNew ? smsLeadConfirmation(lead, chatUrl) : Promise.resolve(false),
    sendCapiEvent(req, {
      eventName: "Lead",
      eventId,
      eventSourceUrl: source.page,
      user: { phone, email, name, externalId: String(lead.id) },
      fbp: clip(body.fbp, 200) || null,
      fbc: clip(body.fbc, 400) || null,
      customData: { content_name: "Domaine XXV", content_category: intent || "mensagem", lead_type: isNew ? "new" : "returning", ...META_LEAD_VALUE },
    }),
  ]);

  return NextResponse.json({ ok: true, token: lead.token, firstName: name.split(" ")[0], hasEmail: Boolean(lead.email) });
}
