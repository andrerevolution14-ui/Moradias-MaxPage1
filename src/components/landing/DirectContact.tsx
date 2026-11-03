"use client";

import { useState } from "react";
import { DEFAULT_MESSAGE, PROMOTER } from "@/lib/config";
import { track } from "@/lib/track";
import { IconPhone, IconWhatsApp } from "../icons";

export const waLink = (text = DEFAULT_MESSAGE) => `https://wa.me/${PROMOTER.whatsapp}?text=${encodeURIComponent(text)}`;

/** WhatsApp + número "Ver" (mecânica RE/MAX: revela o número e regista Contact) */
export default function DirectContact({ cta, stacked = false }: { cta: string; stacked?: boolean }) {
  const [shown, setShown] = useState(false);
  const masked = PROMOTER.phoneDisplay.replace(/(\+351 \d{3}) \d{3} \d{3}/, "$1 ••• •••");
  return (
    <div className={`grid gap-2 ${stacked ? "" : "grid-cols-2"}`}>
      <a
        href={waLink()}
        target="_blank"
        rel="noopener"
        onClick={() => track("Contact", { method: "whatsapp", cta })}
        className="btn btn-wa w-full"
      >
        <IconWhatsApp size={18} /> WhatsApp
      </a>
      {shown ? (
        <a href={PROMOTER.phoneHref} onClick={() => track("Contact", { method: "call", cta })} className="btn btn-ghost w-full tabular-nums">
          <IconPhone size={16} /> {PROMOTER.phoneDisplay}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => {
            setShown(true);
            track("Contact", { method: "reveal_phone", cta });
          }}
          className="btn btn-ghost w-full tabular-nums"
        >
          <IconPhone size={16} /> {stacked ? masked : "Telefone"} <span className="text-[12px] font-semibold text-brand underline">Ver</span>
        </button>
      )}
    </div>
  );
}
