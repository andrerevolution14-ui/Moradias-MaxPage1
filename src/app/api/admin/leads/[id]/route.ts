import { NextResponse, type NextRequest } from "next/server";
import { db, type LeadRow, type MessageRow } from "@/lib/db";
import { LEAD_STATUSES } from "@/lib/config";
import { clip } from "@/lib/server-utils";
import { guard } from "../../_guard";

const STATUS_IDS: string[] = LEAD_STATUSES.map((s) => s.id);

export async function GET(req: NextRequest, ctx: RouteContext<"/api/admin/leads/[id]">) {
  const denied = guard(req);
  if (denied) return denied;
  const id = Number((await ctx.params).id);
  const sql = await db();
  const [lead] = await sql<LeadRow[]>`SELECT * FROM leads WHERE id = ${id}`;
  if (!lead) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  const messages = await sql<MessageRow[]>`SELECT * FROM messages WHERE lead_id = ${id} ORDER BY created_at ASC, id ASC`;
  if (lead.unread) await sql`UPDATE leads SET unread = FALSE WHERE id = ${id}`;
  return NextResponse.json({ lead: { ...lead, unread: false }, messages }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/admin/leads/[id]">) {
  const denied = guard(req);
  if (denied) return denied;
  const id = Number((await ctx.params).id);
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const sql = await db();
  const status = typeof body.status === "string" && STATUS_IDS.includes(body.status) ? body.status : null;
  const notes = typeof body.notes === "string" ? clip(body.notes, 10000) : null;
  const unread = typeof body.unread === "boolean" ? body.unread : null;
  const [lead] = await sql<LeadRow[]>`
    UPDATE leads SET
      status = COALESCE(${status}, status),
      notes = COALESCE(${notes}, notes),
      unread = COALESCE(${unread}, unread),
      updated_at = now()
    WHERE id = ${id} RETURNING *`;
  if (!lead) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/admin/leads/[id]">) {
  const denied = guard(req);
  if (denied) return denied;
  const id = Number((await ctx.params).id);
  const sql = await db();
  await sql`DELETE FROM leads WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
