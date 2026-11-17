"use client";

import { useLanding } from "./LandingProvider";

/** Escassez real: lotes livres (do painel /leads → Lotes) + visitas ao terreno esta semana */
export default function Urgency({ className = "" }: { className?: string }) {
  const { available } = useLanding();
  return (
    <p className={`flex items-center gap-2 text-[13px] font-semibold text-[#9a3412] ${className}`}>
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
      </span>
      <span>
        {available > 0 ? `Restam ${available} de 3 moradias` : "As 3 moradias estão reservadas"} · Visitas ao terreno disponíveis esta semana
      </span>
    </p>
  );
}
