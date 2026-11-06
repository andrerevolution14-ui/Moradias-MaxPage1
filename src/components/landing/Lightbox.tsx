"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IconArrowL, IconArrowR, IconX } from "../icons";

export type Pic = { src: string; alt: string };

/** Versão minúscula (128 px) de cada foto para o fundo de vidro. URL fixo = fica em cache e aparece de imediato. */
export const glassSrc = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=128&q=75`;

/** Pré-carrega os fundos de vidro (≈3 KB cada) quando a página está livre. */
export function preloadGlass(srcs: string[]) {
  if (typeof window === "undefined") return;
  const run = () => srcs.forEach((s) => { const im = new window.Image(); im.decoding = "async"; im.src = glassSrc(s); });
  const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void };
  if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 2500 });
  else setTimeout(run, 1200);
}

/**
 * Visualizador em ecrã inteiro, dentro da página.
 * As fotos ficam lado a lado numa faixa com "snap": o dedo e as setas fazem-nas deslizar suavemente.
 * A foto aberta carrega com prioridade e as vizinhas (±2) são pré-carregadas.
 * Com zoom (botões ou duplo toque).
 */
export default function Lightbox({ pics, index, onClose, zoomable = false }: { pics: Pic[]; index: number; onClose: () => void; zoomable?: boolean }) {
  const [i, setI] = useState(index);
  const [zoom, setZoom] = useState(1);
  const [near, setNear] = useState<Set<number>>(() => new Set([index - 2, index - 1, index, index + 1, index + 2]));
  const track = useRef<HTMLDivElement>(null);
  const current = useRef(index);
  const wheelLock = useRef(0);
  const n = pics.length;
  const zoomed = zoom > 1;

  // Abre logo na foto escolhida, sem animação
  useLayoutEffect(() => {
    const el = track.current;
    if (el) el.scrollLeft = index * el.clientWidth;
  }, [index]);

  // Mantém o encaixe se o ecrã rodar / mudar de tamanho
  useEffect(() => {
    const onResize = () => {
      const el = track.current;
      if (el) el.scrollLeft = current.current * el.clientWidth;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el || !el.clientWidth) return;
    const k = Math.max(0, Math.min(n - 1, Math.round(el.scrollLeft / el.clientWidth)));
    if (k !== current.current) {
      current.current = k;
      setI(k);
      setNear((s) => {
        if ([k - 2, k - 1, k, k + 1, k + 2].every((x) => s.has(x))) return s;
        const next = new Set(s);
        [k - 2, k - 1, k, k + 1, k + 2].forEach((x) => next.add(x));
        return next;
      });
    }
  }, [n]);

  const go = useCallback((d: number) => {
    const el = track.current;
    if (!el) return;
    const k = Math.max(0, Math.min(n - 1, current.current + d));
    el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" });
  }, [n]);

  // Roda do rato (computador): uma volta = uma foto, com deslize suave
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (zoomed) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 8) return;
      e.preventDefault();
      const now = Date.now();
      if (now - wheelLock.current < 450) return;
      wheelLock.current = now;
      go(d > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [go, zoomed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (zoomed) return;
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
  }, [go, onClose, zoomed]);

  const pic = pics[i];

  return (
    <div className="fade-in fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#1d1f22]" role="dialog" aria-modal="true" aria-label={pic.alt}>
      {/* Vidro líquido: a própria foto, muito desfocada, por trás de um véu translúcido */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {pics.map((p, k) =>
          near.has(k) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.src}
              src={glassSrc(p.src)}
              alt=""
              decoding="async"
              className={`glass-bg absolute -inset-[12%] h-[124%] w-[124%] object-cover transition-opacity duration-300 ${k === i ? "opacity-100" : "opacity-0"}`}
            />
          ) : null,
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,24,34,0.35),rgba(15,24,34,0.55))]" />
      </div>

      <div className="relative flex items-center justify-between gap-3 px-4 pb-2 pt-[max(env(safe-area-inset-top),12px)] text-sm text-white">
        <span className="glass truncate rounded-full px-3 py-1.5">{n > 1 && `${i + 1} / ${n} · `}{pic.alt}</span>
        <div className="flex shrink-0 items-center gap-2">
          {zoomable && (
            <>
              <button onClick={() => setZoom((z) => Math.max(1, z - 1))} disabled={!zoomed} className="glass grid h-10 w-10 place-items-center rounded-full text-xl text-white disabled:opacity-40" aria-label="Reduzir">−</button>
              <button onClick={() => setZoom((z) => Math.min(4, z + 1))} disabled={zoom >= 4} className="glass grid h-10 w-10 place-items-center rounded-full text-xl text-white disabled:opacity-40" aria-label="Ampliar">+</button>
            </>
          )}
          <button onClick={onClose} className="glass grid h-10 w-10 place-items-center rounded-full text-white" aria-label="Fechar"><IconX /></button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        {/* Faixa de fotos: desliza com o dedo, roda do rato ou setas */}
        <div
          ref={track}
          onScroll={onScroll}
          onDoubleClick={() => zoomable && setZoom(2.5)}
          className={`no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain ${zoomed ? "invisible" : ""}`}
        >
          {pics.map((p, k) => (
            <div key={p.src} className="relative h-full w-full shrink-0 snap-center snap-always">
              {near.has(k) && (
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="100vw"
                  quality={85}
                  priority={k === index}
                  loading={k === index ? undefined : "eager"}
                  draggable={false}
                  className="select-none object-contain"
                />
              )}
            </div>
          ))}
        </div>

        {/* Zoom: a foto atual em tamanho grande, arrastável */}
        {zoomed && (
          <div className="absolute inset-0 overflow-auto" onDoubleClick={() => setZoom(1)}>
            <div style={{ width: `${zoom * 100}%` }} className="min-h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pic.src} alt={pic.alt} className="block h-auto w-full" />
            </div>
          </div>
        )}

        {n > 1 && !zoomed && (
          <>
            {i > 0 && (
              <button onClick={() => go(-1)} className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white transition glass hover:brightness-125" aria-label="Anterior"><IconArrowL /></button>
            )}
            {i < n - 1 && (
              <button onClick={() => go(1)} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white transition glass hover:brightness-125" aria-label="Seguinte"><IconArrowR /></button>
            )}
          </>
        )}
      </div>
      {zoomable && !zoomed && <p className="relative pb-[max(env(safe-area-inset-bottom),12px)] pt-2 text-center text-[12px] text-white/75">Deslize para ver as outras · toque duas vezes para ampliar</p>}
    </div>
  );
}
