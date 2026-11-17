"use client";

import { useEffect, useRef, useState } from "react";
import { IconPin } from "../icons";

/** Mapa que não "prende" o scroll no telemóvel: só fica interativo depois de um toque. */
export default function MapEmbed({ src, title }: { src: string; title: string }) {
  const [active, setActive] = useState(false);
  // O mapa do Google pesa ~400 KB: só carrega quando a pessoa chega perto dele
  const [near, setNear] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="relative h-full w-full bg-soft" onMouseLeave={() => setActive(false)}>
      {near && <iframe src={src} title={title} loading="lazy" className="absolute inset-0 h-full w-full border-0" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />}
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
