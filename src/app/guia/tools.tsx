"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PROJECT, SIM_DEFAULTS, formatEUR, monthlyPayment } from "@/lib/config";
import { IconCheck } from "@/components/icons";

const EFFORT = 0.45; // taxa de esforço máxima usada no guia

/** Valor presente de uma prestação (crédito máximo para uma prestação mensal) */
function loanFor(payment: number, ratePct: number, years: number) {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  return r === 0 ? payment * n : (payment * (1 - Math.pow(1 + r, -n))) / r;
}

function NumberField({ id, label, value, onChange, suffix, hint }: { id: string; label: string; value: number; onChange: (v: number) => void; suffix: string; hint?: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-[13px] font-semibold">{label}</span>
      <span className="flex items-center rounded-[10px] border border-[#d5dbe2] bg-white focus-within:border-brand">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          step={50}
          value={value || ""}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full rounded-[10px] bg-transparent px-3 py-2.5 text-[16px] tabular-nums outline-none"
        />
        <span className="pr-3 text-[13px] text-muted">{suffix}</span>
      </span>
      {hint && <span className="mt-1 block text-[12px] text-muted">{hint}</span>}
    </label>
  );
}

/* 1. Calculadora "Quanto posso comprar?" ---------------------------------- */
export function Affordability({ token }: { token: string | null }) {
  const [income, setIncome] = useState(0);
  const [debts, setDebts] = useState(0);
  const [years, setYears] = useState(SIM_DEFAULTS.years);
  const [rate, setRate] = useState(SIM_DEFAULTS.rate);
  const sent = useRef("");

  const loanNeeded = PROJECT.price * (1 - PROJECT.downPaymentPct);
  const res = useMemo(() => {
    const maxPay = Math.max(0, income * EFFORT - debts);
    const maxLoan = loanFor(maxPay, rate, years);
    const house = maxLoan / (1 - PROJECT.downPaymentPct);
    const needPay = monthlyPayment(loanNeeded, rate, years);
    const needIncome = (needPay + debts) / EFFORT;
    return { maxPay, maxLoan, house, needPay, needIncome, fits: income > 0 && maxPay >= needPay };
  }, [income, debts, years, rate, loanNeeded]);

  // Guarda o resultado no CRM do André (só se a pessoa veio do formulário), com atraso para não enviar a cada tecla
  useEffect(() => {
    if (!token || income <= 0) return;
    const key = `${income}|${debts}|${years}|${rate}`;
    if (key === sent.current) return;
    const t = setTimeout(() => {
      sent.current = key;
      fetch("/api/leads/affordability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, income, debts, years, rate, maxLoan: Math.round(res.maxLoan), fits: res.fits }),
        keepalive: true,
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [token, income, debts, years, rate, res.maxLoan, res.fits]);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <NumberField id="calc-income" label="Rendimento líquido mensal do agregado" value={income} onChange={setIncome} suffix="€/mês" />
        <NumberField id="calc-debts" label="Prestações que já paga" value={debts} onChange={setDebts} suffix="€/mês" hint="Carro, cartões, outros créditos." />
        <label className="block">
          <span className="mb-1 flex justify-between text-[13px]"><b>Prazo</b><span className="tabular-nums">{years} anos</span></span>
          <input type="range" min={20} max={40} step={1} value={years} onChange={(e) => setYears(+e.target.value)} className="w-full" />
          <span className="block text-[12px] text-muted">O prazo máximo depende da sua idade.</span>
        </label>
        <label className="block">
          <span className="mb-1 flex justify-between text-[13px]"><b>Taxa de juro (TAN)</b><span className="tabular-nums">{rate.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}%</span></span>
          <input type="range" min={SIM_DEFAULTS.minRate} max={SIM_DEFAULTS.maxRate} step={0.05} value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full" />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-px border-t border-line bg-line text-center">
        {[
          ["Prestação máxima", res.maxPay, "/mês"],
          ["Crédito máximo", res.maxLoan, ""],
          ["Casa até", res.house, ""],
        ].map(([l, v, suf]) => (
          <div key={l as string} className="bg-white px-2 py-3">
            <div className="text-[11.5px] uppercase tracking-wide text-muted">{l as string}</div>
            <div className="mt-0.5 text-[17px] font-bold tabular-nums sm:text-[20px]">{income > 0 ? `${formatEUR(v as number)}${suf}` : "—"}</div>
          </div>
        ))}
      </div>

      {income > 0 && (
        <div className={`border-t px-4 py-3 text-[14px] leading-snug ${res.fits ? "border-[#bfe6cd] bg-[#ecf7f0] text-[#1a6b3c]" : "border-[#f2d9a8] bg-[#fff8e8] text-[#6b5313]"}`}>
          {res.fits ? (
            <>✓ <b>Uma moradia Domaine XXV cabe no seu orçamento.</b> Prestação estimada de {formatEUR(res.needPay)}/mês, com {formatEUR(PROJECT.price * PROJECT.downPaymentPct)} de entrada.</>
          ) : (
            <>Para uma moradia Domaine XXV ({formatEUR(res.needPay)}/mês) precisaria de cerca de <b>{formatEUR(res.needIncome)} líquidos/mês</b>. Um 2.º titular ou um prazo mais longo podem fazer a diferença.</>
          )}
        </div>
      )}
      <p className="border-t border-line bg-soft px-4 py-2 text-[11.5px] leading-snug text-muted">
        Estimativa com taxa de esforço máxima de 45% e financiamento de 90%. Não inclui seguros. A aprovação depende do banco.
        {token ? " O resultado é partilhado com o André para preparar a sua simulação." : ""}
      </p>
    </div>
  );
}

/* 2. Cláusulas a exigir no CPCV ------------------------------------------- */
const CLAUSES = [
  ["Devolução do sinal se o crédito falhar", "O presente contrato fica sujeito à aprovação de financiamento bancário ao Promitente-Comprador, no montante de [valor], até [data]. Não sendo aprovado, o contrato considera-se resolvido e o sinal é restituído na totalidade no prazo de [n] dias."],
  ["Preço fechado", "O preço total é de [valor], fixo e não sujeito a revisão, e inclui [discriminar: terreno, construção, impostos e encargos incluídos]."],
  ["Prazo com penalização", "A obra será concluída no prazo de [n] meses a contar de [marco]. Por cada dia de atraso imputável ao empreiteiro é devida uma penalização de [valor] por dia."],
  ["Retenção até ao fim da obra", "O montante de [valor] só será pago após a receção da obra sem defeitos e a emissão da licença de utilização."],
];

export function Clauses() {
  const [copied, setCopied] = useState<number | null>(null);
  return (
    <div className="space-y-2.5">
      {CLAUSES.map(([t, txt], i) => (
        <div key={t} className="rounded-xl border border-line bg-white p-3.5">
          <div className="flex items-center justify-between gap-3">
            <b className="text-[14.5px]">{t}</b>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(txt).then(() => {
                  setCopied(i);
                  setTimeout(() => setCopied(null), 1800);
                }).catch(() => {});
              }}
              className="shrink-0 rounded-md border border-line px-2 py-1 text-[12px] font-semibold text-brand print:hidden"
            >
              {copied === i ? "Copiado ✓" : "Copiar"}
            </button>
          </div>
          <p className="mt-1.5 font-serif text-[14px] leading-relaxed text-[#2b3540]">&ldquo;{txt}&rdquo;</p>
        </div>
      ))}
      <p className="text-[12px] text-muted">Texto de referência. Substitua o que está entre [ ] e valide sempre com o seu advogado.</p>
    </div>
  );
}

/* 3. Checklist da vistoria de entrega ------------------------------------- */
const INSPECTION: [string, string[]][] = [
  ["Exterior", ["Fachada sem fissuras nem manchas", "Cobertura e caleiras completas", "Muros, portões e jardim como no projeto"]],
  ["Janelas e portas", ["Abrem, fecham e vedam bem", "Vidros sem riscos", "Estores a funcionar"]],
  ["Paredes e pavimentos", ["Sem humidades nem fissuras", "Pavimento nivelado, sem peças soltas", "Pintura uniforme"]],
  ["Cozinha e casas de banho", ["Torneiras e esgotos sem fugas", "Equipamentos ligados e a funcionar", "Silicones e juntas completos"]],
  ["Instalações", ["Todas as tomadas e luzes funcionam", "Quadro elétrico identificado", "Ar condicionado e água quente testados"]],
  ["Documentos", ["Licença de utilização", "Ficha técnica da habitação", "Certificado energético e garantias"]],
];
const INSP_KEY = "dx_guide_inspection";

export function Inspection() {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(INSP_KEY) || "[]"));
    } catch {}
  }, []);
  const total = INSPECTION.reduce((n, [, items]) => n + items.length, 0);
  function toggle(k: string) {
    setDone((d) => {
      const n = d.includes(k) ? d.filter((x) => x !== k) : [...d, k];
      try {
        localStorage.setItem(INSP_KEY, JSON.stringify(n));
      } catch {}
      return n;
    });
  }
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-soft">
          <div className="h-full rounded-full bg-[#2fa863] transition-all" style={{ width: `${(done.length / total) * 100}%` }} />
        </div>
        <span className="text-[13px] font-semibold tabular-nums">{done.length} de {total}</span>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {INSPECTION.map(([area, items]) => (
          <div key={area} className="rounded-xl border border-line bg-white p-3.5">
            <div className="text-[13px] font-bold uppercase tracking-wide text-brand">{area}</div>
            <ul className="mt-2 space-y-1.5">
              {items.map((it) => {
                const k = `${area}:${it}`;
                return (
                  <li key={k}>
                    <label className="flex cursor-pointer items-start gap-2.5 text-[14px]">
                      <input type="checkbox" checked={done.includes(k)} onChange={() => toggle(k)} className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-[#2fa863]" />
                      <span className={done.includes(k) ? "text-muted line-through" : ""}>{it}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-muted">Registe por escrito e com fotografias tudo o que não estiver bem, antes de assinar a receção.</p>
    </div>
  );
}

/* 5. O meu calendário ----------------------------------------------------- */
const fmtMonth = (d: Date) => new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(d);
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const addMonths = (d: Date, m: number) => new Date(d.getFullYear(), d.getMonth() + m, 1);
// meses desde a visita: crédito +1, CPCV +1, escritura +2, obra 10 meses → chaves +12
const PLAN: [string, number][] = [
  ["Visita e estudo de crédito", 0],
  ["Reserva e CPCV", 1],
  ["Escritura e início da obra", 2],
  ["Entrega das chaves", 12],
];

export function Calendar() {
  const [target, setTarget] = useState("");
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, []);
  const earliest = addMonths(today, 12);
  const goal = target ? new Date(Number(target.slice(0, 4)), Number(target.slice(5, 7)) - 1, 1) : null;
  const start = goal && goal > earliest ? addMonths(goal, -12) : today;
  const late = goal ? goal < earliest : false;
  const minValue = `${earliest.getFullYear()}-${String(earliest.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <label htmlFor="calendar-target" className="block">
        <span className="mb-1 block text-[13px] font-semibold">Quando quer mudar de casa?</span>
        <input id="calendar-target" type="month" min={minValue} value={target} onChange={(e) => setTarget(e.target.value)} className="field max-w-[220px]" />
      </label>
      {late && <p className="mt-2 text-[13px] text-[#6b5313]">É apertado: a data mais cedo realista é {fmtMonth(earliest)}.</p>}
      <ol className="mt-4 grid gap-2 sm:grid-cols-4">
        {PLAN.map(([t, m], i) => (
          <li key={t} className={`rounded-lg p-3 ${i === PLAN.length - 1 ? "bg-cta text-paper" : "bg-soft"}`}>
            <div className={`text-[12px] ${i === PLAN.length - 1 ? "text-white/70" : "text-muted"}`}>{t}</div>
            <div className="mt-0.5 font-bold">{cap(fmtMonth(addMonths(start, m)))}</div>
          </li>
        ))}
      </ol>
      {goal && !late && <p className="mt-3 text-[13.5px]"><b>Para mudar em {fmtMonth(goal)}, deve reservar até {fmtMonth(addMonths(start, 1))}.</b></p>}
      <p className="mt-2 text-[11.5px] text-muted">Estimativa com obra de 10 meses. As datas reais dependem do banco e do contrato.</p>
    </div>
  );
}

/* 4. Comparação ----------------------------------------------------------- */
const COMPARE: [string, string, string, string][] = [
  ["Preço", "Preço de hoje, fechado", "Preço de mercado atual", "Difícil de prever"],
  ["Até mudar", "~12 meses", "2–3 meses", "18–36 meses"],
  ["Risco", "Baixo, se protegido por contrato", "Defeitos escondidos", "Alto: gere tudo sozinho"],
  ["Eficiência", "Alta (casa nova)", "Varia, muitas vezes baixa", "Alta"],
  ["Personalização", "Acabamentos à escolha", "Obras à sua conta", "Total"],
  ["Manutenção", "Nenhuma nos primeiros anos", "Frequente", "Nenhuma nos primeiros anos"],
];

export function Compare() {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[520px] overflow-hidden rounded-xl border border-line text-left text-[13.5px]">
        <thead>
          <tr className="text-[12px] uppercase tracking-wide">
            <th className="bg-soft px-3 py-2.5 text-muted" />
            <th className="bg-cta px-3 py-2.5 text-paper">Em planta</th>
            <th className="bg-soft px-3 py-2.5 text-muted">Usado</th>
            <th className="bg-soft px-3 py-2.5 text-muted">Construir sozinho</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {COMPARE.map(([k, a, b, c]) => (
            <tr key={k}>
              <td className="px-3 py-2.5 font-semibold">{k}</td>
              <td className="bg-brand-soft/60 px-3 py-2.5 font-medium text-brand-ink"><span className="inline-flex items-start gap-1"><IconCheck size={14} className="mt-0.5 shrink-0" />{a}</span></td>
              <td className="px-3 py-2.5 text-muted">{b}</td>
              <td className="px-3 py-2.5 text-muted">{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* 6. Os 5 erros mais caros ------------------------------------------------- */
export function CostlyMistakes() {
  const p = PROJECT.price;
  const items: [string, string, string][] = [
    ["Pagar o sinal sem cláusula de crédito", "Se o banco recusar, pode perder o sinal.", formatEUR(p * 0.1)],
    ["Aceitar um preço “estimado”", "Cada 5% de derrapagem são milhares a mais.", formatEUR(p * 0.05)],
    ["Pagar à frente da obra", "Se a obra parar, o dinheiro fica preso.", "Variável"],
    ["Ignorar a taxa de esforço", "Crédito recusado depois de assinar.", "Sinal + tempo"],
    ["Receber a casa sem vistoria escrita", "Os defeitos passam a ser discutíveis.", "Reparações"],
  ];
  return (
    <ol className="space-y-2">
      {items.map(([t, d, c], i) => (
        <li key={t} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fff4ec] text-[14px] font-bold text-[#c2410c]">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{t}</div>
            <div className="text-[13px] text-muted">{d}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10.5px] uppercase tracking-wide text-muted">Pode custar</div>
            <div className="text-[14px] font-bold tabular-nums text-[#c2410c]">{c}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
