"use client";

import { LOT_SPEC, PROJECT, formatEUR, type LotStatus } from "@/lib/config";
import { useLanding } from "./LandingProvider";

const STATUS: Record<LotStatus, { label: string; cls: string }> = {
  disponivel: { label: "Disponível", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  reservado: { label: "Reservado", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  vendido: { label: "Vendido", cls: "bg-zinc-100 text-zinc-500 ring-zinc-200" },
};

export default function LotsTable() {
  const { lots, available, openComposer } = useLanding();
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[15px] text-muted">
          3 moradias iguais, lado a lado. {available > 0 ? <b className="text-ink">Restam {available} disponíveis.</b> : <b className="text-ink">Todas reservadas — peça para entrar na lista de espera.</b>}
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-soft text-[12px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Moradia</th>
              <th className="hidden px-3 py-2.5 font-semibold sm:table-cell">Tipologia</th>
              <th className="hidden px-3 py-2.5 font-semibold sm:table-cell">Área útil</th>
              <th className="hidden px-3 py-2.5 font-semibold md:table-cell">Jardim</th>
              <th className="px-3 py-2.5 font-semibold">Preço</th>
              <th className="px-3 py-2.5 font-semibold">Estado</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {lots.map((l) => {
              const s = STATUS[l.status];
              const off = l.status !== "disponivel";
              return (
                <tr key={l.id} className={`border-t border-line ${off ? "text-muted" : ""}`}>
                  <td className="px-3 py-3 font-semibold">
                    {l.label}
                    <div className="text-[12px] font-normal text-muted sm:hidden">{LOT_SPEC.typology} · {LOT_SPEC.usefulArea}</div>
                  </td>
                  <td className="hidden px-3 py-3 sm:table-cell">{LOT_SPEC.typology}</td>
                  <td className="hidden px-3 py-3 sm:table-cell">{LOT_SPEC.usefulArea}</td>
                  <td className="hidden px-3 py-3 md:table-cell">{LOT_SPEC.garden}</td>
                  <td className={`px-3 py-3 font-semibold tabular-nums ${off ? "line-through decoration-1" : ""}`}>{formatEUR(PROJECT.price)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-semibold ring-1 ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    {!off && (
                      <button
                        className="rounded-lg border border-brand px-2.5 py-1.5 text-[13px] font-semibold text-brand hover:bg-brand-soft"
                        onClick={() =>
                          openComposer({
                            lot: l.label,
                            intent: "disponibilidade",
                            cta: `lote_${l.id}`,
                            text: `Olá André, tenho interesse no ${l.label} das moradias Domaine XXV. Gostava de saber os próximos passos para reservar.`,
                          })
                        }
                      >
                        Pedir info
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-muted">Preço chave na mão por moradia, com IMT e Imposto de Selo incluídos.</p>
    </div>
  );
}

export function AvailabilityLine() {
  const { available } = useLanding();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[12.5px] font-semibold text-brand-ink ring-1 ring-[#cfdae6]">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      {available > 0 ? `Restam ${available} de 3 moradias` : "Todas reservadas"}
    </span>
  );
}
