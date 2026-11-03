"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LOTS, type Lot } from "@/lib/config";
import { loadChat } from "@/lib/track";

export type ComposerPreset = { intent?: string; lot?: string; text?: string; cta?: string };

type Ctx = {
  lots: Lot[];
  available: number;
  sheetOpen: boolean;
  preset: ComposerPreset | null;
  presetKey: number;
  openComposer: (p?: ComposerPreset) => void;
  closeSheet: () => void;
  chat: { token: string; firstName: string } | null;
  setChat: (c: { token: string; firstName: string } | null) => void;
};

const LandingCtx = createContext<Ctx | null>(null);

export function useLanding() {
  const c = useContext(LandingCtx);
  if (!c) throw new Error("useLanding fora do LandingProvider");
  return c;
}

export default function LandingProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<Lot[]>(DEFAULT_LOTS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [preset, setPreset] = useState<ComposerPreset | null>(null);
  const [presetKey, setPresetKey] = useState(0);
  const [chat, setChat] = useState<{ token: string; firstName: string } | null>(null);

  useEffect(() => {
    setChat(loadChat());
    fetch("/api/lots")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.lots && setLots(d.lots))
      .catch(() => {});
  }, []);

  const openComposer = useCallback((p?: ComposerPreset) => {
    setPreset(p || null);
    setPresetKey((k) => k + 1);
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (desktop) {
      document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => document.querySelector<HTMLTextAreaElement>("#contacto textarea")?.focus({ preventScroll: true }), 450);
    } else {
      setSheetOpen(true);
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lots,
      available: lots.filter((l) => l.status === "disponivel").length,
      sheetOpen,
      preset,
      presetKey,
      openComposer,
      closeSheet: () => setSheetOpen(false),
      chat,
      setChat,
    }),
    [lots, sheetOpen, preset, presetKey, openComposer, chat],
  );

  return <LandingCtx.Provider value={value}>{children}</LandingCtx.Provider>;
}
