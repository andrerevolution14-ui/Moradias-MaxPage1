import Image from "next/image";
import Link from "next/link";
import {
  BUILDER, DISTANCES, FAQ, LOT_SPEC, PLANS, PROJECT, PROMOTER, ROOMS, TESTIMONIALS, WORKS, formatEUR,
} from "@/lib/config";
import {
  IconArea, IconBath, IconBed, IconCar, IconCheck, IconChevron, IconClock, IconDoc, IconHammer, IconKey,
  IconLock, IconPin, IconShield, IconStar, IconTree,
} from "@/components/icons";
import LandingProvider from "@/components/landing/LandingProvider";
import Gallery from "@/components/landing/Gallery";
import DirectContact from "@/components/landing/DirectContact";
import ContactDialog from "@/components/landing/ContactDialog";
import LotsTable from "@/components/landing/LotsTable";
import Simulator, { MonthlyFrom } from "@/components/landing/Simulator";
import Ask from "@/components/landing/Ask";
import SeenTracker from "@/components/landing/SeenTracker";
import Tour360Button from "@/components/landing/Tour360";
import { PlansGrid, WorksStrip } from "@/components/landing/PicStrip";

const NAV = [
  ["localizacao", "Localização"],
  ["unidades", "Moradias"],
  ["plantas", "Plantas"],
  ["condicoes", "Como comprar"],
  ["simulador", "Simulador"],
  ["faq", "Perguntas"],
];

export default function Page() {
  return (
    <LandingProvider>
      <Header />

      <main className="pb-28 lg:pb-0">
        <div className="mx-auto max-w-[1200px] lg:px-6 lg:pt-5">
          <Gallery />
        </div>

        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-6">
          <div className="min-w-0">
            <nav className="no-scrollbar sticky top-[60px] z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-paper/95 px-4 backdrop-blur lg:mx-0 lg:px-0">
              {NAV.map(([id, label]) => (
                <a key={id} href={`#${id}`} className="shrink-0 border-b-2 border-transparent px-2.5 py-3 text-[14px] font-medium text-muted hover:border-ink hover:text-ink">
                  {label}
                </a>
              ))}
            </nav>
            <Summary />


            <Description />
            <Location />

            <section id="unidades" className="sec">
              <h2 className="sec-title">Moradias disponíveis</h2>
              <LotsTable />
            </section>

            <Plans />
            <Details />
            <BuyInPlan />

            <section id="simulador" className="sec">
              <h2 className="sec-title">Simulador de crédito habitação</h2>
              <p className="-mt-2 mb-4 text-[15px] text-muted">Quanto ficaria a pagar por mês, com a entrada fixa de 10%.</p>
              <Simulator />
            </section>

            <Builder />
            <Testimonials />
            <Faq />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-[76px] pt-6">
              <ContactCard />
            </div>
          </aside>
        </div>

        <PromoterBlock />
        <Footer />
      </main>

      <ContactDialog />
      <SeenTracker ids={["unidades", "condicoes", "simulador", "plantas", "localizacao"]} />
    </LandingProvider>
  );
}

/* =================================================================== */

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between gap-4 px-4 lg:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-[22px] font-semibold tracking-wide">Domaine XXV</span>
          <span className="hidden text-[12px] text-muted sm:inline">Oliveirinha · Aveiro</span>
        </Link>
        <Ask className="btn btn-primary hidden px-4 py-2 text-sm lg:inline-flex" preset={{ cta: "header" }}>Enviar mensagem</Ask>
        <a href={`https://wa.me/${PROMOTER.whatsapp}`} target="_blank" rel="noopener" className="btn btn-ghost px-3 py-2 text-sm lg:hidden">WhatsApp</a>
      </div>
    </header>
  );
}

