"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, getConsent, setConsent } from "@/lib/consent";

/** Aviso de cookies discreto: não bloqueia a página; recusar é tão fácil como aceitar. */
export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sync = () => setShow(getConsent() === null && !location.pathname.startsWith("/leads"));
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fade-in fixed inset-x-3 bottom-[calc(80px+env(safe-area-inset-bottom))] z-[45] mx-auto max-w-md rounded-2xl border border-line bg-white p-4 shadow-[0_10px_30px_rgba(21,32,43,0.16)] lg:bottom-5 lg:left-5 lg:right-auto lg:mx-0"
    >
      <p className="text-[13.5px] leading-snug text-ink">
        Usamos cookies para medir a eficácia dos nossos anúncios (Meta). Pode aceitar ou recusar.{" "}
        <Link href="/privacidade" className="text-muted underline">Saber mais</Link>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={() => setConsent("denied")} className="btn btn-ghost py-2 text-sm">Recusar</button>
        <button onClick={() => setConsent("granted")} className="btn btn-primary py-2 text-sm">Aceitar</button>
      </div>
    </div>
  );
}
