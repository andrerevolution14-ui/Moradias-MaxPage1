"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { GALLERY, PROJECT } from "@/lib/config";
import { trackOnce } from "@/lib/track";
import { Icon360, IconArrowL, IconArrowR, IconCamera, IconPlan, IconPlay, IconX } from "../icons";

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const total = GALLERY.length;

  const show = useCallback((i: number) => {
    setOpen(i);
    trackOnce("gallery", "ViewContent", { content_name: "galeria", content_type: "home_listing" });
  }, []);
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + total) % total)), [total]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  const planIdx = GALLERY.findIndex((g) => g.src.includes("planta-tecnica"));

  return (
    <>
      {/* Telemóvel: carrossel deslizante */}
      <div className="relative lg:hidden">
        <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
          {GALLERY.slice(0, 12).map((g, i) => (
            <button key={g.src} className="relative aspect-[4/3] w-full shrink-0 snap-center" onClick={() => show(i)}>
              <Image src={g.src} alt={g.alt} fill sizes="100vw" className="object-cover" priority={i === 0} />
            </button>
          ))}
        </div>
        <Badges />
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/65 px-2 py-1 text-xs font-semibold text-white">
          <IconCamera size={14} /> {total} fotos
        </div>
      </div>

      {/* Desktop: mosaico estilo portal */}
      <div className="relative hidden h-[520px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl lg:grid">
        {GALLERY.slice(0, 5).map((g, i) => (
          <button
            key={g.src}
            onClick={() => show(i)}
            className={`group relative overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}
          >
            <Image src={g.src} alt={g.alt} fill sizes={i === 0 ? "50vw" : "25vw"} priority={i === 0} className="object-cover transition duration-500 group-hover:scale-[1.03]" />
          </button>
        ))}
        <Badges />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button onClick={() => show(0)} className="btn btn-ghost bg-white/95 px-3 py-2 text-sm shadow"><IconCamera size={16} /> Ver {total} fotos</button>
          <a href="#video" className="btn btn-ghost bg-white/95 px-3 py-2 text-sm shadow"><IconPlay size={14} /> Vídeo</a>
          <a href={PROJECT.tour360} target="_blank" rel="noopener" className="btn btn-ghost bg-white/95 px-3 py-2 text-sm shadow"><Icon360 size={16} /> Visita 360°</a>
          <button onClick={() => show(planIdx)} className="btn btn-ghost bg-white/95 px-3 py-2 text-sm shadow"><IconPlan size={16} /> Plantas</button>
        </div>
      </div>

      {/* Atalhos no telemóvel */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3 lg:hidden">
        <button onClick={() => show(0)} className="btn btn-ghost shrink-0 px-3 py-2 text-sm"><IconCamera size={16} /> Fotos</button>
        <a href="#video" className="btn btn-ghost shrink-0 px-3 py-2 text-sm"><IconPlay size={14} /> Vídeo</a>
        <a href={PROJECT.tour360} target="_blank" rel="noopener" className="btn btn-ghost shrink-0 px-3 py-2 text-sm"><Icon360 size={16} /> Visita 360°</a>
        <button onClick={() => show(planIdx)} className="btn btn-ghost shrink-0 px-3 py-2 text-sm"><IconPlan size={16} /> Plantas</button>
      </div>

      {open !== null && (
        <div className="fade-in fixed inset-0 z-[60] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label="Galeria">
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80">
            <span>{open + 1} / {total} · {GALLERY[open].alt}</span>
            <button onClick={() => setOpen(null)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white" aria-label="Fechar"><IconX /></button>
          </div>
          <div className="relative flex-1">
            <Image src={GALLERY[open].src} alt={GALLERY[open].alt} fill sizes="100vw" className="object-contain" />
            <button onClick={() => go(-1)} className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white" aria-label="Anterior"><IconArrowL /></button>
            <button onClick={() => go(1)} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white" aria-label="Seguinte"><IconArrowR /></button>
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto p-3">
            {GALLERY.map((g, i) => (
              <button key={g.src} onClick={() => setOpen(i)} className={`relative h-14 w-20 shrink-0 overflow-hidden rounded ${i === open ? "ring-2 ring-white" : "opacity-60"}`}>
                <Image src={g.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Badges() {
  return (
    <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5 lg:left-4 lg:top-4">
      <span className="rounded-md bg-brand px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Venda em planta</span>
      <span className="rounded-md bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">Projeto aprovado</span>
    </div>
  );
}
