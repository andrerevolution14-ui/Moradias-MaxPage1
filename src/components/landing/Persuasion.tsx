import { formatEUR, PROJECT } from "@/lib/config";
import { IconCamera, IconCheck, IconClock, IconLock, IconShield, IconX } from "../icons";
import Ask from "./Ask";

/** Pedido de contacto a meio da página, logo a seguir a um argumento */
export function InlineCta({ cta, title }: { cta: string; title: string }) {
  return (
    <div data-inline-cta className="mt-7 rounded-xl border border-line bg-soft/70 p-4 text-center sm:flex sm:items-center sm:justify-between sm:gap-4 sm:text-left">
      <p className="text-[15px] font-semibold leading-snug [text-wrap:balance]">{title}</p>
      <div className="mt-3 shrink-0 sm:mt-0">
        <Ask className="btn btn-primary w-full px-5 py-3 text-[15px] sm:w-auto" preset={{ cta }}>Verificar disponibilidade</Ask>
        <p className="mt-1.5 text-[12px] text-muted">Sem compromisso, resposta rápida.</p>
      </div>
    </div>
  );
}

/** "Regra do triângulo": em Aveiro escolhe-se 2 de 3. Aqui tem os 3. */
export function Triangle() {
  const rows = [
    ["Preço + cidade", "Fica sem espaço", "Com 300.000 € no centro de Aveiro compra um T1, sem jardim nem garagem."],
    ["Espaço + preço", "Fica longe de tudo", "Uma moradia grande por esse valor fica a 40 minutos, com horas de trânsito."],
    ["Espaço + cidade", "Paga muito mais", "Moradias grandes perto da cidade passam facilmente os 500.000 €."],
  ] as const;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-4 p-4">
        <svg viewBox="0 0 120 108" className="h-[74px] w-[82px] shrink-0 sm:h-[92px] sm:w-[102px]" aria-hidden>
          <path d="M60 10 L110 98 L10 98 Z" fill="#e8eef5" stroke="#24476b" strokeWidth="2.5" strokeLinejoin="round" />
          {[[60, 10], [110, 98], [10, 98]].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="9" fill="#1fae5b" />
              <path d={`M${x - 4} ${y} l3 3 l5 -6`} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
          <text x="60" y="72" textAnchor="middle" fontSize="13" fontWeight="700" fill="#14202c">3 de 3</text>
        </svg>
        <div className="min-w-0">
          <div className="eyebrow">A regra do triângulo</div>
          <p className="mt-1 text-[14px] font-semibold leading-snug sm:text-[15px]">Espaço, localização e preço. Em Aveiro, quase sempre só pode escolher dois. Aqui tem os três.</p>
        </div>
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {rows.map(([a, b, d]) => (
          <li key={a} className="flex gap-3 px-4 py-3">
            <IconX size={18} className="mt-0.5 shrink-0 text-[#b4441c]" />
            <div className="text-[14px] leading-snug">
              <b>{a}</b> = <b className="text-[#b4441c]">{b}</b>
              <div className="text-[13px] text-muted">{d}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-3 bg-[#effaf3] px-4 py-3.5">
        <IconCheck size={20} className="mt-0.5 shrink-0 text-[#1a8f4b]" />
        <p className="text-[14px] leading-snug">
          <b>Aqui tem os três:</b> T3 com jardim de 82 m², a 8 minutos de Aveiro, por {formatEUR(PROJECT.price)} chave na mão.
        </p>
      </div>
    </div>
  );
}

/** As 4 garantias principais, escritas em contrato. Leitura em 5 segundos. */
export function Guarantees() {
  const down = formatEUR(PROJECT.price * PROJECT.downPaymentPct);
  const items = [
    [IconShield, "Sinal devolvido", `Se o banco não aprovar o crédito, recebe os ${down} de volta. Fica escrito no CPCV.`],
    [IconLock, "Preço fechado", `${formatEUR(PROJECT.price)} em contrato (${formatEUR(PROJECT.priceWithTaxes)} com IMT e Imposto de Selo). Sem revisões de preço.`],
    [IconClock, "10 meses, com penalização", "Prazo fixo em contrato. Se a construtora atrasar, paga uma penalização."],
    [IconCamera, "Fotos da obra todas as semanas", "Recebe um relatório fotográfico semanal, do início à entrega da chave."],
  ] as const;
  return (
    <section id="garantias" className="sec">
      <div className="eyebrow">Garantias em contrato</div>
      <h2 className="sec-title mt-1">Compra em planta sem riscos escondidos</h2>
      <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {items.map(([Icon, t, d]) => (
          <li key={t} className="rounded-xl border border-line bg-white p-3.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#effaf3] text-[#1a8f4b]"><Icon size={20} /></span>
            <div className="mt-2.5 text-[15px] font-bold leading-tight">{t}</div>
            <p className="mt-1 text-[13px] leading-snug text-muted">{d}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
