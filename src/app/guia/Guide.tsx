"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PROJECT, PROMOTER, formatEUR } from "@/lib/config";
import { track } from "@/lib/track";
import GuideCover from "@/components/landing/GuideCover";
import { IconArrowL, IconCheck, IconDoc, IconShield, IconWhatsApp } from "@/components/icons";

/* ------------------------------------------------------------------ */
/* Conteúdo (válido para qualquer compra em planta em Portugal)        */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    t: "Escolher e visitar",
    when: "1–2 semanas",
    do: ["Visite o terreno e a envolvente a horas diferentes.", "Peça o projeto aprovado, as plantas e o mapa de acabamentos."],
    warn: "Desconfie de pressa: “só hoje”, “há outro interessado”. Um bom projeto aguenta uma semana de análise.",
    dx: "Visita ao lote com o promotor, sem compromisso.",
  },
  {
    t: "Estudo de crédito",
    when: "1–3 semanas",
    do: [
      "Peça uma simulação a 2 ou 3 bancos (ou a um intermediário de crédito registado no Banco de Portugal).",
      "Regra geral, o banco financia até 90% na habitação própria permanente e a prestação não deve passar 50% do rendimento líquido.",
    ],
    warn: "Até aos 35 anos pode ter isenção de IMT e Imposto do Selo na primeira habitação e garantia pública que permite financiar até 100%. Confirme a elegibilidade com o banco.",
    dx: "Estudo de viabilidade bancária gratuito.",
  },
  {
    t: "Verificar documentos",
    when: "Antes de pagar qualquer sinal",
    do: ["Use a checklist deste guia (secção 4).", "Confirme no portal do IMPIC que a construtora tem alvará válido."],
    warn: "Nunca entregue dinheiro sem ter visto o registo predial e o projeto aprovado.",
    dx: "Dossier técnico e minutas dos contratos disponíveis antes de reservar.",
  },
  {
    t: "Contrato-promessa (CPCV) e sinal",
    when: "Dia da reserva",
    do: [
      "Num imóvel a construir, a lei exige reconhecimento presencial das assinaturas e certificação da licença (art. 410.º, n.º 3 do Código Civil).",
      "Inclua uma cláusula que devolve o sinal se o crédito não for aprovado.",
      "Pode pedir o registo provisório da aquisição para proteger a sua posição.",
    ],
    warn: "Regra do sinal (art. 442.º do Código Civil): se o vendedor desistir, devolve-o em dobro; se for o comprador, perde-o.",
    dx: "Entrada única de 10% (33.500 €), imputada ao preço.",
  },
  {
    t: "Escritura e crédito",
    when: "1–2 meses",
    do: ["Escritura do terreno (ou do imóvel) e assinatura do crédito.", "Leve tudo revisto: preço, prazo, penalizações, acabamentos."],
    warn: "Confirme que o preço do contrato é fechado e que lista o que está incluído.",
    dx: "O terreno fica em seu nome antes de a obra começar.",
  },
  {
    t: "Construção",
    when: "Cerca de 10–18 meses",
    do: [
      "O banco liberta o dinheiro por tranches, depois de vistoriar cada fase.",
      "Peça relatórios de obra e, se quiser, contrate um engenheiro independente para fiscalizar.",
    ],
    warn: "Nunca pague à frente da obra. O dinheiro deve acompanhar o que está feito.",
    dx: "10 meses, com penalizações por atraso e retenção final de ~33.500 €.",
  },
  {
    t: "Entrega das chaves",
    when: "Fim da obra",
    do: [
      "Faça uma vistoria final com lista de defeitos, por escrito, antes de receber.",
      "Exija a licença de utilização, a ficha técnica da habitação e o certificado energético.",
    ],
    warn: "Defeitos de construção têm garantia legal (5 anos; 10 anos para elementos estruturais em imóveis comprados a profissionais). Reclame por escrito.",
    dx: "Garantias legais e contratuais entregues por escrito.",
  },
];

