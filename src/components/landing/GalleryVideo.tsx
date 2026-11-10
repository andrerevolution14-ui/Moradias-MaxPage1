"use client";

import { useEffect, useRef, useState } from "react";
import { ev } from "@/lib/analytics";
import { trackOnce } from "@/lib/track";
import { IconPlay, IconX } from "../icons";

const SRC = "/videos/moradias.mp4";
const POSTER = "/videos/moradias-poster.webp";

/**
 * Vídeo vertical na galeria: só carrega quando fica visível, toca sem som e em ciclo.
 * Tocar abre o vídeo em ecrã inteiro, inteiro (sem cortes), com som e controlos.
 */
export default function GalleryVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | undefined>();
  const [open, setOpen] = useState(false);

  // Pré-visualização na galeria
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const v = ref.current;
        if (e.isIntersecting) {
          setSrc(SRC);
          v?.play().catch(() => {});
        } else v?.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (src && !open) ref.current?.play().catch(() => {});
  }, [src, open]);

  function openPlayer() {
    ref.current?.pause();
    setOpen(true);
    trackOnce("video", "ViewContent", { content_name: "video_moradias" });
    ev("click", "Ver vídeo");
  }

  return (
    <>
      <div ref={box} className={`relative overflow-hidden rounded-md bg-[#0f1822] snap-start ${className}`}>
        <video ref={ref} src={src} poster={POSTER} muted loop playsInline preload="none" className="h-full w-full object-cover" aria-hidden />
        <button
          type="button"
          onClick={openPlayer}
          className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-transparent to-transparent p-3 lg:pb-16"
          aria-label="Ver vídeo em ecrã inteiro, com som"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold text-ink shadow">
            <IconPlay size={12} /> Ver vídeo
          </span>
        </button>
        <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-[#0f1822]/80 px-2 py-1 text-[12px] font-semibold text-white">Vídeo</span>
      </div>
      {open && <VideoPlayer onClose={() => setOpen(false)} />}
    </>
  );
}

/** Leitor em ecrã inteiro: vídeo inteiro (object-contain), fundo de vidro líquido, som e controlos. */
function VideoPlayer({ onClose }: { onClose: () => void }) {
  const v = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const el = v.current;
    if (el) {
      el.currentTime = 0;
      el.play().catch(() => {
        // Alguns browsers bloqueiam som sem gesto: toca sem som, os controlos permitem ligar
        el.muted = true;
        el.play().catch(() => {});
      });
    }
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fade-in fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#1d1f22]" role="dialog" aria-modal="true" aria-label="Vídeo das moradias">
      {/* vidro líquido */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSTER} alt="" className="glass-bg absolute -inset-[12%] h-[124%] w-[124%] object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,24,34,0.35),rgba(15,24,34,0.6))]" />
      </div>
      <div className="relative flex items-center justify-between gap-3 px-4 pb-2 pt-[max(env(safe-area-inset-top),12px)] text-sm text-white">
        <span className="glass rounded-full px-3 py-1.5">Domaine XXV · vídeo</span>
        <button onClick={onClose} className="glass grid h-10 w-10 place-items-center rounded-full text-white" aria-label="Fechar"><IconX /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-[max(env(safe-area-inset-bottom),12px)]">
        <video
          ref={v}
          src={SRC}
          poster={POSTER}
          playsInline
          controls
          preload="auto"
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}
