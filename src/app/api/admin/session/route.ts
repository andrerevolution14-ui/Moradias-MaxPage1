import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/server-utils";
import { smsEnabled } from "@/lib/notify";

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { admin: isAdmin(req), sms: isAdmin(req) ? smsEnabled() : undefined },
    { headers: { "Cache-Control": "no-store" } },
  );
}