const DOCS = [
  ["Certidão permanente do registo predial", "Quem é o dono e se há hipotecas ou penhoras."],
  ["Caderneta predial", "Identificação fiscal do terreno."],
  ["Projeto aprovado / licença de construção", "Emitidos pela Câmara Municipal."],
  ["Alvará da construtora (IMPIC)", "Confirme o número e a validade no portal do IMPIC."],
  ["Caderno de encargos e mapa de acabamentos", "Marcas, materiais e equipamentos incluídos."],
  ["Minutas do CPCV e do contrato de empreitada", "Preço, prazo, penalizações e devolução do sinal."],
  ["Pré-certificado energético", "Classe energética prevista."],
  ["Plano de pagamentos", "Quanto paga, quando e contra que fase da obra."],
];

const ALERTS = [
  "Pede grandes pagamentos antes de a obra avançar.",
  "O preço é “estimado” ou “sujeito a revisão”.",
  "Ainda não há projeto aprovado nem licença.",
  "A construtora não tem alvará válido no IMPIC.",
  "Não há prazo de entrega nem penalizações por atraso.",
  "Recusa mostrar os contratos antes de assinar.",
  "Pede sinal em dinheiro ou sem recibo.",
];

const COSTS: [string, string, string][] = [
  ["IMT (imposto de transmissão)", "Depende do valor e do tipo de habitação", "Incluído"],
  ["Imposto do Selo da compra", "0,8% do valor", "Incluído"],
  ["Imposto do Selo do crédito", "0,6% do valor financiado", "Encargos previstos no contrato"],
  ["Escrituras e registos", "Algumas centenas de euros", "Encargos previstos no contrato"],
  ["Avaliação bancária e comissões", "Varia por banco", "Encargos previstos no contrato"],
  ["Seguros de vida e multirriscos", "Mensal, durante o crédito", "Por conta do comprador"],
  ["Mobiliário e decoração", "À sua escolha", "Cozinha equipada incluída"],
];

const QUESTIONS = [
  "O projeto já está aprovado pela Câmara?",
  "O terreno fica em meu nome antes da obra?",
  "O preço é fechado em contrato, com tudo o que inclui discriminado?",
  "Há penalizações se a obra atrasar?",
  "Posso ver as minutas dos contratos antes de assinar?",
  "Posso levar um engenheiro independente à obra?",
];

const GLOSSARY = [
  ["CPCV", "Contrato-promessa de compra e venda. Compromete as duas partes antes da escritura."],
  ["Sinal", "Valor pago no CPCV. Conta para o preço final."],
  ["Tranche", "Cada parte do crédito libertada pelo banco ao longo da obra."],
  ["Auto de medição", "Registo do trabalho feito, base para cada pagamento."],
  ["Retenção de boa execução", "Parte do preço que só é paga no fim, quando a obra está concluída."],
  ["LSF", "Light Steel Framing: estrutura em aço leve, rápida e eficiente."],
  ["Taxa de esforço", "Percentagem do rendimento que vai para prestações de crédito."],
  ["Licença de utilização", "Autorização da Câmara para habitar a casa."],
];

const TOC = [
  ["planta", "Comprar em planta"],
  ["passos", "Os 7 passos"],
  ["dinheiro", "Para onde vai o dinheiro"],
  ["documentos", "Checklist de documentos"],
  ["alertas", "Sinais de alerta"],
  ["custos", "Custos a contar"],
  ["perguntas", "Perguntas ao promotor"],
  ["glossario", "Glossário"],
];

const WA_TEXT = "Olá André! Li o guia de compra em planta e gostava de falar sobre os próximos passos para o Domaine XXV.";
const DOCS_KEY = "dx_guide_docs";

/* ------------------------------------------------------------------ */

