"use client";

// Estatísticas anónimas de primeira parte: sem cookies, sem IP, sessão só nesta aba (sessionStorage).
type Ev = { t: string; n?: string; p?: string; v?: number; m?: Record<string, string> };

let queue: Ev[] = [];
let sid = "";

function session() {
  if (sid) return sid;
  try {
    sid = sessionStorage.getItem("dx_sid") || "";
    if (!sid) {
      sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      sessionStorage.setItem("dx_sid", sid);
    }
  } catch {
    sid = Math.random().toString(36).slice(2, 12);
  }
  return sid;
}

export function flush(beacon = false) {
  if (!queue.length || typeof window === "undefined") return;
  if (location.pathname.startsWith("/leads")) {
    queue = [];
    return;
  }
  const payload = JSON.stringify({ s: session(), e: queue.splice(0, 40) });
  try {
    if (beacon && navigator.sendBeacon) navigator.sendBeacon("/api/ev", new Blob([payload], { type: "application/json" }));
    else fetch("/api/ev", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  } catch {}
}

export function ev(t: string, n = "", v?: number, m?: Record<string, string>, path?: string) {
  if (typeof window === "undefined") return;
  queue.push({ t, n, p: path || location.pathname, v, m });
  if (queue.length >= 20) flush();
}

const seen = new Set<string>();
export function evOnce(key: string, t: string, n = "", v?: number) {
  if (seen.has(key)) return;
  seen.add(key);
  ev(t, n, v);
}
