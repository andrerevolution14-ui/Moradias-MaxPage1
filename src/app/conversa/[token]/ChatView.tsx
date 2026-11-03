"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROMOTER, PROJECT, formatEUR } from "@/lib/config";
import { saveChat, responseWindow, track } from "@/lib/track";
import { IconArrowL, IconPhone, IconSend, IconWhatsApp } from "@/components/icons";

type Msg = { id: number; sender: "lead" | "admin"; body: string; created_at: string };

const fmt = (d: string) =>
  new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Lisbon" }).format(new Date(d));

export default function ChatView() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{ firstName: string; messages: Msg[] } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [when, setWhen] = useState("ainda hoje");
  const endRef = useRef<HTMLDivElement>(null);
  const count = useRef(0);

  const load = useCallback(async () => {
    const r = await fetch(`/api/conversa/${token}`, { cache: "no-store" });
    if (r.status === 404) return setNotFound(true);
    if (!r.ok) return;
    const d = await r.json();
    setData(d);
    saveChat(token, d.firstName);
  }, [token]);

  useEffect(() => {
    setWhen(responseWindow());
    load();
    const iv = setInterval(() => document.visibilityState === "visible" && load(), 12000);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  useEffect(() => {
    const n = data?.messages.length || 0;
    if (n !== count.current) {
      count.current = n;
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setErr("");
    const r = await fetch(`/api/conversa/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: text }) });
    setSending(false);
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      return setErr(d.error || "Não foi possível enviar.");
    }
    setText("");
    load();
  }

  if (notFound) {
    return (
      <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 text-center">
        <div>
          <h1 className="text-xl font-bold">Conversa não encontrada</h1>
          <p className="mt-2 text-muted">O link pode estar incompleto. Fale connosco diretamente:</p>
          <a href={`https://wa.me/${PROMOTER.whatsapp}`} className="btn btn-wa mt-4"><IconWhatsApp size={18} /> WhatsApp</a>
        </div>
      </div>
    );
  }

  const answered = data?.messages.some((m) => m.sender === "admin");

  return (
    <div className="flex h-dvh flex-col bg-soft">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-3 py-2.5">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-full hover:bg-soft" aria-label="Voltar ao imóvel"><IconArrowL /></Link>
          <Image src={PROMOTER.avatar} alt={PROMOTER.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="font-bold">{PROMOTER.name}</div>
            <div className="truncate text-[12.5px] text-muted">Promotor · Domaine XXV</div>
          </div>
          <a href={PROMOTER.phoneHref} onClick={() => track("Contact", { method: "call", cta: "chat" })} className="grid h-10 w-10 place-items-center rounded-full bg-soft" aria-label="Ligar"><IconPhone size={18} /></a>
          <a href={`https://wa.me/${PROMOTER.whatsapp}`} target="_blank" rel="noopener" onClick={() => track("Contact", { method: "whatsapp", cta: "chat" })} className="grid h-10 w-10 place-items-center rounded-full bg-wa text-white" aria-label="WhatsApp"><IconWhatsApp size={18} /></a>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-3 px-3 py-4">
          <Link href="/" className="flex items-center gap-3 rounded-xl border border-line bg-white p-2.5">
            <Image src="/images/exterior-capa.webp" alt="" width={84} height={56} className="h-14 w-[84px] rounded-lg object-cover" />
            <div className="min-w-0 text-[13.5px] leading-tight">
              <div className="font-semibold">Moradia T3 com jardim · Oliveirinha</div>
              <div className="text-muted">{formatEUR(PROJECT.price)} chave na mão · ver imóvel</div>
            </div>
          </Link>

          {!data && <p className="py-10 text-center text-muted">A carregar a conversa…</p>}

          {data?.messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "lead" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm ${m.sender === "lead" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-white"}`}>
                <div className="whitespace-pre-wrap break-words">{m.body}</div>
                <div className={`mt-1 text-right text-[11px] ${m.sender === "lead" ? "text-white/70" : "text-muted"}`}>{fmt(m.created_at)}</div>
              </div>
            </div>
          ))}

          {data && !answered && (
            <div className="rounded-xl border border-brand/20 bg-brand-soft p-3.5 text-[14px] leading-relaxed text-brand-ink">
              <b>{data.firstName}, a sua mensagem chegou ao André.</b> Vai contactá-lo {when}, por telefone ou aqui por escrito.
              {" "}Pode fechar esta página — este link fica sempre disponível.
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={send} className="border-t border-line bg-white pb-[max(env(safe-area-inset-bottom),8px)]">
        {err && <p className="mx-auto max-w-2xl px-3 pt-2 text-sm text-orange-700">{err}</p>}
        <div className="mx-auto flex max-w-2xl items-end gap-2 px-3 pt-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(min-width: 768px)").matches) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement).requestSubmit();
              }
            }}
            rows={1}
            placeholder="Escreva uma mensagem…"
            className="field max-h-40 min-h-[46px] flex-1 resize-none"
          />
          <button disabled={sending || !text.trim()} className="btn btn-primary h-[46px] w-[46px] p-0 disabled:opacity-50" aria-label="Enviar"><IconSend size={18} /></button>
        </div>
      </form>
    </div>
  );
}
