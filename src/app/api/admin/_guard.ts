import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/server-utils";

export function guard(req: NextRequest) {
  return isAdmin(req) ? null : NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}
