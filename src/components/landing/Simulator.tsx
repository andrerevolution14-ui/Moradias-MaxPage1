"use client";

import { useRef, useState } from "react";
import { PROJECT, SIM_DEFAULTS, formatEUR, monthlyPayment } from "@/lib/config";
import { trackOnce } from "@/lib/track";
import { useLanding } from "./LandingProvider";

const nf1 = new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

export default function Simulator() {
  const { openComposer } = useLanding();
  const [years, setYears] = useState(SIM_DEFAULTS.years);
  const [rate, setRate] = useState(SIM_DEFAULTS.rate);
  const touched = useRef(false);

  const price = PROJECT.price;
  const down = Math.round(price * PROJECT.downPaymentPct);
  const loan = price - down;
  const monthly = monthlyPayment(loan, rate, years);

  function touch() {
    if (touched.current) return;
    touched.current = true;
    trackOnce("simulator", "CustomizeProduct", { content_name: "simulador_credito" });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <div className="p-5 sm:p-6">
          <dl className="space-y-3 text-[15px]">
            <Row label="Preço final chave na mão" value={formatEUR(price)} hint="IMT e Imposto de Selo já incluídos" />
            <Row label="Entrada (10%) — paga no CPCV" value={formatEUR(down)} hint="Imputada ao preço total" />
            <Row label="Financiamento (90%)" value={formatEUR(loan)} strong />
          </dl>

          <div className="mt-5 space-y-5">
            <label className="block">
              <div className="mb-1.5 flex justify-between text-sm"><span className="font-semibold">Prazo</span><span className="tabular-nums">{years} anos</span></div>
              <input type="range" className="w-full" min={SIM_DEFAULTS.minYears} max={SIM_DEFAULTS.maxYears} step={1} value={years} onChange={(e) => { setYears(+e.target.value); touch(); }} />
            </label>
            <label className="block">
              <div className="mb-1.5 flex justify-between text-sm"><span className="font-semibold">Taxa de juro anual (TAN)</span><span className="tabular-nums">{nf1.format(rate)}%</span></div>
              <input type="range" className="w-full" min={SIM_DEFAULTS.minRate} max={SIM_DEFAULTS.maxRate} step={0.05} value={rate} onChange={(e) => { setRate(+e.target.value); touch(); }} />
            </label>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 bg-brand p-5 text-white sm:p-6">
          <div>
            <div className="text-sm text-white/75">Prestação mensal estimada</div>
            <div className="mt-1 font-serif text-5xl font-semibold tabular-nums tracking-tight">{formatEUR(monthly)}</div>
            <p className="mt-3 text-[15px] leading-relaxed text-white/90">
              Uma moradia T3 com jardim, a 8 minutos de Aveiro, por cerca de <b>{formatEUR(monthly)} por mês</b> e {formatEUR(down)} de entrada.
            </p>
          </div>
          <button
            className="btn w-full bg-white text-brand-ink hover:bg-brand-soft"
            onClick={() =>
              openComposer({
                intent: "credito",
                cta: "simulador",
                text: `Olá André, fiz a simulação no site (${formatEUR(loan)} a ${years} anos, cerca de ${formatEUR(monthly)}/mês). Gostava de um estudo de viabilidade bancária gratuito.`,
              })
            }
          >
            Pedir estudo bancário gratuito
          </button>
        </div>
      </div>
      <p className="border-t border-line bg-soft px-5 py-3 text-[11.5px] leading-relaxed text-muted">
        Simulação meramente indicativa e não vinculativa, calculada pelo método de prestações constantes. A entrada de 10% é calculada sobre o valor final de {formatEUR(price)}, que inclui os impostos de aquisição
        e os encargos bancários previstos, discriminados no contrato. A prestação depende da TAN, do prazo e das condições do banco, incluindo eventuais seguros periódicos. Crédito sujeito a aprovação bancária.
      </p>
    </div>
  );
}

function Row({ label, value, hint, strong }: { label: string; value: string; hint?: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed border-line pb-3 last:border-0">
      <dt>
        <div className={strong ? "font-semibold" : ""}>{label}</div>
        {hint && <div className="text-[12.5px] text-muted">{hint}</div>}
      </dt>
      <dd className={`tabular-nums ${strong ? "text-lg font-bold" : "font-semibold"}`}>{value}</dd>
    </div>
  );
}

export function MonthlyFrom() {
  const m = monthlyPayment(PROJECT.price * (1 - PROJECT.downPaymentPct), SIM_DEFAULTS.rate, SIM_DEFAULTS.years);
  return <>{formatEUR(m)}</>;
}
