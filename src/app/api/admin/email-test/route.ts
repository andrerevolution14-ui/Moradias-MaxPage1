import { NextResponse, type NextRequest } from "next/server";
import { sendTestEmail } from "@/lib/notify";
import { guard } from "../_guard";

export async function POST(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  return NextResponse.json(await sendTestEmail());
}
