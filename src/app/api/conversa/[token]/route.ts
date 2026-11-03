import { NextResponse, type NextRequest } from "next/server";
import { db, type LeadRow, type MessageRow } from "@/lib/db";
import { clip, siteUrl } from "@/lib/server-utils";
import { notifyAdminLeadReply } from "@/lib/notify";

async function findLead(token: string) {
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) return null;
  const sql = await db();
  const [lead] = await sql<LeadRow[]>`SELECT * FROM leads WHERE token = ${token}`;
  return lead ? { sql, lead } : null;
}

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/conversa/[token]">) {
  const { token } = await ctx.params;
  const found = await findLead(token);
  if (!found) return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  const { sql, lead } = found;
  const messages = await sql<MessageRow[]>`
    SELECT id, sender, body, created_at FROM messages WHERE lead_id = ${lead.id} ORDER BY created_at ASC, id ASC`;
  return NextResponse.json(
    { name: lead.name, firstName: lead.name.split(" ")[0], hasEmail: Boolean(lead.email), messages },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/conversa/[token]">) {
  const { token } = await ctx.params;
  const found = await findLead(token);
  if (!found) return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  const { sql, lead } = found;
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {}
  const text = clip(body.body, 2000);
  if (!text) return NextResponse.json({ error: "Mensagem vazia." }, { status: 422 });

  const [{ n }] = await sql<{ n: number }[]>`
    SELECT count(*)::int AS n FROM messages WHERE lead_id = ${lead.id} AND sender = 'lead' AND created_at > now() - interval '10 minutes'`;
  if (n >= 15) return NextResponse.json({ error: "Demasiadas mensagens seguidas. Aguarde um pouco." }, { status: 429 });

  const [msg] = await sql<MessageRow[]>`
    INSERT INTO messages (lead_id, sender, body) VALUES (${lead.id}, 'lead', ${text}) RETURNING id, sender, body, created_at`;
  await sql`UPDATE leads SET unread = TRUE, last_message_at = now(), updated_at = now() WHERE id = ${lead.id}`;
  await notifyAdminLeadReply(lead, text, siteUrl(req)).catch(() => {});
  return NextResponse.json({ ok: true, message: msg });
}
