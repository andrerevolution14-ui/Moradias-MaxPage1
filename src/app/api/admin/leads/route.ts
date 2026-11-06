import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard } from "../_guard";

export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const sql = await db();
  const leads = await sql`
    SELECT l.id, l.name, l.phone, l.email, l.status, l.unread, l.intent, l.lot, l.source,
           l.created_at, l.last_message_at, l.whatsapp_at,
           (SELECT body FROM messages m WHERE m.lead_id = l.id ORDER BY m.created_at DESC, m.id DESC LIMIT 1) AS last_message,
           (SELECT sender FROM messages m WHERE m.lead_id = l.id ORDER BY m.created_at DESC, m.id DESC LIMIT 1) AS last_sender
    FROM leads l
    ORDER BY l.last_message_at DESC
    LIMIT 1000`;
  return NextResponse.json({ leads }, { headers: { "Cache-Control": "no-store" } });
}
