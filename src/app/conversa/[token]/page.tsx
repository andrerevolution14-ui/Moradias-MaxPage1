import type { Metadata } from "next";
import { Suspense } from "react";
import ChatView from "./ChatView";

export const metadata: Metadata = {
  title: "A sua conversa · Domaine XXV",
  robots: { index: false, follow: false },
};

export default function ConversaPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">A carregar…</div>}>
      <ChatView />
    </Suspense>
  );
}
