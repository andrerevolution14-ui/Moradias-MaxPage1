import { NextResponse, connection } from "next/server";
import { getLots } from "@/lib/lots";

export async function GET() {
  await connection();
  const lots = await getLots();
  return NextResponse.json({ lots }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" } });
}
