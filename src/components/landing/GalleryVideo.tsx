"use client";

import { useEffect, useRef, useState } from "react";
import { ev } from "@/lib/analytics";
import { trackOnce } from "@/lib/track";
import { IconPlay } from "../icons";

/**
 * Vídeo vertical na galeria: só carrega quando fica visível, toca sem som e em ciclo.
 * Tocar no vídeo liga o som e recomeça do início.
 */
export default function GalleryVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | undefined>();
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const v = ref.current;
        if (e.isIntersecting) {
          setSrc("/videos/moradias.mp4");
          v?.play().catch(() => {});
        } else v?.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (src) ref.current?.play().catch(() => {});
  }, [src]);

  function withSound() {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    v.play().catch(() => {});
    setSound(true);
    trackOnce("video", "ViewContent", { content_name: "video_moradias" });
    ev("click", "Ver vídeo com som");
  }

  return (
    <div ref={box} className={`relative overflow-hidden rounded-md bg-[#0f1822] snap-start ${className}`}>
      <video
        ref={ref}
        src={src}
        poster="/videos/moradias-poster.webp"
        muted={!sound}
        loop={!sound}
        playsInline
        preload="none"
        controls={sound}
        onEnded={() => setSound(false)}
        className="h-full w-full object-cover"
        aria-label="Vídeo das moradias Domaine XXV"
      />
      {!sound && (
        <button
          type="button"
          onClick={withSound}
          className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-transparent to-transparent p-3 lg:pb-16"
          aria-label="Ver vídeo com som"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold text-ink shadow">
            <IconPlay size={12} /> Ver com som
          </span>
        </button>
      )}
      {!sound && (
        <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-[#0f1822]/80 px-2 py-1 text-[12px] font-semibold text-white">Vídeo</span>
      )}
    </div>
  );
}
