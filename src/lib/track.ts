"use client";

// Tracking no browser: Pixel (fbq) + espelho na Conversions API com o mesmo event_id.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[$()*+./?[\\\]^{|}-]/g, "\\$&") + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export function newEventId(prefix = "ev") {
  const rnd = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}-${rnd}`;
}

/** fbc a partir do fbclid, caso o Pixel ainda não o tenha criado */
export function getFbc() {
  const c = getCookie("_fbc");
  if (c) return c;
  try {
    const src = getSource();
    if (src.fbclid) return `fb.1.${Number(src.fbclid_ts) || Date.now()}.${src.fbclid}`;
  } catch {}
  return undefined;
}

import { getConsent } from "./consent";

/** Pode medir: domínio real, fora do painel /leads e com consentimento de cookies. */
export function trackingAllowed() {
  return domainAllowed() && getConsent() === "granted" && !location.pathname.startsWith("/leads");
}

/** O Pixel só corre no site publicado: nunca em localhost nem em pré-visualizações *.vercel.app. */
export function domainAllowed() {
  if (typeof location === "undefined") return false;
  const h = location.hostname.replace(/^www\./, "");
  if (h === "localhost" || h === "::1" || /^127\.|^192\.168\.|^10\./.test(h)) return false;
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname.replace(/^www\./, "") : "";
    if (site) return h === site;
  } catch {}
  return !h.endsWith(".vercel.app");
}

export function track(
  event: string,
  customData?: Record<string, unknown>,
  eventId = newEventId(event.toLowerCase()),
  serverOnly = false,
) {
  if (!trackingAllowed()) return eventId;
  try {
    if (window.fbq && !serverOnly) {
      const standard = ["PageView", "ViewContent", "Contact", "Lead", "Schedule", "CustomizeProduct", "FindLocation"];
      window.fbq(standard.includes(event) ? "track" : "trackCustom", event, customData || {}, { eventID: eventId });
    }
  } catch {}
  if (event === "Lead") return eventId; // o Lead vai pelo servidor em /api/leads
  try {
    const payload = JSON.stringify({ event, eventId, url: location.href, fbp: getCookie("_fbp"), fbc: getFbc(), customData });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    else fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true });
  } catch {}
  return eventId;
}

const once = new Set<string>();
export function trackOnce(key: string, event: string, data?: Record<string, unknown>) {
  if (once.has(key)) return;
  once.add(key);
  track(event, data);
}

// ---------- Origem da visita (UTM / fbclid) — primeiro toque guardado ----------
const SRC_KEY = "dx_src";

export function captureSource() {
  try {
    const p = new URLSearchParams(location.search);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
    const fresh: Record<string, string> = {};
    keys.forEach((k) => {
      const v = p.get(k);
      if (v) fresh[k] = v;
    });
    const prev = getSource();
    if (Object.keys(fresh).length) {
      if (fresh.fbclid) fresh.fbclid_ts = String(Date.now());
      localStorage.setItem(SRC_KEY, JSON.stringify({ ...fresh, referrer: document.referrer || prev.referrer || "" }));
    } else if (!prev.referrer && document.referrer && !document.referrer.includes(location.host)) {
      localStorage.setItem(SRC_KEY, JSON.stringify({ ...prev, referrer: document.referrer }));
    }
  } catch {}
}

export function getSource(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SRC_KEY) || "{}");
  } catch {
    return {};
  }
}

// ---------- Conversa guardada no dispositivo ----------
const CHAT_KEY = "dx_chat";
export function saveChat(token: string, firstName: string) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify({ token, firstName, at: Date.now() }));
  } catch {}
}
export function loadChat(): { token: string; firstName: string } | null {
  try {
    const v = JSON.parse(localStorage.getItem(CHAT_KEY) || "null");
    return v?.token ? v : null;
  } catch {
    return null;
  }
}

/** Texto honesto do prazo de resposta, na hora de Lisboa */
export function responseWindow() {
  try {
    const h = Number(new Intl.DateTimeFormat("pt-PT", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Lisbon" }).format(new Date()));
    if (h >= 21) return "amanhã de manhã";
    if (h < 8) return "hoje de manhã";
    return "ainda hoje";
  } catch {
    return "ainda hoje";
  }
}