function Summary() {
  const facts = [
    [IconBed, "T3", LOT_SPEC.t4Note],
    [IconArea, LOT_SPEC.usefulArea, "área útil"],
    [IconTree, LOT_SPEC.garden, "jardim privativo"],
    [IconBath, `${LOT_SPEC.bathrooms} WC`, "1 em suite"],
    [IconCar, "Garagem", "coberta + exterior"],
    [IconClock, "10 meses", "de construção"],
  ] as const;
  return (
    <section className="pt-4">
      <h1 className="text-[23px] font-bold leading-tight tracking-tight [text-wrap:balance] sm:text-[32px]">
        Moradia T3 com jardim em Oliveirinha, Aveiro
      </h1>
      <p className="mt-1.5 flex items-start gap-1.5 text-[15px] text-muted">
        <IconPin size={16} className="mt-[3px] shrink-0" />
        <span>{PROJECT.address}, {PROJECT.postal} · <a href="#localizacao" className="underline">ver mapa</a></span>
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <div className="text-[32px] font-extrabold leading-none tracking-tight tabular-nums sm:text-[42px]">{formatEUR(PROJECT.price)}</div>
          <div className="mt-1.5 text-[13.5px] font-semibold text-brand">IMT e Imposto de Selo incluídos · chave na mão</div>
        </div>
        <div className="border-l border-line pl-6 text-[14px] leading-relaxed text-muted">
          Entrada de 10%: <b className="text-ink">{formatEUR(PROJECT.price * PROJECT.downPaymentPct)}</b>
          <br />
          Prestação de cerca de <a href="#simulador" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-2"><MonthlyFrom />/mês</a>*
        </div>
      </div>


      <div className="mt-5 flex items-center gap-3 rounded-xl bg-brand-soft px-4 py-3 text-[14px] leading-snug text-brand-ink">
        <IconKey size={20} className="shrink-0 text-brand" />
        <p>
          <b>Venda em planta, com possibilidade de crédito habitação.</b>{" "}
          <a href="#simulador" className="font-semibold underline">Simular prestação</a>
        </p>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
        {facts.map(([Icon, v, l]) => (
          <li key={l} className="flex items-center gap-3 bg-white px-3.5 py-3">
            <Icon size={22} className="shrink-0 text-brand" />
            <div className="leading-tight">
              <div className="font-bold">{v}</div>
              <div className="text-[12.5px] text-muted">{l}</div>
            </div>
          </li>
        ))}
      </ul>

      {/* Contacto rápido no telemóvel, logo acima da dobra */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 lg:hidden">
        <Image src={PROMOTER.avatar} alt={PROMOTER.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="font-bold">{PROMOTER.name}</div>
          <div className="text-[13px] text-muted">Promotor · responde no próprio dia</div>
        </div>
        <Ask className="btn btn-primary px-3.5 py-2.5 text-sm" preset={{ cta: "summary_mobile", intent: "visita" }}>Marcar visita</Ask>
      </div>
    </section>
  );
}

function Description() {
  return (
    <section id="descricao" className="sec border-t-0">
      <div className="max-w-[64ch] space-y-4 text-[16px] leading-[1.75] text-[#2b3540]">
        <p className="font-serif text-[22px] leading-snug text-ink [text-wrap:balance]">
          Em Aveiro, quase sempre se escolhe dois: espaço, localização ou preço. Aqui não tem de abdicar de nenhum.
        </p>
        <p>
          Três moradias lado a lado, numa rua tranquila de Oliveirinha. A oito minutos do centro de Aveiro e a dois da A17 e da A25.
        </p>
        <p>
          No rés-do-chão, cozinha e sala abrem-se para um <b>jardim privativo de 82 m²</b> com barbecue. Garagem coberta, espaço exterior à frente
          e um anexo de 19 m². É também aqui que pode ter a <b>opção T4</b>, sem alterar o preço.
        </p>
        <p>
          Em cima, uma suite, dois quartos e casa de banho completa. E um <b>sótão de 34 m²</b> para escritório, quarto de brincar ou arrumação.
        </p>
        <p>
          Entregue pronta a habitar: cozinha equipada, ar condicionado, bomba de calor A+ e caixilharia com corte térmico. Os acabamentos escolhe-os consigo.
        </p>
      </div>
    </section>
  );
}

function Location() {
  return (
    <section id="localizacao" className="sec">
      <h2 className="sec-title">Localização</h2>
      <p className="-mt-2 mb-4 text-[15px] text-muted">{PROJECT.address}, {PROJECT.postal}</p>
      <div className="relative h-[380px] overflow-hidden rounded-xl border border-line bg-soft sm:h-[440px]">
        <iframe src={PROJECT.mapEmbed} title="Mapa: Domaine XXV em Oliveirinha, Aveiro" loading="lazy" className="absolute inset-0 h-full w-full border-0" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DISTANCES.map(([t, p]) => (
          <li key={p} className="rounded-xl bg-soft px-3.5 py-3">
            <div className="text-lg font-bold tabular-nums text-brand">{t}</div>
            <div className="text-[13.5px] leading-snug">{p}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Plans() {
  return (
    <section id="plantas" className="sec">
      <h2 className="sec-title">Plantas e divisões</h2>
      <PlansGrid pics={PLANS} />
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {ROOMS.map((r) => (
          <div key={r.floor} className="rounded-xl bg-soft p-4">
            <div className="eyebrow mb-2">{r.floor === "Piso 0" ? "Rés-do-chão" : r.floor}</div>
            <ul className="space-y-1.5 text-[14px]">
              {r.items.map(([n, a]) => (
                <li key={n} className="flex justify-between gap-3"><span>{n}</span><span className="shrink-0 font-semibold tabular-nums">{a}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Tour360Button className="btn btn-ghost" label="Visita virtual 360°" />
        <Ask className="btn btn-ghost" preset={{ intent: "plantas", cta: "plantas" }}>Pedir caderno de acabamentos</Ask>
      </div>
    </section>
  );
}

function Details() {
  const rows = [
    ["Tipologia", "T3 · opção T4 no rés-do-chão"],
    ["Área útil habitável", "~146,34 m²"],
    ["Área bruta privativa", "~180 m²"],
    ["Área dependente", "77,65 m²"],
    ["Jardim privativo", "~82 m²"],
    ["Pisos", "R/C + 1.º piso + sótão"],
    ["Estado", "Venda em planta · projeto aprovado"],
    ["Financiamento", "Crédito habitação até 90%"],
    ["Construtora", BUILDER.name],
  ];
  const features = [
    "Cozinha totalmente equipada", "Ar condicionado multi-split", "Bomba de calor A+", "Corte térmico e vidro duplo",
    "Jardim com barbecue", "Garagem coberta", "Anexo / arrumos", "Suite", "Acabamentos à escolha",
  ];
  return (
    <section id="detalhes" className="sec">
      <h2 className="sec-title">Características</h2>
      <dl className="grid gap-x-8 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-line py-2.5 text-[15px]">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-5 flex flex-wrap gap-2">
        {features.map((f) => (
          <li key={f} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13.5px]">
            <IconCheck size={14} className="text-brand" /> {f}
          </li>
        ))}
      </ul>
    </section>
  );
}

function BuyInPlan() {
  const steps = [
    [IconDoc, "Reserva e CPCV", `Entrada de 10% (${formatEUR(PROJECT.price * PROJECT.downPaymentPct)}), devolvida a 100% se o banco não aprovar.`],
    [IconKey, "Terreno em seu nome", "Escritura do lote logo no início, antes de a obra começar."],
    [IconHammer, "Construção por fases", "O banco liberta cada tranche só depois de vistoriar a obra."],
    [IconCheck, "Chave na mão", "Moradia concluída em 10 meses, ao preço fechado."],
  ] as const;
  const guarantees = [
    [IconShield, "Sinal salvaguardado"],
    [IconLock, "Preço fechado em contrato"],
    [IconClock, "Penalização por atraso"],
    [IconStar, "Relatório semanal da obra"],
  ] as const;
  return (
    <section id="condicoes" className="sec">
      <h2 className="sec-title">Como funciona a compra em planta</h2>
      <p className="-mt-2 mb-5 max-w-[62ch] text-[15px] leading-relaxed text-muted">
        É uma venda em planta, com possibilidade de crédito habitação: garante hoje o preço de uma casa que vai ser construída e o banco
        financia até 90%. O projeto já está aprovado e o terreno fica em seu nome desde o primeiro dia.
      </p>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([Icon, t, d], i) => (
          <li key={t} className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cta text-[13px] font-bold text-paper">{i + 1}</span>
              <Icon size={18} className="text-brand" />
            </div>
            <div className="mt-3 font-semibold">{t}</div>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{d}</p>
          </li>
        ))}
      </ol>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {guarantees.map(([Icon, t]) => (
          <li key={t} className="flex items-center gap-2 rounded-xl bg-brand-soft px-3 py-2.5 text-[13.5px] font-semibold text-brand-ink">
            <Icon size={18} className="shrink-0 text-brand" /> {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Builder() {
  return (
    <section id="construtora" className="sec">
      <h2 className="sec-title">Quem constrói e quem aprovou</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-3.5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cta">
            <Image src={BUILDER.logo} alt={BUILDER.name} fill sizes="80px" className="object-contain p-2" />
          </div>
          <div>
            <div className="eyebrow">Construtora oficial</div>
            <div className="font-semibold">{BUILDER.name}</div>
            <div className="text-[13px] text-muted">{BUILDER.blurb}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-3.5">
          <div className="relative h-20 w-20 shrink-0 rounded-lg bg-white">
            <Image src="/brand/camara-aveiro.webp" alt="Câmara Municipal de Aveiro" fill sizes="80px" className="object-contain p-1.5" />
          </div>
          <div>
            <div className="eyebrow">Licenciamento</div>
            <div className="font-semibold">Câmara Municipal de Aveiro</div>
            <div className="text-[13px] text-muted">Projeto aprovado. Sem licenças pendentes.</div>
          </div>
        </div>
      </div>
      <h3 className="mb-3 mt-6 font-semibold">Obras reais do Grupo Freitas</h3>
      <WorksStrip pics={WORKS} />
    </section>
  );
}

function Testimonials() {
  return (
    <section className="sec">
      <h2 className="sec-title">Quem já construiu com o Grupo Freitas</h2>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-2 md:px-0">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="flex w-[86%] shrink-0 snap-start flex-col rounded-xl border border-line bg-white p-5 md:w-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="flex text-sand">{[0, 1, 2, 3, 4].map((i) => <IconStar key={i} />)}</span>
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11.5px] font-semibold text-brand-ink">{t.tag}</span>
            </div>
            <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">“{t.quote}”</blockquote>
            <figcaption className="mt-4 border-t border-line pt-3">
              <div className="font-semibold">{t.name}</div>
              <div className="text-[13px] text-muted">{t.meta}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="sec">
      <h2 className="sec-title">Perguntas frequentes</h2>
      <div className="divide-y divide-line rounded-xl border border-line bg-white">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group px-4">
            <summary className="flex items-center justify-between gap-4 py-4 font-semibold">
              {q}
              <IconChevron size={18} className="chev shrink-0 text-muted transition" />
            </summary>
            <p className="-mt-1 pb-4 text-[15px] leading-relaxed text-muted">{a}</p>
          </details>
        ))}
      </div>
      <p className="mt-4 text-[15px]">
        Tem outra pergunta? <Ask className="font-semibold text-brand underline" preset={{ cta: "faq", text: "Olá André, tenho uma pergunta sobre as moradias Domaine XXV: " }}>Pergunte diretamente ao André</Ask>.
      </p>
    </section>
  );
}

/** Cartão fixo (computador): quem responde + botões. A mensagem abre numa janela. */
function ContactCard() {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(21,32,43,0.08)]">
      <div className="flex items-center gap-3.5">
        <Image src={PROMOTER.avatar} alt={PROMOTER.name} width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
        <div className="min-w-0 leading-tight">
          <div className="text-[17px] font-bold">{PROMOTER.name}</div>
          <div className="text-[13px] text-muted">Promotor do projeto · Domaine XXV</div>
          <div className="mt-1 flex items-center gap-1.5 text-[12.5px] font-medium text-brand">
            <span className="h-2 w-2 rounded-full bg-[#2fa863]" /> Responde no próprio dia
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-soft px-4 py-3">
        <div className="text-[13px] text-muted">Preço chave na mão</div>
        <div className="text-[22px] font-extrabold tabular-nums">{formatEUR(PROJECT.price)}</div>
        <div className="text-[12.5px] text-muted">Entrada de 10%: {formatEUR(PROJECT.price * PROJECT.downPaymentPct)}</div>
      </div>
      <div className="mt-4 grid gap-2">
        <Ask className="btn btn-primary w-full py-3.5 text-[15px]" preset={{ cta: "sidebar" }}>Enviar mensagem</Ask>
        <Ask className="btn btn-ghost w-full" preset={{ cta: "sidebar_visita", intent: "visita" }}>Marcar visita ao terreno</Ask>
        <DirectContact cta="sidebar" />
      </div>
      <p className="mt-3 text-center text-[12px] text-muted">Sem compromisso · {PROMOTER.phoneDisplay}</p>
    </div>
  );
}

function PromoterBlock() {
  return (
    <section className="mt-12 bg-soft">
      <div className="mx-auto flex max-w-[640px] flex-col items-center px-4 py-12 text-center lg:py-16">
        <div className="relative h-36 w-36 overflow-hidden rounded-full ring-4 ring-white shadow-[0_10px_30px_rgba(21,32,43,0.12)]">
          <Image src={PROMOTER.portrait} alt={PROMOTER.name} fill sizes="144px" quality={85} className="object-cover object-top" />
        </div>
        <div className="eyebrow mt-6">Fale com quem desenvolve o projeto</div>
        <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-tight sm:text-[34px]">{PROMOTER.name}</h2>
        <p className="mt-1 text-muted">Promotor do Domaine XXV · em parceria com o {BUILDER.name}</p>
        <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed [text-wrap:balance]">
          Sem call center nem intermediários. Quem lhe responde é quem acompanha o projeto, da reserva às chaves. Respondo no próprio dia.
        </p>
        <div className="mt-6 grid w-full max-w-[420px] gap-2">
          <Ask className="btn btn-primary w-full py-3.5 text-[15px]" preset={{ cta: "promoter_block" }}>Enviar mensagem ao André</Ask>
          <DirectContact cta="promoter_block" />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <span className="font-serif text-[16px] text-ink">Domaine XXV</span> · {PROJECT.address}, {PROJECT.postal}
        </div>
        <div className="flex gap-4">
          <Link href="/privacidade" className="underline">Privacidade</Link>
          <span>© 2026 Domaine XXV · {BUILDER.legal}</span>
        </div>
      </div>
      <p className="mx-auto max-w-[1200px] px-4 pb-8 text-[11.5px] text-muted/80 lg:px-6">
        Imagens 3D ilustrativas do projeto aprovado. Áreas aproximadas. *Prestação indicativa, ver simulador.
      </p>
    </footer>
  );
}
