import Image from "next/image";
import Link from "next/link";
import {
  BUILDER, DISTANCES, FAQ, LOT_SPEC, PROJECT, PROMOTER, ROOMS, TESTIMONIALS, formatEUR,
} from "@/lib/config";
import {
  Icon360, IconArea, IconBath, IconBed, IconCar, IconCheck, IconChevron, IconClock, IconDoc, IconHammer, IconKey,
  IconLock, IconPin, IconShield, IconStar, IconTree,
} from "@/components/icons";
import LandingProvider from "@/components/landing/LandingProvider";
import Gallery from "@/components/landing/Gallery";
import Composer from "@/components/landing/Composer";
import DirectContact from "@/components/landing/DirectContact";
import MobileContact from "@/components/landing/MobileContact";
import LotsTable, { AvailabilityLine } from "@/components/landing/LotsTable";
import Simulator, { MonthlyFrom } from "@/components/landing/Simulator";
import Video from "@/components/landing/Video";
import Ask from "@/components/landing/Ask";
import SeenTracker from "@/components/landing/SeenTracker";

const NAV = [
  ["descricao", "Descrição"],
  ["unidades", "Moradias"],
  ["detalhes", "Detalhes"],
  ["plantas", "Plantas"],
  ["condicoes", "Condições"],
  ["simulador", "Simulador"],
  ["localizacao", "Localização"],
  ["construtora", "Construtora"],
  ["faq", "Perguntas"],
];

export default function Page() {
  const down = PROJECT.price * PROJECT.downPaymentPct;
  return (
    <LandingProvider>
      <Header />

      <main className="pb-28 lg:pb-0">
        <div className="mx-auto max-w-[1200px] lg:px-6 lg:pt-4">
          <Crumbs />
          <Gallery />
        </div>

        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-6">
          {/* ---------------- COLUNA PRINCIPAL ---------------- */}
          <div className="min-w-0">
            <Summary down={down} />

            <nav className="no-scrollbar sticky top-[60px] z-20 -mx-4 mt-6 flex gap-1 overflow-x-auto border-b border-line bg-white/95 px-4 backdrop-blur lg:mx-0 lg:px-0">
              {NAV.map(([id, label]) => (
                <a key={id} href={`#${id}`} className="shrink-0 border-b-2 border-transparent px-2.5 py-3 text-[14px] font-medium text-muted hover:border-ink hover:text-ink">
                  {label}
                </a>
              ))}
            </nav>

            <Description />

            <section id="unidades" className="sec">
              <h2 className="sec-title">Moradias disponíveis</h2>
              <LotsTable />
            </section>

            <Details />
            <Plans />
            <BuyInPlan />

            <section id="simulador" className="sec">
              <h2 className="sec-title">Simulador de crédito</h2>
              <p className="-mt-2 mb-4 text-[15px] text-muted">Quanto ficaria a pagar por mês, com a entrada fixa de 10%.</p>
              <Simulator />
            </section>

            <Location />
            <Builder />
            <Testimonials />
            <Faq />
          </div>

          {/* ---------------- COLUNA DE CONTACTO (desktop) ---------------- */}
          <aside className="hidden lg:block">
            <div className="sticky top-[76px] pt-6">
              <div id="contacto" className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                <Composer variant="card" />
                <div className="my-4 flex items-center gap-3 text-[12px] text-muted"><span className="h-px flex-1 bg-line" />ou fale já<span className="h-px flex-1 bg-line" /></div>
                <DirectContact cta="sidebar" />
              </div>
              <TrustMini />
            </div>
          </aside>
        </div>

        <PromoterBlock />
        <Footer />
      </main>

      <MobileContact />
      <SeenTracker ids={["unidades", "condicoes", "simulador", "plantas"]} />
    </LandingProvider>
  );
}

/* =================================================================== */

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between gap-4 px-4 lg:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-[22px] font-semibold tracking-wide">Domaine XXV</span>
          <span className="hidden text-[12px] text-muted sm:inline">Oliveirinha · Aveiro</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex"><AvailabilityLine /></span>
          <Ask className="btn btn-primary hidden px-4 py-2 text-sm lg:inline-flex" preset={{ cta: "header" }}>Enviar mensagem</Ask>
          <a href={`https://wa.me/${PROMOTER.whatsapp}`} target="_blank" rel="noopener" className="btn btn-ghost px-3 py-2 text-sm lg:hidden">WhatsApp</a>
        </div>
      </div>
    </header>
  );
}

