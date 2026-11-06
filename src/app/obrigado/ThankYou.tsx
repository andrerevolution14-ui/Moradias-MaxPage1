"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BUILDER, DEFAULT_LOTS, PROJECT, PROMOTER, formatEUR, type Lot } from "@/lib/config";
import { responseWindow, track } from "@/lib/track";
import { IconArrowL, IconCheck, IconChevron, IconDoc, IconKey, IconWhatsApp } from "@/components/icons";

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

const down = formatEUR(PROJECT.price * PROJECT.downPaymentPct);

const GUIDE: { t: string; p: string[] }[] = [
  {
    t: "1. Reunião e visita ao terreno",
    p: [
      "Começa por uma conversa com o André, o promotor do projeto: o que procura, o seu prazo e a sua situação de financiamento.",
      "Visita o lote em Oliveirinha, vê o projeto aprovado pela Câmara Municipal de Aveiro e esclarece todas as dúvidas. Sem custos e sem compromisso.",
    ],
  },
  {
    t: "2. Simulação de crédito gratuita",
    p: [
      "Antes de assumir qualquer compromisso, faz um estudo de viabilidade bancária gratuito, acompanhado por uma intermediária de crédito habilitada.",
      "Numa compra em planta, o crédito habitação pode financiar até 90%. O banco liberta o dinheiro por fases, à medida que a obra avança, segundo as suas avaliações.",
    ],
  },
  {
    t: "3. Reserva e contrato-promessa (CPCV)",
    p: [
      `Com o crédito encaminhado, reserva a moradia com uma única entrada de 10% (${down}), imputada ao preço total de ${formatEUR(PROJECT.price)}.`,
      "O contrato define as condições de devolução do sinal, incluindo se o financiamento não for aprovado.",
    ],
  },
  {
    t: "4. Escritura do terreno em seu nome",
    p: ["O lote é escriturado em seu nome antes de a obra começar. Desde esse dia é o proprietário do terreno onde a sua casa vai ser construída."],
  },
  {
    t: "5. Construção a preço fechado",
    p: [
      `Construção em aço leve (LSF) pelo ${BUILDER.name}, ao preço fechado no contrato de empreitada, com prazo de 10 meses e penalizações por atrasos imputáveis à construtora.`,
      "Cerca de 33.500 € do preço só são pagos na fase final (retenção de boa execução). Não é um custo adicional.",
      "Pode levar o seu engenheiro para fiscalizar a obra, com agendamento e regras de segurança.",
    ],
  },
  {
    t: "6. Entrega das chaves e garantias",
    p: ["Recebe a moradia pronta a habitar, com as garantias legais e contratuais por escrito e o procedimento de assistência."],
  },
];

const CHECKLIST = [
  "O projeto já está aprovado pela Câmara?",
  "O terreno fica em meu nome antes da obra?",
  "O preço é fechado em contrato, com tudo o que inclui discriminado?",
  "Há penalizações se a obra atrasar?",
  "Posso ver as minutas dos contratos antes de assinar?",
  "Posso levar um engenheiro independente à obra?",
];

export default function ThankYou() {
  const q = useSearchParams();
  const token = q.get("l");
  const first = (q.get("n") || "").replace(/[<>]/g, "").slice(0, 40);
  const [lots, setLots] = useState<Lot[]>(DEFAULT_LOTS);
  const [when, setWhen] = useState("ainda hoje");
  const [guideOpen, setGuideOpen] = useState(false);

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

          <button
            onClick={() => {
              setGuideOpen(true);
              track("ViewContent", { content_name: "guia_compra_planta" });
              setTimeout(() => document.getElementById("guia")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
            }}
            className="btn btn-primary mt-5 w-full py-4 text-[16px]"
          >
            <IconDoc size={20} /> Abrir Guia Prático
          </button>
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

        {/* Guia completo, na própria página */}
        <section id="guia" className="mt-4 scroll-mt-4 rounded-2xl border border-line bg-white">
          <button onClick={() => setGuideOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 p-5 text-left sm:p-6" aria-expanded={guideOpen}>
            <span>
              <span className="eyebrow">Guia prático</span>
              <span className="mt-1 block text-[18px] font-bold leading-snug">Como Comprar em Planta com Segurança</span>
            </span>
            <IconChevron size={20} className={`shrink-0 text-muted transition ${guideOpen ? "rotate-180" : ""}`} />
          </button>
          {guideOpen && (
            <div className="fade-in space-y-5 border-t border-line px-5 pb-6 pt-5 sm:px-6">
              {GUIDE.map((g) => (
                <div key={g.t}>
                  <h3 className="font-semibold">{g.t}</h3>
                  {g.p.map((x) => (
                    <p key={x} className="mt-1.5 text-[15px] leading-relaxed text-[#2b3540]">{x}</p>
                  ))}
                </div>
              ))}
              <div className="rounded-xl bg-brand-soft p-4">
                <h3 className="flex items-center gap-2 font-semibold text-brand-ink"><IconKey size={18} /> Perguntas a fazer a qualquer promotor</h3>
                <ul className="mt-2 space-y-1.5 text-[14.5px] text-brand-ink">
                  {CHECKLIST.map((c) => (
                    <li key={c} className="flex items-start gap-2"><IconCheck size={16} className="mt-0.5 shrink-0" /> {c}</li>
                  ))}
                </ul>
                <p className="mt-2 text-[13px] text-brand-ink/80">No Domaine XXV, a resposta a todas é sim.</p>
              </div>
              <p className="text-[12px] leading-snug text-muted">
                Informação indicativa. As condições aplicáveis são as dos contratos assinados. Crédito sujeito a aprovação bancária.
              </p>
            </div>
          )}
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
