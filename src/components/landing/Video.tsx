"use client";

import { useRef, useState } from "react";
import { trackOnce } from "@/lib/track";
import { IconPlay } from "../icons";

export default function Video() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
      <video
        ref={ref}
        src="/videos/apresentacao.mp4"
        poster="/images/exterior-capa.webp"
        playsInline
        preload="none"
        controls={playing}
        className="h-full w-full object-cover"
        onPlay={() => trackOnce("video", "ViewContent", { content_name: "video_apresentacao" })}
      />
      {!playing && (
        <button
          className="absolute inset-0 grid place-items-center bg-black/25 transition hover:bg-black/35"
          onClick={() => {
            setPlaying(true);
            ref.current?.play();
          }}
          aria-label="Ver vídeo de apresentação"
        >
          <span className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-ink shadow-lg">
            <IconPlay size={16} /> Ver vídeo · 0:12
          </span>
        </button>
      )}
    </div>
  );
}
