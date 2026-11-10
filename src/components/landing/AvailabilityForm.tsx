"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie, getFbc, getSource, newEventId, trackingAllowed } from "@/lib/track";
import { ev, flush } from "@/lib/analytics";
import { IconCheck, IconLock } from "../icons";
import GuideCover from "./GuideCover";
import { PROMOTER } from "@/lib/config";
import { useLanding } from "./LandingProvider";

const ME_KEY = "dx_me";

/** Título com o número real de moradias disponíveis */
export function AvailabilityTitle({ className = "" }: { className?: string }) {
  const { available } = useLanding();
  const t =
    available === 0
      ? "As 3 moradias estão reservadas. Entre na lista de espera."
      : available === 1
        ? "Resta apenas 1 moradia. Verifique se continua livre."
        : `Restam apenas ${available} moradias. Verifique se o seu lote continua livre.`;
  return <h2 className={className}>{t}</h2>;
}

const OFFER = ["Calculadora: quanto pode comprar", "Calendário, checklists e cláusulas", "Os erros mais caros a evitar"];

/** Título do formulário (a oferta do guia aparece por baixo do botão) */
export function Offer({ titleClass = "" }: { size?: "sm" | "md"; titleClass?: string }) {
  return <AvailabilityTitle className={titleClass || "text-[19px] font-bold leading-snug tracking-tight [text-wrap:balance]"} />;
}

/** Bónus: guia gratuito, logo abaixo do botão */
function Bonus() {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl bg-[linear-gradient(135deg,#f3f5f8,#e8eef5)] p-3">
      <GuideCover size="sm" />
      <div className="min-w-0">
        <div className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#9a7a2e]">Bónus grátis</div>
        <div className="mt-0.5 text-[14px] font-bold leading-snug">Guia: 12 ferramentas para comprar em planta com segurança</div>
        <ul className="mt-1.5 space-y-0.5 text-[12px] leading-snug text-muted">
          {OFFER.map((o) => (
            <li key={o} className="flex items-start gap-1.5"><IconCheck size={13} className="mt-[2px] shrink-0 text-[#2fa863]" /> {o}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Passo 1 do funil: nome + telemóvel → guarda a lead e leva à página de obrigado (/obrigado).
 * Usado na janela, no cartão lateral e no bloco do André.
 */
export default function AvailabilityForm({ id, compact = false }: { id: string; compact?: boolean }) {
  const router = useRouter();
  const { preset } = useLanding();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hp, setHp] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ msg: string; field?: string } | null>(null);

  // Quem já preencheu antes não tem de voltar a escrever
  useEffect(() => {
    try {
      const me = JSON.parse(localStorage.getItem(ME_KEY) || "null");
      if (me) {
        setName(me.name || "");
        setPhone(me.phone || "");
      }
    } catch {}
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError({ msg: "Indique o seu nome.", field: "name" });
    if (phone.replace(/\D/g, "").length < 9) return setError({ msg: "Indique o seu telemóvel para o André lhe confirmar a disponibilidade.", field: "phone" });
    setSending(true);
    const lot = preset?.lot || null;
    const cta = preset?.cta || id;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          message: `Pedido no site: verificar disponibilidade${lot ? ` (${lot})` : ""} e ver o guia de compra em planta.`,
          intent: "disponibilidade",
          lot,
          website: hp,
          eventId: newEventId("lead"),
          consent: trackingAllowed(),
          fbp: getCookie("_fbp"),
          fbc: getFbc(),
          source: { ...getSource(), page: location.href, cta, variant: process.env.NEXT_PUBLIC_SITE_VARIANT },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError({ msg: data.error || "Não foi possível enviar. Tente novamente ou ligue-nos.", field: data.field });
        setSending(false);
        return;
      }
      try {
        localStorage.setItem(ME_KEY, JSON.stringify({ name, phone }));
      } catch {}
      // O Lead para o Meta é enviado pelo servidor quando o pedido fica guardado (não aqui).
      ev("lead", cta);
      flush(true);
      router.push(`/obrigado${data.token ? `?l=${encodeURIComponent(data.token)}&n=${encodeURIComponent(data.firstName || "")}` : ""}`);
    } catch {
      setError({ msg: "Sem ligação. Verifique a internet ou ligue-nos." });
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate autoComplete="on" method="post" action="#">
      <div className={`grid gap-2.5 ${compact ? "" : "sm:grid-cols-2"}`}>
        <label className="block">
          <span className="mb-1 block text-[13px] font-semibold">Nome</span>
          <input className="field" id={`nome-${id}`} name="name" type="text" autoComplete="name" autoCapitalize="words" enterKeyHint="next" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={error?.field === "name"} placeholder="O seu nome" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] font-semibold">Telemóvel</span>
          <input className="field" id={`tel-${id}`} name="tel" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="send" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={error?.field === "phone"} placeholder="912 345 678" />
        </label>
        <input tabIndex={-1} autoComplete="off" className="hidden" value={hp} onChange={(e) => setHp(e.target.value)} name="website_hp" aria-hidden />
      </div>

      {error && <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-800" role="alert">{error.msg}</p>}

      <button type="submit" disabled={sending} className="btn btn-primary mt-3.5 w-full py-3 text-[15px] disabled:opacity-70">
        {sending ? "A verificar…" : "Verificar disponibilidade"}
      </button>

      <Bonus />

      <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-snug text-muted">
        <IconLock size={13} className="mt-0.5 shrink-0" />
        <span>
          Sem compromisso. Os seus dados servem só para lhe confirmar a disponibilidade. <Link href="/privacidade" className="underline">Privacidade</Link>
        </span>
      </p>
      <p className="mt-1.5 text-[12px] text-muted">
        Prefere falar já? <a href={PROMOTER.phoneHref} className="underline">Ligue {PROMOTER.phoneDisplay}</a>
      </p>
    </form>
  );
}
