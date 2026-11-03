import { NextResponse, type NextRequest } from "next/server";
import { setLots } from "@/lib/lots";
import { guard } from "../_guard";

export async function PUT(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const lots = await setLots(body);
  return NextResponse.json({ lots });
}
