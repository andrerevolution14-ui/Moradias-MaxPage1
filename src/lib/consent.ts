"use client";

// Consentimento de cookies (RGPD). Guardado só neste dispositivo.
export type Consent = "granted" | "denied" | null;
const KEY = "dx_consent";
export const CONSENT_EVENT = "dx-consent";

export function getConsent(): Consent {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v?.value === "granted" || v?.value === "denied" ? v.value : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent) {
  try {
    if (value) localStorage.setItem(KEY, JSON.stringify({ value, at: new Date().toISOString() }));
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** Abre de novo o aviso (link "Cookies" no rodapé) */
export function reopenConsent() {
  setConsent(null);
}