function Crumbs() {
  return (
    <div className="hidden pb-3 text-[13px] text-muted lg:block">
      Moradias à venda <span className="mx-1">›</span> Aveiro <span className="mx-1">›</span> Oliveirinha <span className="mx-1">›</span>
      <span className="text-ink">Domaine XXV</span>
    </div>
  );
}

function Summary({ down }: { down: number }) {
  const facts = [
    [IconBed, "T3", "+ sótão (opção T4)"],
    [IconArea, LOT_SPEC.usefulArea, "área útil"],
    [IconArea, LOT_SPEC.grossPrivate, "área bruta privativa"],
    [IconTree, LOT_SPEC.garden, "jardim privativo"],
    [IconBath, `${LOT_SPEC.bathrooms} WC`, "1 em suite"],
    [IconCar, "Garagem", "coberta + exterior"],
  ] as const;
  return (
    <section className="pt-5 lg:pt-7">
      <div className="flex flex-wrap items-center gap-2">
        <AvailabilityLine />
        <span className="text-[13px] text-muted">Ref. Domaine XXV · 3 moradias</span>
      </div>
      <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-tight sm:text-[32px]">
        Moradia T3 com jardim em Oliveirinha, Aveiro
      </h1>
      <p className="mt-1.5 flex items-start gap-1.5 text-[15px] text-muted">
        <IconPin size={16} className="mt-[3px] shrink-0" />
        <span>{PROJECT.address}, {PROJECT.postal} · <a href="#localizacao" className="underline">ver mapa</a></span>
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <div className="text-[36px] font-extrabold leading-none tracking-tight tabular-nums sm:text-[42px]">{formatEUR(PROJECT.price)}</div>
          <div className="mt-1.5 text-[13.5px] font-semibold text-brand">IMT e Imposto de Selo incluídos · chave na mão</div>
        </div>
        <div className="border-l border-line pl-6 text-[14px] leading-relaxed text-muted">
          Entrada de 10%: <b className="text-ink">{formatEUR(down)}</b>
          <br />
          ou cerca de <a href="#simulador" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-2"><MonthlyFrom />/mês</a>*
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
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

      <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
        {[
          [IconDoc, "Projeto aprovado · CM Aveiro"],
          [IconClock, "Construção em 10 meses"],
          [IconShield, "Sinal de 10% salvaguardado"],
          [IconLock, "Preço fechado em contrato"],
        ].map(([Icon, t]) => {
          const I = Icon as typeof IconDoc;
          return (
            <span key={t as string} className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 font-medium">
              <I size={15} className="text-brand" /> {t as string}
            </span>
          );
        })}
      </div>

      {/* Contacto rápido no telemóvel, logo acima da dobra */}
      <div className="mt-5 rounded-2xl border border-line p-4 lg:hidden">
        <div className="flex items-center gap-3">
          <Image src={PROMOTER.avatar} alt={PROMOTER.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
          <div className="flex-1 leading-tight">
            <div className="font-bold">{PROMOTER.name}</div>
            <div className="text-[13px] text-muted">Promotor do projeto · responde no próprio dia</div>
          </div>
        </div>
        <Ask className="btn btn-primary mt-3 w-full" preset={{ cta: "summary_mobile", intent: "visita" }}>Marcar visita ao terreno</Ask>
      </div>
    </section>
  );
}

function Description() {
  return (
    <section id="descricao" className="sec mt-0 border-t-0">
      <h2 className="sec-title">Descrição</h2>
      <div className="space-y-4 text-[16px] leading-[1.75] text-[#2b2d2c]">
        <p className="font-serif text-[22px] leading-snug text-ink">
          Em Aveiro, quase sempre se escolhe dois: espaço, localização ou preço. Esta moradia não pede que abdique de nenhum.
        </p>
        <p>
          Três moradias, lado a lado, numa rua tranquila de Oliveirinha. A oito minutos do centro histórico de Aveiro e a dois do nó da A17 e da A25.
          Perto o suficiente para tudo. Longe o suficiente do trânsito.
        </p>
        <p>
          No rés-do-chão, a cozinha abre-se para a sala e a sala abre-se para um <b>jardim privativo de 82 m²</b>, com zona de barbecue.
          O fim de semana começa à porta da cozinha. Garagem coberta, espaço exterior à frente e um anexo de 19 m² para tudo o que não cabe dentro de casa.
        </p>
        <p>
          No primeiro piso, três quartos: uma suite com casa de banho privativa, dois quartos e uma casa de banho completa.
          E por cima, um <b>sótão de 34 m²</b> que pode ser escritório, quarto de brincar ou o quarto que ainda não sabe que vai precisar.
          A opção T4 não altera o preço.
        </p>
        <p>
          A casa é entregue pronta a habitar: cozinha totalmente equipada, ar condicionado multi-split, bomba de calor A+ e caixilharia com corte térmico e vidro duplo.
          Os acabamentos, escolhe-os consigo.
        </p>
        <p>
          <b>{formatEUR(PROJECT.price)}, chave na mão, com IMT e Imposto de Selo incluídos.</b> Preço fechado em contrato, entrada de 10% e construção em 10 meses.
          Para quem quer uma moradia em Aveiro, sem pagar o preço do centro.
        </p>
      </div>

      <div id="video" className="mt-6 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <Video />
        <a href={PROJECT.tour360} target="_blank" rel="noopener" className="group relative flex min-h-[180px] items-end overflow-hidden rounded-xl">
          <Image src="/images/sala-de-jantar.webp" alt="Visita virtual 360°" fill sizes="(min-width:640px) 30vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <span className="relative p-4 text-white">
            <span className="flex items-center gap-2 text-lg font-bold"><Icon360 size={22} /> Visita virtual 360°</span>
            <span className="text-[13px] text-white/85">22 pontos, do jardim ao sótão →</span>
          </span>
        </a>
      </div>
    </section>
  );
}

function Details() {
  const rows = [
    ["Tipologia", "T3 com sótão aproveitável (opção T4)"],
    ["Área útil habitável", "~146,34 m²"],
    ["Área bruta privativa", "~180 m²"],
    ["Área dependente", "77,65 m² (garagem, anexo, áreas técnicas)"],
    ["Jardim privativo", "~82 m²"],
    ["Pisos", "R/C + 1.º piso + sótão"],
    ["Casas de banho", "3 (1 em suite)"],
    ["Estacionamento", "Garagem coberta + espaço exterior"],
    ["Estado", "Venda em planta · projeto aprovado"],
    ["Prazo de construção", "10 meses após a escritura do terreno"],
    ["Construtora", BUILDER.name],
  ];
  const features = [
    "Cozinha totalmente equipada", "Placa de indução", "Forno e micro-ondas encastrados", "Máquina de lavar loiça integrada",
    "Ar condicionado multi-split", "Bomba de calor A+ (AQS)", "Caixilharia com corte térmico", "Vidro duplo", "Isolamento térmico e acústico",
    "Jardim privativo", "Zona de barbecue", "Garagem coberta", "Anexo / arrumos", "Suite", "Varanda", "Sótão aproveitável",
    "Acabamentos à escolha", "Louças suspensas", "Rua sossegada", "Perto de escolas", "Perto da A17 / A25",
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

      <h3 className="mb-3 mt-8 font-semibold">Equipamento e envolvente</h3>
      <ul className="flex flex-wrap gap-2">
        {features.map((f) => (
          <li key={f} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[13.5px]">
            <IconCheck size={14} className="text-brand" /> {f}
          </li>
        ))}
      </ul>

      <h3 className="mb-3 mt-8 font-semibold">Divisões</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {ROOMS.map((r) => (
          <div key={r.floor} className="rounded-xl bg-soft p-4">
            <div className="eyebrow mb-2">{r.floor}</div>
            <ul className="space-y-1.5 text-[14px]">
              {r.items.map(([n, a]) => (
                <li key={n} className="flex justify-between gap-3"><span>{n}</span><span className="shrink-0 font-semibold tabular-nums">{a}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-muted">Valores conforme a memória descritiva do projeto de arquitetura aprovado.</p>
    </section>
  );
}

function Plans() {
  return (
    <section id="plantas" className="sec">
      <h2 className="sec-title">Plantas</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["/images/planta-tecnica.webp", "Planta técnica", "Piso 0 + Piso 1 + Sótão"],
          ["/images/planta-3d.webp", "Planta 3D", "Distribuição e enquadramento exterior"],
        ].map(([src, t, s]) => (
          <a key={src} href={src} target="_blank" rel="noopener" className="group overflow-hidden rounded-xl border border-line">
            <div className="relative aspect-[1600/1131] bg-soft">
              <Image src={src} alt={t} fill sizes="(min-width:640px) 400px, 100vw" className="object-contain p-2 transition group-hover:scale-[1.02]" />
            </div>
            <div className="flex items-center justify-between border-t border-line px-4 py-3">
              <div><div className="font-semibold">{t}</div><div className="text-[13px] text-muted">{s}</div></div>
              <span className="text-[13px] font-semibold text-brand">Ampliar ↗</span>
            </div>
          </a>
        ))}
      </div>
      <Ask className="btn btn-ghost mt-4" preset={{ intent: "plantas", cta: "plantas" }}>Receber plantas e caderno de acabamentos</Ask>
    </section>
  );
}

function BuyInPlan() {
  const steps = [
    [IconDoc, "Reserva e CPCV", `Entrada de 10% (${formatEUR(PROJECT.price * PROJECT.downPaymentPct)}), com cláusula de devolução integral se o banco não aprovar o crédito.`],
    [IconKey, "Terreno em seu nome", "Escritura do lote logo no início. É proprietário do terreno antes de a obra começar."],
    [IconHammer, "Construção por fases", "Crédito à construção: o banco liberta cada tranche só depois de o seu perito vistoriar a obra."],
    [IconCheck, "Chave na mão", "Moradia concluída em 10 meses, ao preço fechado no contrato de empreitada."],
  ] as const;
  const guarantees = [
    [IconShield, "Sinal salvaguardado", "Devolução a 100% se o crédito não for aprovado."],
    [IconLock, "Preço fechado", "Sem revisões de orçamento durante a obra."],
    [IconClock, "Prazo com penalização", "Multa diária à construtora em caso de atraso."],
    [IconStar, "Relatório semanal", "Fotografias e evolução técnica, todas as semanas."],
  ] as const;
  return (
    <section id="condicoes" className="sec">
      <h2 className="sec-title">Como funciona a compra em planta</h2>
      <p className="-mt-2 mb-5 max-w-[62ch] text-[15px] leading-relaxed text-muted">
        Comprar em planta é garantir hoje o preço de uma casa que ainda vai ser construída. Aqui, o projeto já está aprovado e o terreno fica em seu nome desde o primeiro dia.
      </p>
      <ol className="relative grid gap-4 sm:grid-cols-4">
        {steps.map(([Icon, t, d], i) => (
          <li key={t} className="rounded-xl border border-line p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
              <Icon size={18} className="text-brand" />
            </div>
            <div className="mt-3 font-semibold">{t}</div>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{d}</p>
          </li>
        ))}
      </ol>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {guarantees.map(([Icon, t, d]) => (
          <div key={t} className="flex gap-3 rounded-xl bg-brand-soft p-4">
            <Icon size={22} className="mt-0.5 shrink-0 text-brand" />
            <div><div className="font-semibold text-brand-ink">{t}</div><div className="text-[13.5px] text-[#3c4a45]">{d}</div></div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-muted">Todos os custos, materiais e cronograma constam do contrato promessa e do caderno de encargos.</p>
    </section>
  );
}

function Location() {
  return (
    <section id="localizacao" className="sec">
      <h2 className="sec-title">Localização</h2>
      <p className="-mt-2 mb-4 text-[15px] text-muted">{PROJECT.address}, {PROJECT.postal}</p>
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line md:aspect-auto md:min-h-[300px]">
          <iframe src={PROJECT.mapEmbed} title="Mapa Domaine XXV" loading="lazy" className="absolute inset-0 h-full w-full" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <ul className="divide-y divide-line rounded-xl border border-line">
          {DISTANCES.map(([t, p]) => (
            <li key={p} className="flex items-center gap-4 px-4 py-3">
              <span className="w-16 shrink-0 text-lg font-bold tabular-nums text-brand">{t}</span>
              <span className="text-[14.5px]">{p}</span>
            </li>
          ))}
          <li className="px-4 py-3">
            <a href={PROJECT.mapLink} target="_blank" rel="noopener" className="text-[14px] font-semibold text-brand">Abrir no Google Maps ↗</a>
          </li>
        </ul>
      </div>
      <Ask className="btn btn-ghost mt-4" preset={{ intent: "visita", cta: "localizacao" }}>Combinar visita ao terreno</Ask>
    </section>
  );
}

function Builder() {
  const works = [
    ["/obras/wc.webp", "Obra concluída", "Casas de banho"],
    ["/obras/quarto.webp", "Obra concluída", "Quartos e pavimentos"],
    ["/obras/alvenaria.webp", "Em execução", "Estrutura e alvenarias"],
    ["/obras/redes.webp", "Em execução", "Instalações técnicas"],
  ];
  return (
    <section id="construtora" className="sec">
      <h2 className="sec-title">Quem constrói e quem aprovou</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-line p-4">
          <div className="relative h-16 w-24 shrink-0"><Image src={BUILDER.logo} alt={BUILDER.name} fill sizes="96px" className="object-contain" /></div>
          <div>
            <div className="eyebrow">Construtora oficial</div>
            <div className="font-semibold">{BUILDER.name}</div>
            <div className="text-[13px] text-muted">{BUILDER.blurb}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-line p-4">
          <div className="relative h-16 w-16 shrink-0"><Image src="/brand/camara-aveiro.webp" alt="Câmara Municipal de Aveiro" fill sizes="64px" className="object-contain" /></div>
          <div>
            <div className="eyebrow">Licenciamento</div>
            <div className="font-semibold">Câmara Municipal de Aveiro</div>
            <div className="text-[13px] text-muted">Projeto de arquitetura aprovado. Sem licenças pendentes.</div>
          </div>
        </div>
      </div>
      <h3 className="mb-3 mt-6 font-semibold">Obras reais do Grupo Freitas</h3>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
        {works.map(([src, tag, t]) => (
          <a key={src} href={src} target="_blank" rel="noopener" className="relative aspect-[3/4] w-[44%] shrink-0 overflow-hidden rounded-xl sm:w-auto">
            <Image src={src} alt={t} fill sizes="(min-width:640px) 200px, 45vw" className="object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 text-white">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-white/80">{tag}</span>
              <span className="text-[14px] font-semibold">{t}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="sec">
      <h2 className="sec-title">Quem já construiu com o Grupo Freitas</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="flex flex-col rounded-xl border border-line p-5">
            <div className="flex items-center justify-between">
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
      <div className="divide-y divide-line rounded-xl border border-line">
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

function TrustMini() {
  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-soft p-4 text-[13px]">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-14 shrink-0"><Image src={BUILDER.logo} alt="" fill sizes="56px" className="object-contain" /></div>
        <div><b>Construção:</b> {BUILDER.name}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-14 shrink-0"><Image src="/brand/camara-aveiro.webp" alt="" fill sizes="56px" className="object-contain" /></div>
        <div><b>Projeto aprovado</b> pela Câmara Municipal de Aveiro</div>
      </div>
    </div>
  );
}

function PromoterBlock() {
  return (
    <section className="mt-12 bg-soft">
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-12 md:grid-cols-[320px_1fr] lg:px-6 lg:py-16">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-2xl">
          <Image src={PROMOTER.portrait} alt={PROMOTER.name} fill sizes="320px" className="object-cover" />
        </div>
        <div>
          <div className="eyebrow">Fale com quem desenvolve o projeto</div>
          <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-tight sm:text-[34px]">{PROMOTER.name}</h2>
          <p className="mt-1 text-muted">Promotor do Domaine XXV · em parceria com o {BUILDER.name}</p>
          <p className="mt-5 max-w-[58ch] text-[16px] leading-relaxed">
            Não há call center nem intermediários. Quem lhe responde é quem acompanha o projeto, da reserva à entrega das chaves.
            Escreva-me o que quer saber. Respondo-lhe no próprio dia, por telefone ou por escrito.
          </p>
          <ul className="mt-5 grid gap-2 text-[14.5px] sm:grid-cols-2">
            {[
              "Visita guiada ao lote em Oliveirinha",
              "Estudo de viabilidade bancária gratuito",
              "Interlocutor único do CPCV à escritura",
              "Relatório fotográfico semanal da obra",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2"><IconCheck size={18} className="mt-0.5 shrink-0 text-brand" /> {b}</li>
            ))}
          </ul>
          <div className="mt-6 max-w-[560px] rounded-2xl border border-line bg-white p-5">
            <Composer variant="inline" />
          </div>
          <div className="mt-3 max-w-[560px]"><DirectContact cta="promoter_block" /></div>
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
          <br />
          {formatEUR(PROJECT.price)} com IMT e Imposto de Selo incluídos · Entrada de 10% ({formatEUR(PROJECT.price * PROJECT.downPaymentPct)})
        </div>
        <div className="flex gap-4">
          <Link href="/privacidade" className="underline">Privacidade</Link>
          <span>© {2026} Domaine XXV · {BUILDER.legal}</span>
        </div>
      </div>
      <p className="mx-auto max-w-[1200px] px-4 pb-8 text-[11.5px] text-muted/80 lg:px-6">
        Imagens 3D ilustrativas do projeto de arquitetura aprovado. Áreas aproximadas, conforme memória descritiva. *Prestação indicativa, ver condições do simulador.
      </p>
    </footer>
  );
}
