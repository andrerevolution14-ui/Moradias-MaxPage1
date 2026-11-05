"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox, { type Pic } from "./Lightbox";

/** Fila de imagens que se desliza para o lado; tocar amplia dentro da página. */
export function WorksStrip({ pics }: { pics: (Pic & { tag: string })[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        {pics.map((p, i) => (
          <button key={p.src} onClick={() => setOpen(i)} className="relative aspect-[3/4] w-[46%] shrink-0 snap-start overflow-hidden rounded-md sm:w-[30%] lg:w-[26%]">
            <Image src={p.src} alt={p.alt} fill sizes="(min-width:1024px) 220px, 46vw" quality={85} className="object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 text-left text-white">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-white/80">{p.tag}</span>
              <span className="text-[14px] font-semibold">{p.alt}</span>
            </span>
          </button>
        ))}
      </div>
      {open !== null && <Lightbox pics={pics} index={open} onClose={() => setOpen(null)} />}
    </>
  );
}

/** Fotos reais do terreno: deslizam para o lado; tocar amplia com zoom */
export function TerrainStrip({ pics }: { pics: Pic[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        {pics.map((p, i) => (
          <button key={p.src} onClick={() => setOpen(i)} className="relative aspect-[4/3] w-[78%] shrink-0 snap-start overflow-hidden rounded-md bg-soft sm:w-[46%] lg:w-[40%]" aria-label={`Ver foto: ${p.alt}`}>
            <Image src={p.src} alt={p.alt} fill sizes="(min-width:1024px) 360px, (min-width:640px) 46vw, 78vw" quality={85} className="object-cover" />
            <span className="absolute bottom-2 left-2 rounded bg-black/55 px-2 py-0.5 text-[12px] font-medium text-white">{p.alt}</span>
          </button>
        ))}
      </div>
      {open !== null && <Lightbox pics={pics} index={open} zoomable onClose={() => setOpen(null)} />}
    </>
  );
}

/** Plantas com zoom dentro da página */
export function PlansGrid({ pics }: { pics: (Pic & { note: string })[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0">
        {pics.map((p, i) => (
          <button key={p.src} onClick={() => setOpen(i)} className="group w-[85%] shrink-0 snap-start overflow-hidden rounded-md border border-line bg-white text-left sm:w-auto">
            <div className="relative aspect-[1600/1131]">
              <Image src={p.src} alt={p.alt} fill sizes="(min-width:640px) 420px, 90vw" quality={85} className="object-contain p-2" />
            </div>
            <div className="flex items-center justify-between border-t border-line px-4 py-3">
              <div><div className="font-semibold">{p.alt}</div><div className="text-[13px] text-muted">{p.note}</div></div>
              <span className="text-[13px] font-semibold text-brand">Ampliar +</span>
            </div>
          </button>
        ))}
      </div>
      {open !== null && <Lightbox pics={pics} index={open} zoomable onClose={() => setOpen(null)} />}
    </>
  );
}
