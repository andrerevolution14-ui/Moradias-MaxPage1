"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { PROMOTER } from "@/lib/config";
import { track } from "@/lib/track";
import { IconChat, IconPhone, IconWhatsApp, IconX } from "../icons";
import Composer from "./Composer";
import { waLink } from "./DirectContact";
import { useLanding } from "./LandingProvider";

/**
 * Janela de contacto (abre a partir de qualquer botão "Enviar mensagem").
 * Telemóvel: sobe de baixo. Computador: janela ao centro.
 * Fica sempre montada para não perder o que a pessoa escreveu ao fechar.
 */
export default function ContactDialog() {
  const { sheetOpen, closeSheet, openComposer, chat } = useLanding();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSheet();
    window.addEventListener("keydown", onKey);
    track("ViewContent", { content_name: "janela_contacto" });
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setTimeout(() => panel.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus(), 150);
    }
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen, closeSheet]);

  return (
    <>
      {chat && !sheetOpen && (
        <Link
          href={`/conversa/${chat.token}`}
          className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-3 z-40 flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 text-sm font-semibold shadow-lg lg:bottom-6 lg:right-6"
        >
          <Image src={PROMOTER.avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
          A sua conversa com o André
        </Link>
      )}

      {/* Barra fixa no telemóvel */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 [transform:translateZ(0)] lg:hidden">
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

      <div className={`fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center ${sheetOpen ? "" : "hidden"}`} role="dialog" aria-modal="true" aria-label={`Mensagem para ${PROMOTER.name}`}>
        <button className="fade-in absolute inset-0 bg-[#0f1822]/55" onClick={closeSheet} aria-label="Fechar" tabIndex={-1} />
        <div
          ref={panel}
          className="sheet-in relative max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl bg-paper pb-[max(env(safe-area-inset-bottom),16px)] lg:max-h-[90dvh] lg:w-[520px] lg:rounded-2xl lg:pb-0 lg:shadow-2xl"
        >
          {/* Cabeçalho: quem vai responder */}
          <div className="relative bg-cta px-5 pb-5 pt-3 text-paper lg:pt-5">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/30 lg:hidden" />
            <button onClick={closeSheet} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white" aria-label="Fechar"><IconX size={18} /></button>
            <div className="flex items-center gap-4">
              <Image src={PROMOTER.avatar} alt={PROMOTER.name} width={68} height={68} className="h-[68px] w-[68px] rounded-full object-cover ring-2 ring-white/25" />
              <div className="min-w-0 pr-8">
                <div className="text-[19px] font-bold leading-tight">{PROMOTER.name}</div>
                <div className="text-[13.5px] text-white/75">Promotor do projeto · Domaine XXV</div>
                <div className="mt-1 flex items-center gap-1.5 text-[12.5px] font-medium text-white/85">
                  <span className="h-2 w-2 rounded-full bg-[#7ed39b]" /> Responde no próprio dia
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={waLink()} target="_blank" rel="noopener" onClick={() => track("Contact", { method: "whatsapp", cta: "dialog" })} className="btn btn-wa py-2.5 text-sm">
                <IconWhatsApp size={17} /> WhatsApp
              </a>
              <a href={PROMOTER.phoneHref} onClick={() => track("Contact", { method: "call", cta: "dialog" })} className="btn bg-white/10 py-2.5 text-sm text-white hover:bg-white/15">
                <IconPhone size={16} /> <span className="sm:hidden">Ligar</span><span className="hidden sm:inline">{PROMOTER.phoneDisplay}</span>
              </a>
            </div>
          </div>
          <div className="px-5 pb-5 pt-4">
            <Composer variant="sheet" />
          </div>
        </div>
      </div>
    </>
  );
}
