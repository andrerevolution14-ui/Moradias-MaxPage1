"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrowL, IconArrowR, IconX } from "../icons";

export type Pic = { src: string; alt: string };

/** Visualizador em ecrã inteiro, dentro da página. Com zoom (botões, duplo toque) e deslizar entre imagens. */
export default function Lightbox({ pics, index, onClose, zoomable = false }: { pics: Pic[]; index: number; onClose: () => void; zoomable?: boolean }) {
  const [i, setI] = useState(index);
  const [zoom, setZoom] = useState(1);
  const touch = useRef<number | null>(null);
  const n = pics.length;

  const go = useCallback((d: number) => {
    setZoom(1);
    setI((x) => (x + d + n) % n);
  }, [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
  }, [go, onClose]);

  const pic = pics[i];
  const zoomed = zoom > 1;

  return (
    <div className="fade-in fixed inset-0 z-[60] flex flex-col bg-[#0f1822]" role="dialog" aria-modal="true" aria-label={pic.alt}>
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(env(safe-area-inset-top),12px)] text-sm text-white/80">
        <span className="truncate">{n > 1 && `${i + 1} / ${n} · `}{pic.alt}</span>
        <div className="flex shrink-0 items-center gap-2">
          {zoomable && (
            <>
              <button onClick={() => setZoom((z) => Math.max(1, z - 1))} disabled={!zoomed} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl text-white disabled:opacity-40" aria-label="Reduzir">−</button>
              <button onClick={() => setZoom((z) => Math.min(4, z + 1))} disabled={zoom >= 4} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl text-white disabled:opacity-40" aria-label="Ampliar">+</button>
            </>
          )}
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white" aria-label="Fechar"><IconX /></button>
        </div>
      </div>

      <div
        className={`relative flex-1 ${zoomed ? "overflow-auto" : "overflow-hidden"}`}
        onTouchStart={(e) => { if (!zoomed) touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touch.current === null || zoomed) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50 && n > 1) go(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
        onDoubleClick={() => zoomable && setZoom((z) => (z > 1 ? 1 : 2.5))}
      >
        {zoomed ? (
          <div style={{ width: `${zoom * 100}%` }} className="min-h-full">
            {/* Em zoom usamos a imagem original para máxima nitidez */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pic.src} alt={pic.alt} className="block h-auto w-full" />
          </div>
        ) : (
          <Image key={pic.src} src={pic.src} alt={pic.alt} fill sizes="100vw" quality={75} className="object-contain" />
        )}
        {n > 1 && !zoomed && (
          <>
            <button onClick={() => go(-1)} className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white" aria-label="Anterior"><IconArrowL /></button>
            <button onClick={() => go(1)} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white" aria-label="Seguinte"><IconArrowR /></button>
          </>
        )}
      </div>
      {zoomable && !zoomed && <p className="pb-[max(env(safe-area-inset-bottom),12px)] pt-2 text-center text-[12px] text-white/60">Toque duas vezes ou use + para ampliar</p>}
    </div>
  );
}
