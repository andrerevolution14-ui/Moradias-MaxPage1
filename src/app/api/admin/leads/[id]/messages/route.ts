import { NextResponse, type NextRequest } from "next/server";
import { db, type LeadRow, type MessageRow } from "@/lib/db";
import { clip, siteUrl } from "@/lib/server-utils";
import { emailLeadReply, smsLeadReply } from "@/lib/notify";
import { guard } from "../../../_guard";

// O André responde no chat. Opcionalmente avisa a pessoa por email e/ou SMS.
export async function POST(req: NextRequest, ctx: RouteContext<"/api/admin/leads/[id]/messages">) {
  const denied = guard(req);
  if (denied) return denied;
  const id = Number((await ctx.params).id);
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const text = clip(body.body, 4000);
  if (!text) return NextResponse.json({ error: "Mensagem vazia." }, { status: 422 });
  const notifyEmail = body.notifyEmail !== false;
  const notifySms = body.notifySms === true;

  const sql = await db();
  const [lead] = await sql<LeadRow[]>`SELECT * FROM leads WHERE id = ${id}`;
  if (!lead) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

  const chatUrl = `${siteUrl(req)}/conversa/${lead.token}`;
  const [emailOk, smsOk] = await Promise.all([
    notifyEmail && lead.email ? emailLeadReply(lead, text, chatUrl) : Promise.resolve(false),
    notifySms ? smsLeadReply(lead, chatUrl) : Promise.resolve(false),
  ]);
  const notified = [emailOk && "email", smsOk && "sms"].filter(Boolean).join(",") || null;

  const [msg] = await sql<MessageRow[]>`
    INSERT INTO messages (lead_id, sender, body, notified) VALUES (${id}, 'admin', ${text}, ${notified}) RETURNING *`;
  await sql`
    UPDATE leads SET last_message_at = now(), updated_at = now(),
      status = CASE WHEN status = 'nova' THEN 'contactada' ELSE status END
    WHERE id = ${id}`;
  return NextResponse.json({ ok: true, message: msg, notified, chatUrl });
}
