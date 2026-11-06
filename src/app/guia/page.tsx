import type { Metadata } from "next";
import { Suspense } from "react";
import Guide from "./Guide";

export const metadata: Metadata = {
  title: "12 ferramentas para comprar em planta com segurança · Domaine XXV",
  description: "Os 7 passos, a checklist de documentos, os sinais de alerta e os custos de uma compra em planta em Portugal.",
  robots: { index: false, follow: false },
};

export default function GuiaPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">A carregar…</div>}>
      <Guide />
    </Suspense>
  );
}
