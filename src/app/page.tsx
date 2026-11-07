import Image from "next/image";
import Link from "next/link";
import {
  BRANDS, BUILDER, DESIGNERS, DISTANCES, FAQ, FINANCING_BANK, LOT_SPEC, PLANS, PROJECT, PROMOTER, ROOMS, TESTIMONIALS, WORKS, formatEUR,
} from "@/lib/config";
import {
  IconArea, IconBath, IconBed, IconCar, IconCheck, IconChevron, IconClock, IconDoc, IconHammer, IconKey,
  IconLock, IconPhone, IconPin, IconShield, IconStar, IconTree,
} from "@/components/icons";
import LandingProvider from "@/components/landing/LandingProvider";
import Gallery from "@/components/landing/Gallery";
import AvailabilityForm, { Offer } from "@/components/landing/AvailabilityForm";
import TrustMini from "@/components/landing/TrustMini";
import ContactDialog from "@/components/landing/ContactDialog";
import LotsTable from "@/components/landing/LotsTable";
import Simulator, { MonthlyFrom } from "@/components/landing/Simulator";
import Ask from "@/components/landing/Ask";
import SeenTracker from "@/components/landing/SeenTracker";
import CookiePrefs from "@/components/CookiePrefs";
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
            <nav className="no-scrollbar sticky top-[61px] z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-paper px-4 [transform:translateZ(0)] lg:mx-0 lg:px-0">
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
    <header className="sticky top-0 z-30 border-b border-line bg-paper [transform:translateZ(0)]">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between gap-4 px-4 lg:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-[22px] font-semibold tracking-wide">Domaine XXV</span>
          <span className="hidden text-[12px] text-muted sm:inline">Oliveirinha · Aveiro</span>
        </Link>
        <Ask className="btn btn-primary hidden px-4 py-2 text-sm lg:inline-flex" preset={{ cta: "header" }}>Verificar disponibilidade</Ask>
        <a href={PROMOTER.phoneHref} className="btn btn-ghost px-3 py-2 text-sm lg:hidden"><IconPhone size={16} /> Ligar</a>
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
          <div className="text-[27px] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums sm:text-[32px]">{formatEUR(PROJECT.price).replace(/\s*€$/, "")}</div>
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
          <b>{FINANCING_BANK ? `Venda em planta, com financiamento disponível com ${FINANCING_BANK}.` : "Venda em planta, com possibilidade de crédito habitação."}</b>{" "}
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
          <div className="text-[13px] text-muted">Promotor · confirma no próprio dia</div>
        </div>
        <Ask className="btn btn-primary px-3.5 py-2.5 text-sm" preset={{ cta: "summary_mobile" }}>Verificar lotes</Ask>
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
          Entregue pronta a habitar, com marcas de referência: caixilharia Cortizo, climatização Daikin, cozinha Bosch e Teka, cerâmica Margres
          e pavimento Castro Wood Floors. Projeto da Risco Calculado, construção do Grupo Freitas Renovações. Os acabamentos escolhe-os consigo.
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
        <Ask className="btn btn-ghost" preset={{ cta: "plantas" }}>Verificar disponibilidade</Ask>
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
    ["Estrutura", "Aço leve (LSF)"],
    ["Financiamento", "Crédito habitação até 90%"],
    ["Construtora", BUILDER.licence ? `${BUILDER.name} · Alvará n.º ${BUILDER.licence}` : BUILDER.name],
    ["Projeto", DESIGNERS.firm],
    ...(FINANCING_BANK ? [["Financiamento", `Disponível com ${FINANCING_BANK}`]] : []),
  ];
  const features = [
    "Cozinha totalmente equipada", "Ar condicionado multi-split", "Bomba de calor A+", "Corte térmico e vidro duplo",
    "Jardim privativo", "Garagem coberta", "Anexo / arrumos", "Suite", "Acabamentos à escolha", "Fiscalização independente",
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

      <h3 className="mb-3 mt-7 font-semibold">Marcas incluídas</h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {BRANDS.map((b) => (
          <li key={b.name}>
           <a href={b.url} target="_blank" rel="noopener" aria-label={`${b.name} (abre num novo separador)`} className="flex h-full flex-col gap-2 rounded-lg border border-line bg-white px-3 py-3 transition hover:border-brand/40 hover:shadow-sm">
            <div className="flex h-9 items-center">
              {/* logótipos já otimizados (WebP sem perdas, poucos KB): servidos tal como estão para máxima nitidez */}
              <Image src={b.logo} alt={b.name} width={b.w} height={b.h} unoptimized className="h-auto max-h-9 w-auto max-w-[130px] object-contain" />
            </div>
            <div className="text-[12.5px] leading-snug text-muted">{b.use}</div>
           </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BuyInPlan() {
  const steps = [
    [IconDoc, "Reserva e CPCV", `Entrada única de 10% (${formatEUR(PROJECT.price * PROJECT.downPaymentPct)}), imputada ao preço total.`],
    [IconKey, "Terreno em seu nome", "Escritura do lote logo no início, antes de a obra começar."],
    [IconHammer, "Construção por fases", "O crédito é libertado por etapas, segundo as condições e avaliações do banco."],
    [IconCheck, "Chave na mão", "Moradia concluída em 10 meses, ao preço fechado."],
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
      <Safety />
    </section>
  );
}

/** Segurança da compra: pontos curtos, fechados por defeito (abrem com um toque). */
function Safety() {
  const items = [
    [IconKey, "O terreno fica em seu nome", "Compra o lote por escritura antes de a obra começar. Desde aí, é o proprietário do terreno."],
    [IconDoc, "Uma única entrada de 33.500 €", "10% do preço, imputados ao valor total. O contrato define as condições de devolução, incluindo se o crédito não for aprovado."],
    [IconHammer, "Construção em aço leve (LSF)", `Estrutura em Light Steel Framing, executada pelo Grupo Freitas Renovações${BUILDER.licence ? ` (alvará n.º ${BUILDER.licence})` : ""} segundo o projeto e o caderno de encargos.`],
    [IconShield, "A obra não depende só do banco", "O crédito é libertado por fases. A construtora tem capacidade própria para manter a obra perante atrasos pontuais nos desembolsos."],
    [IconLock, "Retenção de boa execução", "Cerca de 33.500 € do preço só são pagos na fase final prevista no contrato. Não é um custo adicional."],
    [IconClock, "Prazo e penalizações em contrato", "10 meses a partir do início definido no contrato, com penalizações por atrasos imputáveis à construtora."],
    [IconCheck, "Fiscalização independente", "Pode levar o seu engenheiro para acompanhar a obra, com agendamento e regras de segurança."],
    [IconStar, "Documentação antes de decidir", "Projeto, licenciamento, caderno de encargos e minutas dos contratos, para analisar antes de assinar."],
  ] as const;
  return (
    <div className="mt-8">
      <h3 className="font-semibold">Segurança da compra</h3>
      <p className="mt-1 text-[14px] text-muted">Compromissos definidos por contrato.</p>
      <div className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
        {items.map(([Icon, t, d]) => (
          <details key={t} className="group px-4">
            <summary className="flex items-center gap-3 py-3.5 text-[15px] font-medium">
              <Icon size={18} className="shrink-0 text-brand" />
              <span className="flex-1">{t}</span>
              <IconChevron size={16} className="chev shrink-0 text-muted transition" />
            </summary>
            <p className="-mt-1 pb-3.5 pl-[30px] text-[14px] leading-relaxed text-muted">{d}</p>
          </details>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Ask
          className="text-[14px] font-semibold text-brand underline underline-offset-2"
          preset={{ cta: "dossier", intent: "plantas", text: "Olá André, gostava de receber o dossier completo do projeto Domaine XXV (técnico e contratual)." }}
        >
          Pedir dossier completo
        </Ask>
        <span className="text-[12px] text-muted">As condições aplicáveis são as dos contratos assinados.</span>
      </div>
    </div>
  );
}

function Builder() {
  return (
    <section id="construtora" className="sec">
      <h2 className="sec-title">Quem faz o projeto</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-3.5">
          <a href={BUILDER.url} target="_blank" rel="noopener" aria-label={`${BUILDER.name} (abre num novo separador)`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cta">
            <Image src={BUILDER.logo} alt={BUILDER.name} fill sizes="80px" className="object-contain p-2" />
          </a>
          <div className="min-w-0">
            <div className="eyebrow">Construção</div>
            <a href={BUILDER.url} target="_blank" rel="noopener" className="font-semibold hover:underline">{BUILDER.name}</a>
            {BUILDER.licence && <div className="mt-0.5 text-[13.5px] font-semibold text-ink">Alvará n.º {BUILDER.licence}</div>}
            <div className="text-[13px] text-muted">{BUILDER.blurb}</div>
            <a href={BUILDER.url} target="_blank" rel="noopener" className="text-[13px] font-semibold text-brand underline">Visitar o site da construtora</a>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-3.5">
          <a href={DESIGNERS.instagram} target="_blank" rel="noopener" aria-label={`${DESIGNERS.firm} no Instagram (abre num novo separador)`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
            <Image src={DESIGNERS.logo} alt={DESIGNERS.firm} fill sizes="80px" unoptimized className="object-contain p-1" />
          </a>
          <div className="min-w-0">
            <div className="eyebrow">Arquitetura e engenharia</div>
            <div className="font-semibold">{DESIGNERS.firm}</div>
            {DESIGNERS.architect && <div className="text-[13.5px]">{DESIGNERS.architect}</div>}
            {DESIGNERS.engineer && <div className="text-[13.5px]">{DESIGNERS.engineer}</div>}
            <div className="text-[13px] text-muted">{DESIGNERS.bio} {DESIGNERS.where}.</div>
            <a href={DESIGNERS.instagram} target="_blank" rel="noopener" className="text-[13px] font-semibold text-brand underline">Ver trabalhos no Instagram</a>
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
        {FINANCING_BANK && (
          <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-3.5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-brand-soft px-1 text-center text-[13px] font-bold leading-tight text-brand-ink">{FINANCING_BANK}</div>
            <div>
              <div className="eyebrow">Financiamento</div>
              <div className="font-semibold">Disponível com {FINANCING_BANK}</div>
              <div className="text-[13px] text-muted">Projeto avaliado pelo banco. Crédito sujeito a aprovação.</div>
            </div>
          </div>
        )}
      </div>
      <div className="mb-3 mt-6 flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">Obras reais do Grupo Freitas</h3>
        <a href={BUILDER.url} target="_blank" rel="noopener" className="shrink-0 text-[13px] font-semibold text-brand underline">Ver mais obras</a>
      </div>
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

/** Cartão fixo (computador): oferta + formulário já à vista + credibilidade. */
function ContactCard() {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(21,32,43,0.08)]">
      <Offer size="sm" titleClass="text-[18px] font-bold leading-snug tracking-tight [text-wrap:balance]" />
      <div className="mt-4">
        <AvailabilityForm id="sidebar" compact />
      </div>
      <TrustMini className="mt-4 border-t border-line pt-4" />
    </div>
  );
}

function PromoterBlock() {
  return (
    <section id="disponibilidade" className="mt-12 bg-soft">
      <div className="mx-auto max-w-[560px] px-4 py-12 lg:py-16">
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <Offer titleClass="text-[22px] font-bold leading-tight tracking-tight [text-wrap:balance] sm:text-[26px]" />
          <div className="mt-4">
            <AvailabilityForm id="promoter_block" />
          </div>
          <TrustMini className="mt-4 border-t border-line pt-4" />
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
          <CookiePrefs />
          <span>© 2026 Domaine XXV · {BUILDER.legal}</span>
        </div>
      </div>
      <p className="mx-auto max-w-[1200px] px-4 pb-8 text-[11.5px] text-muted/80 lg:px-6">
        Imagens 3D ilustrativas do projeto aprovado. Áreas aproximadas. *Prestação indicativa, ver simulador.
      </p>
    </footer>
  );
}
