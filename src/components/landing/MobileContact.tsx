"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { PROJECT, PROMOTER, formatEUR } from "@/lib/config";
import { track } from "@/lib/track";
import { IconChat, IconPhone, IconWhatsApp, IconX } from "../icons";
import Composer from "./Composer";
import { waLink } from "./DirectContact";
import { useLanding } from "./LandingProvider";

/** Barra fixa no telemóvel + folha de mensagem (bottom sheet) */
export default function MobileContact() {
  const { sheetOpen, closeSheet, openComposer, chat, available } = useLanding();

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSheet();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen, closeSheet]);

  return (
    <>
      {/* Conversa guardada: aparece quando a pessoa volta ao site */}
      {chat && (
        <Link
          href={`/conversa/${chat.token}`}
          className="fixed bottom-[84px] right-3 z-40 flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 text-sm font-semibold shadow-lg lg:bottom-6 lg:right-6"
        >
          <Image src={PROMOTER.avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
          A sua conversa com o André
        </Link>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 backdrop-blur lg:hidden">
        <div className="mb-1.5 flex items-center justify-between px-0.5 text-[12px]">
          <span className="font-semibold">{formatEUR(PROJECT.price)} · chave na mão</span>
          <span className="font-semibold text-brand">{available > 0 ? `Restam ${available} de 3` : "Esgotado"}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <button className="btn btn-primary py-3" onClick={() => openComposer({ cta: "mobile_bar" })}>
            <IconChat size={18} /> Enviar mensagem
          </button>
          <a href={waLink()} target="_blank" rel="noopener" onClick={() => track("Contact", { method: "whatsapp", cta: "mobile_bar" })} className="btn btn-wa px-3.5 py-3" aria-label="WhatsApp">
            <IconWhatsApp size={20} />
          </a>
          <a href={PROMOTER.phoneHref} onClick={() => track("Contact", { method: "call", cta: "mobile_bar" })} className="btn btn-ghost px-3.5 py-3" aria-label="Ligar">
            <IconPhone size={18} />
          </a>
        </div>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Enviar mensagem">
          <button className="fade-in absolute inset-0 bg-black/45" onClick={closeSheet} aria-label="Fechar" />
          <div className="sheet-in absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <div className="mb-3 flex items-center gap-3">
              <Image src={PROMOTER.avatar} alt={PROMOTER.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
              <div className="flex-1">
                <div className="font-bold leading-tight">Mensagem para {PROMOTER.name}</div>
                <div className="text-[12.5px] text-muted">Promotor do projeto · responde no próprio dia</div>
              </div>
              <button onClick={closeSheet} className="grid h-9 w-9 place-items-center rounded-full bg-soft" aria-label="Fechar"><IconX size={18} /></button>
            </div>
            <Composer variant="sheet" />
          </div>
        </div>
      )}
    </>
  );
}
