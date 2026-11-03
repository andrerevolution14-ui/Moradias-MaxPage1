import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard } from "../_guard";

function csv(v: unknown) {
  const s = v == null ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const sql = await db();
  const rows = await sql`
    SELECT l.id, l.created_at, l.name, l.phone, l.email, l.status, l.intent, l.lot, l.notes,
      l.source->>'utm_source' AS utm_source, l.source->>'utm_campaign' AS utm_campaign,
      l.source->>'utm_content' AS utm_content, l.source->>'variant' AS variant,
      (SELECT string_agg(to_char(m.created_at, 'YYYY-MM-DD HH24:MI') || ' [' || m.sender || '] ' || m.body, E'\n' ORDER BY m.created_at)
         FROM messages m WHERE m.lead_id = l.id) AS conversa
    FROM leads l ORDER BY l.created_at DESC`;
  const cols = ["id", "created_at", "name", "phone", "email", "status", "intent", "lot", "notes", "utm_source", "utm_campaign", "utm_content", "variant", "conversa"];
  const out = "﻿" + [cols.join(";"), ...rows.map((r) => cols.map((c) => csv(r[c])).join(";"))].join("\n");
  return new Response(out, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-domaine-xxv-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
