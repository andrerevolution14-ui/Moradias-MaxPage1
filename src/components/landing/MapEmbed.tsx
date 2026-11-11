"use client";

import { useState } from "react";
import { IconPin } from "../icons";

/** Mapa que não "prende" o scroll no telemóvel: só fica interativo depois de um toque. */
export default function MapEmbed({ src, title }: { src: string; title: string }) {
  const [active, setActive] = useState(false);
  return (
    <div className="relative h-full w-full" onMouseLeave={() => setActive(false)}>
      <iframe src={src} title={title} loading="lazy" className="absolute inset-0 h-full w-full border-0" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      {!active && (
        <button type="button" onClick={() => setActive(true)} className="absolute inset-0 flex items-end justify-center p-3" aria-label="Ativar o mapa">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold text-ink shadow">
            <IconPin size={14} /> Toque para explorar o mapa
          </span>
        </button>
      )}
    </div>
  );
}
