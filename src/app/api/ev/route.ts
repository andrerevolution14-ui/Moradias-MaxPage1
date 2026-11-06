import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { clip } from "@/lib/server-utils";

// Estatísticas anónimas do site (sem cookies, sem IP): visitas, secções vistas, cliques, tempo e scroll.
const TYPES = new Set(["view", "section", "click", "time", "scroll", "form_open", "lead", "whatsapp"]);

export async function POST(req: NextRequest) {
  let body: { s?: unknown; e?: unknown } = {};
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const session = clip(body.s, 40);
  if (!/^[a-z0-9]{8,40}$/i.test(session) || !Array.isArray(body.e)) return NextResponse.json({ ok: false }, { status: 400 });
  const rows = (body.e as Record<string, unknown>[])
    .slice(0, 40)
    .filter((x) => x && TYPES.has(String(x.t)))
    .map((x) => ({
      session,
      type: String(x.t),
      name: clip(x.n, 80),
      path: clip(x.p, 120),
      value: Number.isFinite(Number(x.v)) ? Math.max(0, Math.min(2_000_000_000, Math.round(Number(x.v)))) : null,
      meta: x.m && typeof x.m === "object" ? Object.fromEntries(Object.entries(x.m as Record<string, unknown>).slice(0, 8).map(([k, v]) => [clip(k, 20), clip(String(v), 80)])) : null,
    }));
  if (!rows.length) return NextResponse.json({ ok: true });
  try {
    const sql = await db();
    await sql`INSERT INTO events ${sql(rows.map((r) => ({ ...r, meta: r.meta ? sql.json(r.meta) : null })), "session", "type", "name", "path", "value", "meta")}`;
  } catch (e) {
    console.error("[ev]", e);
  }
  return NextResponse.json({ ok: true });
}
