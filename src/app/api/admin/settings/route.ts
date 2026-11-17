import { NextResponse, type NextRequest } from "next/server";
import { setMetaLeadMode } from "@/lib/settings";
import { guard } from "../_guard";

export async function PUT(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.metaLeadMode === "qualificado" || body.metaLeadMode === "imediato") await setMetaLeadMode(body.metaLeadMode);
  return NextResponse.json({ ok: true });
}
