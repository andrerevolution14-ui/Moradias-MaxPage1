"use client";

import { useEffect } from "react";
import { trackOnce } from "@/lib/track";

/** Dispara ViewContent quando secções-chave ficam visíveis (sinal de interesse para o Meta) */
export default function SeenTracker({ ids }: { ids: string[] }) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            trackOnce(`seen-${e.target.id}`, "ViewContent", { content_name: e.target.id, content_type: "home_listing" });
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.35 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return null;
}
