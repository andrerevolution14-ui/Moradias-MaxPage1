"use client";

import { useEffect, useRef } from "react";
import { PROMOTER } from "@/lib/config";
import { track } from "@/lib/track";
import { IconPhone, IconX } from "../icons";
import AvailabilityForm, { Offer } from "./AvailabilityForm";
import TrustMini from "./TrustMini";
import { useLanding } from "./LandingProvider";

/**
 * Janela "Verificar disponibilidade" (abre a partir de qualquer botão da página).
 * Telemóvel: sobe de baixo. Computador: janela ao centro.
 */
export default function ContactDialog() {
  const { sheetOpen, closeSheet, openComposer } = useLanding();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSheet();
    window.addEventListener("keydown", onKey);
    track("ViewContent", { content_name: "janela_disponibilidade" });
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setTimeout(() => panel.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus(), 150);
    }
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen, closeSheet]);

  return (
    <>
      {/* Barra fixa no telemóvel */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 [transform:translateZ(0)] lg:hidden">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button className="btn btn-primary py-3" onClick={() => openComposer({ cta: "mobile_bar" })}>
            Verificar disponibilidade
          </button>
          <a href={PROMOTER.phoneHref} onClick={() => track("Contact", { method: "call", cta: "mobile_bar" })} className="btn btn-ghost px-3.5 py-3" aria-label="Ligar ao André">
            <IconPhone size={18} />
          </a>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center ${sheetOpen ? "" : "hidden"}`} role="dialog" aria-modal="true" aria-label="Verificar disponibilidade">
        <button className="fade-in absolute inset-0 bg-[#0f1822]/55" onClick={closeSheet} aria-label="Fechar" tabIndex={-1} />
        <div
          ref={panel}
          className="sheet-in relative max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl bg-paper px-5 pb-[max(env(safe-area-inset-bottom),18px)] pt-3 lg:max-h-[90dvh] lg:w-[520px] lg:rounded-2xl lg:pb-6 lg:pt-6 lg:shadow-2xl"
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line lg:hidden" />
          <button onClick={closeSheet} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-soft" aria-label="Fechar"><IconX size={18} /></button>
          <div className="pr-10"><Offer size="sm" titleClass="text-[19px] font-bold leading-snug tracking-tight [text-wrap:balance]" /></div>
          <div className="mt-4">
            <AvailabilityForm id="dialog" compact />
          </div>
          <TrustMini className="mt-4 border-t border-line pt-4" />
        </div>
      </div>
    </>
  );
}
