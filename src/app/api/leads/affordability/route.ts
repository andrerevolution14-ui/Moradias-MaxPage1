import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { clip } from "@/lib/server-utils";

// Resultado da calculadora "Quanto posso comprar?" (guia) → fica na ficha da lead no CRM.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const token = clip(body.token, 40);
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) return NextResponse.json({ ok: false }, { status: 400 });
  const num = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
  const data = {
    income: num(body.income, 100000),
    debts: num(body.debts, 100000),
    years: num(body.years, 50),
    rate: Math.max(0, Math.min(20, Number(body.rate) || 0)),
    maxLoan: num(body.maxLoan, 5000000),
    fits: body.fits === true,
    at: new Date().toISOString(),
  };
  try {
    const sql = await db();
    await sql`UPDATE leads SET affordability = ${sql.json(data)}, updated_at = now() WHERE token = ${token}`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
