import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export function newToken() {
  return randomBytes(18).toString("base64url");
}

export function sha256(v: string) {
  return createHash("sha256").update(v).digest("hex");
}

/** Normaliza telefone para dígitos com indicativo (ex.: 351912345678). Devolve null se inválido. */
export function normalizePhone(raw: string): string | null {
  let d = (raw || "").replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (/^[29]\d{8}$/.test(d)) d = "351" + d; // número PT sem indicativo
  d = d.replace(/\D/g, "");
  if (d.startsWith("351")) {
    return /^351[29]\d{8}$/.test(d) ? d : null;
  }
  return d.length >= 8 && d.length <= 15 ? d : null;
}

export function formatPhone(d: string) {
  if (/^351\d{9}$/.test(d)) return `+351 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
  return `+${d}`;
}

export function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export function clientIp(req: NextRequest) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || null;
}

export function siteUrl(req?: NextRequest) {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (req) return req.nextUrl.origin;
  return "http://localhost:3000";
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function clip(s: unknown, max: number) {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

// ---------- Sessão de administrador (cookie assinado) ----------
export const ADMIN_COOKIE = "dx_admin";
const SESSION_DAYS = 30;

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD não está definido");
  return s;
}

export function signSession() {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  const payload = `admin.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return { value: `${payload}.${sig}`, maxAge: SESSION_DAYS * 86400 };
}

export function verifySession(value: string | undefined) {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [who, exp, sig] = parts;
  if (who !== "admin" || Number(exp) < Date.now()) return false;
  const expected = createHmac("sha256", secret()).update(`${who}.${exp}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAdmin(req: NextRequest) {
  try {
    return verifySession(req.cookies.get(ADMIN_COOKIE)?.value);
  } catch {
    return false;
  }
}

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(sha256(input));
  const b = Buffer.from(sha256(pw));
  return timingSafeEqual(a, b);
}
