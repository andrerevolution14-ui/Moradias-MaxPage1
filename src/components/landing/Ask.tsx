"use client";

import type { ReactNode } from "react";
import { useLanding, type ComposerPreset } from "./LandingProvider";

/** Botão que abre a caixa de mensagem já pré-preenchida */
export default function Ask({ preset, className = "btn btn-primary", children }: { preset?: ComposerPreset; className?: string; children: ReactNode }) {
  const { openComposer } = useLanding();
  return (
    <button type="button" className={className} onClick={() => openComposer(preset)}>
      {children}
    </button>
  );
}
