"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DEFAULT_LOTS, PROMOTER, type Lot } from "@/lib/config";
import { responseWindow, track } from "@/lib/track";
import { ev, flush } from "@/lib/analytics";
import { IconArrowL, IconCheck, IconDoc, IconWhatsApp } from "@/components/icons";
import GuideCover from "@/components/landing/GuideCover";

const WA_TEXT = "Olá André! Acabei de verificar a disponibilidade no site e gostava de falar sobre os próximos passos para o Domaine XXV.";

const STATUS: Record<string, { label: string; cls: string }> = {
  disponivel: { label: "Disponível", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  reservado: { label: "Reservado", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  vendido: { label: "Vendido", cls: "bg-zinc-100 text-zinc-500 ring-zinc-200" },
};

const SUMMARY = [
  ["Reunião e visita", "Conhece o André, o lote e o projeto aprovado. Sem compromisso."],
  ["Simulação de crédito gratuita", "Estudo de viabilidade bancária: crédito até 90%, libertado por fases."],
  ["Contrato a preço fechado", "335.000 € chave na mão, prazo de 10 meses e penalizações em contrato."],
];

export default function ThankYou() {
  const q = useSearchParams();
  const token = q.get("l");
  const first = (q.get("n") || "").replace(/[<>]/g, "").slice(0, 40);
  const [lots, setLots] = useState<Lot[]>(DEFAULT_LOTS);
  const [when, setWhen] = useState("ainda hoje");

  useEffect(() => {
    setWhen(responseWindow());
    fetch("/api/lots", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.lots && setLots(d.lots))
      .catch(() => {});
    window.scrollTo(0, 0);
  }, []);

  function onWhatsApp() {
    track("Contact", { method: "whatsapp", cta: "obrigado" });
    ev("whatsapp", "obrigado");
    flush(true);
    if (token) {
      const payload = JSON.stringify({ token });
      if (navigator.sendBeacon) navigator.sendBeacon("/api/leads/whatsapp", new Blob([payload], { type: "application/json" }));
      else fetch("/api/leads/whatsapp", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  }

  const available = lots.filter((l) => l.status === "disponivel").length;

  return (
    <main className="min-h-dvh bg-soft pb-12">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-[60px] max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted"><IconArrowL size={18} /> Voltar</Link>
          <span className="font-serif text-[20px] font-semibold tracking-wide">Domaine XXV</span>
          <span className="w-16" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4">
        {/* Passo 2: sucesso */}
        <section className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#2fa863] text-white"><IconCheck size={24} /></span>
            <h1 className="text-[22px] font-bold leading-tight">Pedido enviado{first ? `, ${first}` : ""}!</h1>
          </div>
          <p className="mt-3 text-[16px] leading-relaxed">
            O {PROMOTER.name.split(" ")[0]} já foi notificado e irá confirmar o estado do lote <b>{when}</b>.
          </p>

          <div className="mt-4 rounded-xl bg-soft p-4">
            <div className="text-[13px] font-semibold text-muted">Disponibilidade neste momento</div>
            <ul className="mt-2 grid gap-1.5">
              {lots.map((l) => {
                const s = STATUS[l.status];
                return (
                  <li key={l.id} className="flex items-center justify-between text-[15px]">
                    <span className="font-semibold">{l.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ring-1 ${s.cls}`}>{s.label}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[12.5px] text-muted">
              {available > 0 ? `Restam ${available} de 3. O André confirma consigo a reserva do lote que preferir.` : "Todas reservadas. O André contacta-o se algum lote ficar livre."}
            </p>
          </div>

          <Link
            href={`/guia${token ? `?l=${encodeURIComponent(token)}` : ""}`}
            data-ev="Abrir guia (obrigado)"
            className="mt-5 block rounded-2xl bg-[linear-gradient(135deg,#f3f5f8,#e8eef5)] p-4 ring-1 ring-line transition hover:ring-brand/40"
          >
            <span className="flex items-center gap-4">
              <GuideCover size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#9a7a2e]">O seu guia gratuito</span>
                <span className="mt-0.5 block text-[16px] font-bold leading-snug">12 ferramentas para comprar em planta com segurança</span>
                <span className="mt-1 block text-[12.5px] text-muted">Calculadora · calendário · checklists · cláusulas</span>
              </span>
            </span>
            <span className="btn btn-primary mt-4 w-full py-3 text-[15px]"><IconDoc size={18} /> Abrir Guia Prático</span>
          </Link>
        </section>

        {/* Resumo em 3 passos (lê-se mesmo sem abrir o guia) */}
        <section className="mt-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-semibold">Como funciona, em 3 passos</h2>
          <ol className="mt-3 grid gap-3">
            {SUMMARY.map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cta text-[13px] font-bold text-paper">{i + 1}</span>
                <div>
                  <div className="font-semibold">{t}</div>
                  <div className="text-[14px] leading-snug text-muted">{d}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Passo 3: WhatsApp */}
        <section className="mt-4 rounded-2xl bg-cta p-5 text-paper sm:p-6">
          <div className="flex items-center gap-3">
            <Image src={PROMOTER.avatar} alt={PROMOTER.name} width={52} height={52} className="h-13 w-13 rounded-full object-cover ring-2 ring-white/25" />
            <div className="text-[13px] leading-tight text-white/80">
              <div className="text-[16px] font-bold text-white">{PROMOTER.name}</div>
              Promotor do Domaine XXV
            </div>
          </div>
          <h2 className="mt-4 text-[19px] font-bold leading-snug [text-wrap:balance]">
            Quer garantir a prioridade sobre um dos lotes ou falar diretamente com o promotor?
          </h2>
          <a
            href={`https://wa.me/${PROMOTER.whatsapp}?text=${encodeURIComponent(WA_TEXT)}`}
            target="_blank"
            rel="noopener"
            onClick={onWhatsApp}
            className="btn btn-wa mt-4 w-full whitespace-normal py-4 text-[16px] leading-snug"
          >
            <IconWhatsApp size={22} /> Enviar Mensagem Direta no WhatsApp ao André
          </a>
          <p className="mt-3 text-center text-[12.5px] text-white/70">Ou ligue: <a href={PROMOTER.phoneHref} className="underline">{PROMOTER.phoneDisplay}</a></p>
        </section>

        <p className="mt-6 text-center text-[13px]"><Link href="/" className="text-brand underline">Voltar à página das moradias</Link></p>
      </div>
    </main>
  );
}
