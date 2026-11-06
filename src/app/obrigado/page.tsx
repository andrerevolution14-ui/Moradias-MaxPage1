import type { Metadata } from "next";
import { Suspense } from "react";
import ThankYou from "./ThankYou";

export const metadata: Metadata = {
  title: "Pedido enviado · Domaine XXV",
  robots: { index: false, follow: false },
};

export default function ObrigadoPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">A carregar…</div>}>
      <ThankYou />
    </Suspense>
  );
}
