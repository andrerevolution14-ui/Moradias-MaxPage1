import "server-only";
import type { NextRequest } from "next/server";
import { clientIp, sha256 } from "./server-utils";
import { META_PIXEL_ID } from "./config";

// Meta Conversions API (servidor). Deduplica com o Pixel do browser via event_id.

export type CapiUser = {
  phone?: string | null; // dígitos com indicativo
  email?: string | null;
  name?: string | null;
  externalId?: string | null;
};

export type CapiEvent = {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  user?: CapiUser;
  customData?: Record<string, unknown>;
  fbp?: string | null;
  fbc?: string | null;
};

export function capiEnabled() {
  return Boolean(META_PIXEL_ID) && Boolean(process.env.META_CAPI_ACCESS_TOKEN);
}

function norm(v: string) {
  return v.trim().toLowerCase();
}

function productionRequest(req: NextRequest) {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return false; // pré-visualizações
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(":")[0].replace(/^www\./, "");
  if (!host || host === "localhost" || /^127\./.test(host)) return false;
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname.replace(/^www\./, "") : "";
    if (site) return host === site;
  } catch {}
  return !host.endsWith(".vercel.app");
}

export async function sendCapiEvent(req: NextRequest, ev: CapiEvent) {
  if (!capiEnabled()) return { skipped: true };
  if (!productionRequest(req)) return { skipped: true, reason: "not-production" };
  const pixelId = process.env.META_PIXEL_ID || META_PIXEL_ID;
  const version = process.env.META_GRAPH_VERSION || "v24.0";

  const user_data: Record<string, unknown> = {
    client_ip_address: clientIp(req) || undefined,
    client_user_agent: req.headers.get("user-agent") || undefined,
    fbp: ev.fbp || req.cookies.get("_fbp")?.value || undefined,
    fbc: ev.fbc || req.cookies.get("_fbc")?.value || undefined,
  };
  const u = ev.user || {};
  if (u.phone) user_data.ph = [sha256(u.phone.replace(/\D/g, ""))];
  if (u.email) user_data.em = [sha256(norm(u.email))];
  if (u.name) {
    const parts = norm(u.name).split(/\s+/).filter(Boolean);
    if (parts[0]) user_data.fn = [sha256(parts[0])];
    if (parts.length > 1) user_data.ln = [sha256(parts[parts.length - 1])];
  }
  if (u.externalId) user_data.external_id = [sha256(u.externalId)];
  if (u.phone || u.email) user_data.country = [sha256("pt")];

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: ev.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: ev.eventId,
        action_source: "website",
        event_source_url: ev.eventSourceUrl || req.headers.get("referer") || undefined,
        user_data,
        custom_data: ev.customData,
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(process.env.META_CAPI_ACCESS_TOKEN!)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    );
    if (!res.ok) console.error("[capi]", ev.eventName, res.status, await res.text());
    return { ok: res.ok };
  } catch (e) {
    console.error("[capi] erro", e);
    return { ok: false };
  }
}
