"use client";

import { DEFAULT_MESSAGE, PROMOTER } from "@/lib/config";
import { track } from "@/lib/track";
import { IconPhone, IconWhatsApp } from "../icons";

export const waLink = (text = DEFAULT_MESSAGE) => `https://wa.me/${PROMOTER.whatsapp}?text=${encodeURIComponent(text)}`;

/** WhatsApp + Ligar */
export default function DirectContact({ cta }: { cta: string }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <a href={waLink()} target="_blank" rel="noopener" onClick={() => track("Contact", { method: "whatsapp", cta })} className="btn btn-wa w-full">
        <IconWhatsApp size={18} /> WhatsApp
      </a>
      <a href={PROMOTER.phoneHref} onClick={() => track("Contact", { method: "call", cta })} className="btn btn-ghost w-full">
        <IconPhone size={16} /> Ligar
      </a>
    </div>
  );
}
