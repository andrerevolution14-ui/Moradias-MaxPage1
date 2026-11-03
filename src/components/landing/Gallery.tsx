"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { GALLERY } from "@/lib/config";
import { trackOnce } from "@/lib/track";
import { IconArrowL, IconArrowR, IconCamera, IconPin, IconPlan } from "../icons";
import Lightbox from "./Lightbox";
import Tour360Button from "./Tour360";

/** Fotos que se deslizam para o lado sem abrir. Tocar abre em ecrã inteiro. */
export default function Gallery() {
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [cur, setCur] = useState(0);
  const planIdx = GALLERY.findIndex((g) => g.src.includes("planta"));

  function onScroll() {
    const el = track.current;
    if (!el) return;
    const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth || el.clientWidth;
    setCur(Math.min(GALLERY.length - 1, Math.round(el.scrollLeft / (w + 8))));
    if (el.scrollLeft > 40) trackOnce("gallery", "ViewContent", { content_name: "galeria", content_type: "home_listing" });
  }
  function step(d: number) {
    const el = track.current;
    if (!el) return;
    const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth || el.clientWidth;
    el.scrollBy({ left: d * (w + 8), behavior: "smooth" });
  }

  return (
    <div>
     <div className="relative">
      <div
        ref={track}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth lg:rounded-2xl"
      >
        {GALLERY.map((g, i) => (
          <button
            key={g.src}
            onClick={() => setOpen(i)}
            className="relative aspect-[4/3] w-[88%] shrink-0 snap-center overflow-hidden first:ml-0 sm:w-[70%] lg:aspect-auto lg:h-[540px] lg:w-[62%] lg:snap-start lg:rounded-xl"
            aria-label={`Ver foto: ${g.alt}`}
          >
            <Image
              src={g.src}
              alt={g.alt}
              fill
              sizes="(min-width:1024px) 760px, (min-width:640px) 70vw, 100vw"
              quality={i === 0 ? 75 : 60}
              priority={i === 0}
              loading={i === 0 ? undefined : i < 3 ? "eager" : "lazy"}
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5 lg:left-4 lg:top-4">
        <span className="rounded-md bg-cta px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-paper">Venda em planta</span>
        <span className="rounded-md bg-paper px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">Projeto aprovado</span>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white">
        <IconCamera size={14} /> {cur + 1} / {GALLERY.length}
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <button onClick={() => step(-1)} className="hidden h-10 w-10 place-items-center rounded-full bg-paper/95 shadow lg:grid" aria-label="Anterior"><IconArrowL /></button>
        <button onClick={() => step(1)} className="hidden h-10 w-10 place-items-center rounded-full bg-paper/95 shadow lg:grid" aria-label="Seguinte"><IconArrowR /></button>
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