export default function Guide() {
  const q = useSearchParams();
  const token = q.get("l");
  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    try {
      setChecked(JSON.parse(localStorage.getItem(DOCS_KEY) || "[]"));
    } catch {}
    track("ViewContent", { content_name: "guia_compra_planta" });
  }, []);

  function toggle(i: number) {
    setChecked((c) => {
      const n = c.includes(i) ? c.filter((x) => x !== i) : [...c, i];
      try {
        localStorage.setItem(DOCS_KEY, JSON.stringify(n));
      } catch {}
      return n;
    });
  }

  function onWhatsApp() {
    track("Contact", { method: "whatsapp", cta: "guia" });
    if (token) {
      const payload = JSON.stringify({ token });
      if (navigator.sendBeacon) navigator.sendBeacon("/api/leads/whatsapp", new Blob([payload], { type: "application/json" }));
    }
  }

  const back = token ? `/obrigado?l=${encodeURIComponent(token)}` : "/";
  const price = PROJECT.price;

  return (
    <main className="min-h-dvh bg-paper pb-16 print:pb-0">
      {/* Capa */}
      <header className="bg-[linear-gradient(160deg,#24476b_0%,#1b3048_60%,#111f30_100%)] text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-4 print:hidden">
          <Link href={back} className="flex items-center gap-1.5 text-sm text-white/80"><IconArrowL size={18} /> Voltar</Link>
          <button onClick={() => window.print()} className="rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-semibold ring-1 ring-white/25">Guardar em PDF</button>
        </div>
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 pb-10 pt-8 sm:flex-row sm:items-center">
          <GuideCover size="lg" />
          <div>
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#d9b56a]">Guia prático gratuito · 2026</div>
            <h1 className="mt-2 font-serif text-[32px] font-semibold leading-[1.1] [text-wrap:balance] sm:text-[40px]">Como Comprar em Planta com Segurança</h1>
            <p className="mt-3 max-w-[46ch] text-[15.5px] leading-relaxed text-white/80">
              O que verificar, quando pagar e como se proteger, do primeiro contacto até às chaves. Serve para qualquer compra em planta em Portugal.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[12.5px] text-white/80">
              {["7 passos", "Checklist de 8 documentos", "7 sinais de alerta", "10 min de leitura"].map((x) => (
                <span key={x} className="rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/15">{x}</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4">
        {/* Índice */}
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto border-b border-line px-4 py-3 print:hidden">
          {TOC.map(([id, t], i) => (
            <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[13px] text-muted hover:text-ink">
              <span className="font-semibold text-brand">{i + 1}</span> {t}
            </a>
          ))}
        </nav>

        {/* 1 */}
        <Chapter id="planta" n={1} title="Comprar em planta: o que ganha e o que tem de acautelar">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#ecf7f0] p-4">
              <div className="font-semibold text-[#1a6b3c]">O que ganha</div>
              <ul className="mt-2 space-y-1.5 text-[14.5px] text-[#1f4d33]">
                {["Preço de hoje para uma casa entregue mais tarde", "Casa nova, eficiente e com garantia", "Escolhe acabamentos antes de construir", "Pagamentos repartidos ao longo da obra"].map((x) => (
                  <li key={x} className="flex gap-2"><IconCheck size={16} className="mt-0.5 shrink-0" /> {x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-[#fff4ec] p-4">
              <div className="font-semibold text-[#9a4a14]">O que tem de acautelar</div>
              <ul className="mt-2 space-y-1.5 text-[14.5px] text-[#6b3a17]">
                {["Atrasos na obra", "Derrapagens no preço", "Construtora sem capacidade", "Contratos pouco claros"].map((x) => (
                  <li key={x} className="flex gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#d06a2a]" /> {x}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed">Todos estes riscos se controlam com três coisas: <b>documentos verificados</b>, <b>contratos claros</b> e <b>pagamentos que acompanham a obra</b>. É disso que trata este guia.</p>
        </Chapter>

        {/* 2 */}
        <Chapter id="passos" n={2} title="O processo em 7 passos">
          <ol className="relative">
            {STEPS.map((s, i) => (
              <li key={s.t} className="relative flex gap-4 pb-6 last:pb-0">
                {i < STEPS.length - 1 && <span className="absolute left-[17px] top-9 h-[calc(100%-2rem)] w-0.5 bg-line" />}
                <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cta text-[15px] font-bold text-paper">{i + 1}</span>
                <div className="min-w-0 flex-1 rounded-xl border border-line bg-white p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="text-[17px] font-bold">{s.t}</h3>
                    <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">{s.when}</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-[14.5px] leading-relaxed">
                    {s.do.map((x) => (
                      <li key={x} className="flex gap-2"><IconCheck size={16} className="mt-1 shrink-0 text-[#2fa863]" /> {x}</li>
                    ))}
                  </ul>
                  <p className="mt-2.5 rounded-lg bg-[#fff8e8] px-3 py-2 text-[13.5px] leading-snug text-[#6b5313]"><b>Atenção:</b> {s.warn}</p>
                  <p className="mt-2 text-[13px] text-brand"><b>No Domaine XXV:</b> {s.dx}</p>
                </div>
              </li>
            ))}
          </ol>
        </Chapter>

        {/* 3 */}
        <Chapter id="dinheiro" n={3} title="Para onde vai o seu dinheiro">
          <p className="text-[15px] leading-relaxed">Numa compra em planta bem feita, o dinheiro <b>acompanha a obra</b>. Exemplo com uma casa de {formatEUR(price)}:</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            <div className="flex h-14 text-[12px] font-semibold text-white">
              <div className="grid w-[10%] min-w-[64px] place-items-center bg-[#c49a3c] text-[#111f30]">10%</div>
              <div className="grid flex-1 place-items-center bg-brand">Banco, por tranches · 80%</div>
              <div className="grid w-[10%] min-w-[64px] place-items-center bg-cta">10%</div>
            </div>
            <div className="grid grid-cols-3 gap-px bg-line text-[13px]">
              <div className="bg-white p-3"><b>Sinal no CPCV</b><br /><span className="text-muted">{formatEUR(price * 0.1)} · conta para o preço</span></div>
              <div className="bg-white p-3"><b>Durante a obra</b><br /><span className="text-muted">o banco paga cada fase depois de vistoriar</span></div>
              <div className="bg-white p-3"><b>No fim</b><br /><span className="text-muted">retenção paga só com a obra concluída</span></div>
            </div>
          </div>
          <h3 className="mt-6 font-semibold">Como o banco liberta o crédito (exemplo)</h3>
          <div className="mt-3 space-y-2">
            {[
              ["Fundações", 15],
              ["Estrutura", 25],
              ["Cobertura e caixilharia", 20],
              ["Instalações técnicas", 20],
              ["Acabamentos", 20],
            ].map(([t, v]) => (
              <div key={t as string} className="flex items-center gap-3 text-[13.5px]">
                <span className="w-[42%] shrink-0 sm:w-48">{t}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-soft">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(v as number) * 4}%` }} />
                </div>
                <span className="w-10 text-right tabular-nums text-muted">{v}%</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-muted">Valores ilustrativos. Cada banco define as fases e os montantes depois da avaliação.</p>
        </Chapter>

        {/* 4 */}
        <Chapter id="documentos" n={4} title="Checklist: documentos a pedir antes de pagar">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-soft">
              <div className="h-full rounded-full bg-[#2fa863] transition-all" style={{ width: `${(checked.length / DOCS.length) * 100}%` }} />
            </div>
            <span className="text-[13px] font-semibold tabular-nums">{checked.length} de {DOCS.length}</span>
          </div>
          <ul className="divide-y divide-line rounded-xl border border-line bg-white">
            {DOCS.map(([t, d], i) => (
              <li key={t}>
                <label className="flex cursor-pointer items-start gap-3 p-3.5">
                  <input type="checkbox" checked={checked.includes(i)} onChange={() => toggle(i)} className="mt-1 h-5 w-5 shrink-0 accent-[#2fa863]" />
                  <span>
                    <span className={`block font-semibold ${checked.includes(i) ? "text-muted line-through" : ""}`}>{t}</span>
                    <span className="block text-[13.5px] text-muted">{d}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-muted">Vá marcando à medida que recebe cada documento. Fica guardado neste dispositivo.</p>
        </Chapter>

        {/* 5 */}
        <Chapter id="alertas" n={5} title="7 sinais de alerta">
          <ul className="grid gap-2 sm:grid-cols-2">
            {ALERTS.map((a) => (
              <li key={a} className="flex items-start gap-2.5 rounded-xl border border-[#f2c9b1] bg-[#fff4ec] p-3 text-[14.5px] text-[#6b3a17]">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#d06a2a] text-[12px] font-bold text-white">!</span> {a}
              </li>
            ))}
          </ul>
        </Chapter>

        {/* 6 */}
        <Chapter id="custos" n={6} title="Custos a contar para além do preço">
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-soft text-[11.5px] uppercase tracking-wide text-muted">
                <tr><th className="px-3 py-2">Custo</th><th className="hidden px-3 py-2 sm:table-cell">Referência</th><th className="px-3 py-2">No Domaine XXV</th></tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {COSTS.map(([c, ref, dx]) => (
                  <tr key={c}>
                    <td className="px-3 py-2.5"><b>{c}</b><div className="text-[12px] text-muted sm:hidden">{ref}</div></td>
                    <td className="hidden px-3 py-2.5 text-muted sm:table-cell">{ref}</td>
                    <td className={`px-3 py-2.5 ${dx.startsWith("Incluíd") ? "font-semibold text-[#1a6b3c]" : "text-muted"}`}>{dx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Chapter>

        {/* 7 */}
        <Chapter id="perguntas" n={7} title="6 perguntas a fazer a qualquer promotor">
          <div className="rounded-xl bg-brand-soft p-4">
            <ol className="space-y-2 text-[15px] text-brand-ink">
              {QUESTIONS.map((x, i) => (
                <li key={x} className="flex gap-2.5"><span className="font-bold tabular-nums">{i + 1}.</span> {x}</li>
              ))}
            </ol>
            <p className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-brand-ink"><IconShield size={18} /> No Domaine XXV, a resposta a todas é sim.</p>
          </div>
        </Chapter>

        {/* Glossário */}
        <Chapter id="glossario" n={8} title="Glossário rápido">
          <dl className="grid gap-2 sm:grid-cols-2">
            {GLOSSARY.map(([t, d]) => (
              <div key={t} className="rounded-xl border border-line bg-white p-3">
                <dt className="font-semibold">{t}</dt>
                <dd className="mt-0.5 text-[13.5px] text-muted">{d}</dd>
              </div>
            ))}
          </dl>
        </Chapter>

        {/* Fecho */}
        <section className="mt-10 rounded-2xl bg-cta p-6 text-paper print:hidden">
          <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#d9b56a]"><IconDoc size={16} /> Próximo passo</div>
          <h2 className="mt-2 text-[21px] font-bold leading-snug [text-wrap:balance]">Quer ver estes passos aplicados a uma das moradias Domaine XXV?</h2>
          <p className="mt-1.5 text-[14.5px] text-white/75">O {PROMOTER.name.split(" ")[0]}, promotor do projeto, mostra-lhe o terreno, os documentos e a simulação de crédito.</p>
          <a
            href={`https://wa.me/${PROMOTER.whatsapp}?text=${encodeURIComponent(WA_TEXT)}`}
            target="_blank"
            rel="noopener"
            onClick={onWhatsApp}
            className="btn btn-wa mt-4 w-full py-3 text-[15px]"
          >
            <IconWhatsApp size={20} /> Falar com o André no WhatsApp
          </a>
          <p className="mt-3 text-center text-[12.5px] text-white/70">Ou ligue: <a href={PROMOTER.phoneHref} className="underline">{PROMOTER.phoneDisplay}</a></p>
        </section>

        <p className="mt-6 text-[12px] leading-relaxed text-muted">
          Guia informativo, de caráter geral, atualizado em 2026. Não substitui aconselhamento jurídico ou bancário: confirme as regras aplicáveis ao seu caso com o seu banco e um advogado.
          No Domaine XXV, as condições aplicáveis são as dos contratos assinados. Crédito sujeito a aprovação bancária.
        </p>
      </div>
    </main>
  );
}

function Chapter({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 pt-10 print:break-inside-avoid">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-[28px] font-semibold leading-none text-[#c49a3c]">{String(n).padStart(2, "0")}</span>
        <h2 className="text-[21px] font-bold leading-tight tracking-tight [text-wrap:balance]">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
