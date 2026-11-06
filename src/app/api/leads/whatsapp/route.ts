import { NextResponse, type NextRequest } from "next/server";
import { db, type LeadRow } from "@/lib/db";
import { clip, siteUrl } from "@/lib/server-utils";
import { notifyAdminLeadReply } from "@/lib/notify";

// A pessoa carregou em "Enviar Mensagem Direta no WhatsApp" na página de obrigado → intenção alta no CRM.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(await req.text());
  } catch {}
  const token = clip(body.token, 40);
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const sql = await db();
    const [lead] = await sql<LeadRow[]>`
      UPDATE leads SET whatsapp_at = COALESCE(whatsapp_at, now()), unread = TRUE, updated_at = now()
      WHERE token = ${token} RETURNING *`;
    if (lead) await notifyAdminLeadReply(lead, "Abriu o WhatsApp para falar consigo (intenção alta). Se a mensagem não chegar, ligue-lhe.", siteUrl(req)).catch(() => {});
    return NextResponse.json({ ok: Boolean(lead) });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
