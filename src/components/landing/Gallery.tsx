"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GALLERY, PLANS, WORKS } from "@/lib/config";
import { trackOnce } from "@/lib/track";
import { Icon360, IconArrowL, IconArrowR, IconCamera, IconPlan } from "../icons";
import Lightbox, { preloadGlass } from "./Lightbox";
import Tour360Button from "./Tour360";
import GalleryVideo from "./GalleryVideo";

/**
 * Mosaico estilo portal que se desliza para a direita:
 * uma imagem grande (2 linhas) seguida de pares de imagens pequenas empilhadas.
 * Tocar numa imagem abre-a em ecrã inteiro.
 */
export default function Gallery() {
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const planIdx = GALLERY.findIndex((g) => g.plan);
  const [atStart, setAtStart] = useState(true);

  // Fundos de vidro de todas as fotos ficam prontos antes de alguém abrir uma
  useEffect(() => {
    preloadGlass([...GALLERY, ...WORKS, ...PLANS].map((g) => g.src));
  }, []);

  const ticking = useRef(false);
  function onScroll() {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      const x = track.current?.scrollLeft || 0;
      setAtStart(x < 40);
      if (x > 40) trackOnce("gallery", "ViewContent", { content_name: "galeria", content_type: "home_listing" });
    });
  }
  function step(d: number) {
    const el = track.current;
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: "smooth" });
  }

  // Largura real a que cada foto é desenhada (object-cover corta, por isso pode ser maior que o mosaico).
  // Mosaico: altura 300 / 420 / 520 px; linhas pequenas = (altura - 8) / 2.
  function sizesFor(g: (typeof GALLERY)[number]) {
    const a = g.w / g.h;
    const fit = (tileW: number, tileH: number) => Math.round(g.plan ? tileW : Math.max(tileW, tileH * a));
    const [lg, sm, xs] = g.big
      ? [fit(620, 520), fit(0.6 * 900, 420), fit(0.84 * 430, 300)]
      : [fit(300, 256), fit(0.3 * 900, 206), fit(0.42 * 430, 146)];
    return `(min-width:1024px) ${lg}px, (min-width:640px) ${sm}px, ${xs}px`;
  }

  const tile = "relative overflow-hidden rounded-md bg-soft snap-start";
  const big = "row-span-2 w-[84vw] sm:w-[60vw] lg:w-[620px]";
  const small = "w-[42vw] sm:w-[30vw] lg:w-[300px]";

  // Mosaico da visita 360° (como o "Visita Virtual" dos portais)
  const items: ({ kind: "pic"; i: number } | { kind: "tour" } | { kind: "video" })[] = [];
  GALLERY.forEach((_, i) => {
    items.push({ kind: "pic", i });
    // A 360° vem logo a seguir à capa (em cima na 2.ª coluna). As pequenas vão aos pares: divisão em cima, detalhe por baixo.
    if (i === 0) items.push({ kind: "tour" });
    // Vídeo vertical a ocupar a 3.ª coluna inteira
    if (i === 1) items.push({ kind: "video" });
  });

  return (
    <div>
      <div className="relative">
        <div
          ref={track}
          onScroll={onScroll}
          className="no-scrollbar grid h-[300px] snap-x snap-mandatory scroll-px-4 grid-flow-col grid-rows-2 gap-2 overflow-x-auto scroll-smooth px-4 sm:h-[420px] lg:h-[520px] lg:scroll-px-0 lg:px-0"
        >
          {items.map((it, k) => {
            if (it.kind === "video") {
              return <GalleryVideo key="video" className="row-span-2 h-full w-[169px] sm:w-[236px] lg:w-[293px]" />;
            }
            if (it.kind === "tour") {
              return (
                <Tour360Button key="tour" className={`${tile} ${small} group text-left`}>
                  <Image src="/images/sotao.webp" alt="" fill sizes="(min-width:1024px) 300px, (min-width:640px) 270px, 181px" quality={85} className="object-cover" />
                  <span className="absolute inset-0 bg-[#0f1822]/45 transition group-hover:bg-[#0f1822]/55" />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-ink"><Icon360 size={24} /></span>
                  </span>
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-md bg-[#0f1822]/80 px-2 py-1 text-[12px] font-semibold text-white">
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
                  sizes={sizesFor(g)}
                  quality={85}
                  priority={k === 0}
                  loading={k === 0 ? undefined : k < 5 ? "eager" : "lazy"}
                  className={g.plan ? "object-contain p-2" : "object-cover"}
                  style={g.pos ? { objectPosition: g.pos } : undefined}
                />
                {k === 0 && (
                  <span className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-cta px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-paper">Venda em planta</span>
                    <span className="rounded-md bg-paper px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">Projeto aprovado</span>
                  </span>
                )}
                {g.real && (
                  <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-[#0f1822]/80 px-2 py-1 text-[12px] font-semibold text-white">
                    Terreno hoje
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

        {/* Atalhos só sobre a 1.ª foto: desaparecem ao deslizar para as outras se verem inteiras */}
        <div
          className={`absolute bottom-3 left-7 flex gap-1.5 transition-opacity duration-200 lg:left-3 ${atStart ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={!atStart}
        >
          <button onClick={() => setOpen(0)} className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-semibold text-ink shadow-md">
            <IconCamera size={15} /> {GALLERY.length}
          </button>
          <Tour360Button className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-semibold text-ink shadow-md" label="360°" />
          <button onClick={() => setOpen(planIdx)} className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-semibold text-ink shadow-md">
            <IconPlan size={15} /> Plantas
          </button>
        </div>
        <div className="absolute bottom-3 right-3 hidden items-center gap-2 lg:flex">
          <button onClick={() => step(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-paper/95 shadow" aria-label="Anterior"><IconArrowL /></button>
          <button onClick={() => step(1)} className="grid h-10 w-10 place-items-center rounded-full bg-paper/95 shadow" aria-label="Seguinte"><IconArrowR /></button>
        </div>
      </div>

      {open !== null && <Lightbox pics={GALLERY} index={open} zoomable onClose={() => setOpen(null)} />}
    </div>
  );
}
