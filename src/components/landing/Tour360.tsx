"use client";

import { useEffect, useState } from "react";
import { PROJECT } from "@/lib/config";
import { trackOnce } from "@/lib/track";
import { Icon360, IconX } from "../icons";

/** Abre a visita virtual 360° dentro da página (sem sair do site) */
export default function Tour360Button({ className, label = "Visita 360°", children }: { className?: string; label?: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setOpen(true);
          trackOnce("tour360", "ViewContent", { content_name: "visita_360" });
        }}
      >
        {children ?? (<><Icon360 size={16} /> {label}</>)}
      </button>
      {open && (
        <div className="fade-in fixed inset-0 z-[60] flex flex-col bg-[#0f1822]" role="dialog" aria-modal="true" aria-label="Visita virtual 360°">
          <div className="flex items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),12px)] text-sm text-white/85">
            <span>Visita virtual 360° · arraste para olhar à volta</span>
            <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white" aria-label="Fechar"><IconX /></button>
          </div>
          <iframe src={PROJECT.tour360} title="Visita virtual 360°" className="w-full flex-1 border-0" allow="fullscreen; gyroscope; accelerometer" />
        </div>
      )}
    </>
  );
}
