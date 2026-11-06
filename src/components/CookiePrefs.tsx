"use client";

import { reopenConsent } from "@/lib/consent";

export default function CookiePrefs() {
  return (
    <button type="button" onClick={reopenConsent} className="underline">
      Cookies
    </button>
  );
}
