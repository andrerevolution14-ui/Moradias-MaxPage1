"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { GALLERY } from "@/lib/config";
import { trackOnce } from "@/lib/track";
import { Icon360, IconArrowL, IconArrowR, IconCamera, IconPin, IconPlan } from "../icons";
import Lightbox from "./Lightbox";
import Tour360Button from "./Tour360";

/**
 * Mosaico estilo portal que se desliza para a direita:
 * uma imagem grande (2 linhas) seguida de pares de imagens pequenas empilhadas.
 * Tocar numa imagem abre-a em ecrã inteiro.
 */
export default function Gallery() {
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const planIdx = GALLERY.findIndex((g) => g.plan);

  function onScroll() {
    if ((track.current?.scrollLeft || 0) > 40) trackOnce("gallery", "ViewContent", { content_name: "galeria", content_type: "home_listing" });
  }
  function step(d: number) {
    const el = track.current;
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: "smooth" });
  }

  const tile = "relative overflow-hidden rounded-xl bg-soft snap-start";
  const big = "row-span-2 w-[84vw] sm:w-[60vw] lg:w-[620px]";
  const small = "w-[42vw] sm:w-[30vw] lg:w-[300px]";

  // Mosaico da visita 360° logo a seguir à capa (como o "Visita Virtual" dos portais)
  const items: ({ kind: "pic"; i: number } | { kind: "tour" })[] = [];
  GALLERY.forEach((_, i) => {
    items.push({ kind: "pic", i });
    if (i === 0) items.push({ kind: "tour" });
  });

  return (
    <div>
      <div className="relative">
        <div
          ref={track}
          onScroll={onScroll}
          className="no-scrollbar grid h-[340px] snap-x snap-mandatory scroll-px-4 grid-flow-col grid-rows-2 gap-2 overflow-x-auto scroll-smooth px-4 sm:h-[420px] lg:h-[520px] lg:scroll-px-0 lg:px-0"
        >
          {items.map((it, k) => {
            if (it.kind === "tour") {
              return (
                <Tour360Button key="tour" className={`${tile} ${small} group text-left`}>
                  <Image src="/images/corredor-quartos.webp" alt="" fill sizes="(min-width:1024px) 300px, 42vw" quality={60} className="object-cover" />
                  <span className="absolute inset-0 bg-[#0f1822]/45 transition group-hover:bg-[#0f1822]/55" />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-ink"><Icon360 size={24} /></span>
                  </span>
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-[#0f1822]/80 px-2 py-1 text-[12px] font-semibold text-white">
                    <Icon360 size={14} /> Visita 360°
                  </span>
                </Tour360Button>
              );
            }
            const g = GALLERY[it.i];
            return (
              <button key={g.src} onClick={() => setOpen(it.i)} className={`${tile} ${g.big ? big : small} ${g.plan ? "bg-white ring-1 ring-line" : ""}`} aria-label={`Ver foto: ${g.alt}`}>
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  sizes={g.big ? "(min-width:1024px) 620px, 84vw" : "(min-width:1024px) 300px, 42vw"}
                  quality={k === 0 ? 75 : 60}
                  priority={k === 0}
                  loading={k === 0 ? undefined : k < 5 ? "eager" : "lazy"}
                  className={g.plan ? "object-contain p-2" : "object-cover"}
                />
                {k === 0 && (
                  <span className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-cta px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-paper">Venda em planta</span>
                    <span className="rounded-md bg-paper px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">Projeto aprovado</span>
                  </span>
                )}
                {g.plan && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md bg-[#0f1822]/80 px-2 py-1 text-[12px] font-semibold text-white">
                    <IconPlan size={14} /> Planta
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-3 right-3 hidden items-center gap-2 lg:flex">
          <button onClick={() => step(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-paper/95 shadow" aria-label="Anterior"><IconArrowL /></button>
          <button onClick={() => step(1)} className="grid h-10 w-10 place-items-center rounded-full bg-paper/95 shadow" aria-label="Seguinte"><IconArrowR /></button>
        </div>
      </div>

      {/* Atalhos por baixo das fotos */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3 lg:px-0">
        <button onClick={() => setOpen(0)} className="btn btn-ghost shrink-0 px-3 py-2 text-sm"><IconCamera size={16} /> {GALLERY.length} fotos</button>
        <Tour360Button className="btn btn-ghost shrink-0 px-3 py-2 text-sm" label="Visita 360°" />
        <button onClick={() => setOpen(planIdx)} className="btn btn-ghost shrink-0 px-3 py-2 text-sm"><IconPlan size={16} /> Plantas</button>
        <a href="#localizacao" className="btn btn-ghost shrink-0 px-3 py-2 text-sm"><IconPin size={16} /> Localização</a>
      </div>

      {open !== null && <Lightbox pics={GALLERY} index={open} zoomable onClose={() => setOpen(null)} />}
    </div>
  );
}
