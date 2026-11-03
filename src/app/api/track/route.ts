import { NextResponse, type NextRequest } from "next/server";
import { sendCapiEvent } from "@/lib/meta";
import { clip } from "@/lib/server-utils";

// Eventos do browser espelhados para a Conversions API (mesmo event_id → deduplicação).
const ALLOWED = new Set(["PageView", "ViewContent", "Contact", "Schedule", "CustomizeProduct", "FindLocation"]);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const eventName = clip(body.event, 40);
  const eventId = clip(body.eventId, 80);
  if (!ALLOWED.has(eventName) || !eventId) return NextResponse.json({ ok: false }, { status: 400 });

  const custom = typeof body.customData === "object" && body.customData ? (body.customData as Record<string, unknown>) : undefined;
  await sendCapiEvent(req, {
    eventName,
    eventId,
    eventSourceUrl: clip(body.url, 500) || undefined,
    fbp: clip(body.fbp, 200) || null,
    fbc: clip(body.fbc, 400) || null,
    customData: custom,
  });
  return NextResponse.json({ ok: true });
}
