"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_MESSAGE, PROMOTER, QUICK_INTENTS } from "@/lib/config";
import { getCookie, getFbc, getSource, newEventId, responseWindow, saveChat, track, trackingAllowed } from "@/lib/track";
import { IconCheck, IconLock, IconSend, IconWhatsApp } from "../icons";
import { useLanding } from "./LandingProvider";

type Props = { variant: "card" | "sheet" | "inline"; id?: string };

const ME_KEY = "dx_me";

export default function Composer({ variant, id }: Props) {
  const { preset, presetKey, setChat } = useLanding();
  const [intent, setIntent] = useState<string | null>(null);
  const [lot, setLot] = useState<string | null>(null);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [cta, setCta] = useState<string>(variant);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ msg: string; field?: string } | null>(null);
  const [done, setDone] = useState<{ firstName: string; token: string | null; phone: string; hasEmail: boolean } | null>(null);
  const [when, setWhen] = useState("ainda hoje");
  const started = useRef(false);

  useEffect(() => {
    setWhen(responseWindow());
    // Quem já escreveu antes não tem de voltar a preencher
    try {
      const me = JSON.parse(localStorage.getItem(ME_KEY) || "null");
      if (me) {
        setName(me.name || "");
        setPhone(me.phone || "");
        setEmail(me.email || "");
      }
    } catch {}
  }, []);

  // Pré-preenchimento vindo de outros botões da página
  useEffect(() => {
    if (!preset) return;
    if (preset.text) setMessage(preset.text);
    if (preset.intent) {
      setIntent(preset.intent);
      const q = QUICK_INTENTS.find((i) => i.id === preset.intent);
      if (q && !preset.text) setMessage(q.text);
    }
    if (preset.lot) setLot(preset.lot);
    if (preset.cta) setCta(preset.cta);
    setDone(null);
  }, [presetKey, preset]);

  function pickIntent(id: string) {
    const q = QUICK_INTENTS.find((i) => i.id === id)!;
    setIntent(id);
    setMessage(lot ? q.text.replace("Domaine XXV", `Domaine XXV (${lot})`) : q.text);
  }

  function onFirstInput() {
    if (started.current) return;
    started.current = true;
    track("CustomizeProduct", { content_name: "composer_start", cta });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError({ msg: "Indique o seu nome.", field: "name" });
    if (phone.replace(/\D/g, "").length < 9) return setError({ msg: "Indique o seu telemóvel para o André lhe poder ligar.", field: "phone" });
    setSending(true);
    const eventId = newEventId("lead");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          intent,
          lot,
          website: hp,
          eventId,
          consent: trackingAllowed(),
          fbp: getCookie("_fbp"),
          fbc: getFbc(),
          source: { ...getSource(), page: location.href, cta, variant: process.env.NEXT_PUBLIC_SITE_VARIANT },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError({ msg: data.error || "Não foi possível enviar. Tente novamente ou use o WhatsApp.", field: data.field });
        return;
      }
      // O Lead NÃO é contado aqui (no botão). É enviado ao Meta pelo servidor só quando a mensagem fica guardada.
      if (data.token) saveChat(data.token, data.firstName);
      try {
        localStorage.setItem(ME_KEY, JSON.stringify({ name, phone, email }));
      } catch {}
      if (data.token) setChat({ token: data.token, firstName: data.firstName });
      setDone({ firstName: data.firstName, token: data.token, phone, hasEmail: data.hasEmail });
    } catch {
      setError({ msg: "Sem ligação. Verifique a internet ou fale connosco por WhatsApp." });
    } finally {
      setSending(false);
    }
  }

  const waHref = `https://wa.me/${PROMOTER.whatsapp}?text=${encodeURIComponent(message || DEFAULT_MESSAGE)}`;
  const compact = variant === "card";

  if (done) {
    const d = done;
    return (
      <div className="fade-in" id={id}>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white"><IconCheck size={22} /></span>
          <div>
            <div className="text-lg font-bold">Mensagem enviada</div>
            <div className="text-sm text-muted">Já está com o {PROMOTER.name.split(" ")[0]}.</div>
          </div>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed">
          {d.firstName}, o {PROMOTER.name} vai ligar-lhe <b>{when}</b> para o <b>{d.phone}</b>, ou responder-lhe por escrito.
          Não precisa de fazer mais nada.
        </p>
        {d.token && (
          <div className="mt-4 rounded-xl bg-soft p-4 text-sm leading-relaxed">
            <b>Não precisa de guardar o site.</b> A sua conversa fica disponível num link privado
            {d.hasEmail ? " — enviámos-lho também por email" : ""}. Se voltar a esta página, encontra-a no canto do ecrã.
          </div>
        )}
        <div className="mt-4 grid gap-2">
          {d.token && <Link href={`/conversa/${d.token}`} className="btn btn-primary w-full">Abrir a minha conversa</Link>}
          <a href={waHref} target="_blank" rel="noopener" onClick={() => track("Contact", { method: "whatsapp", cta: "after_lead" })} className="btn btn-ghost w-full">
            <IconWhatsApp size={18} className="text-wa" /> Prefiro adiantar no WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} id={id} noValidate onInput={onFirstInput}>
      {variant !== "sheet" && (
        <div className="flex items-center gap-3">
          <Image src={PROMOTER.avatar} alt={PROMOTER.name} width={52} height={52} className="h-[52px] w-[52px] rounded-full object-cover" />
          <div className="min-w-0">
            <div className="font-bold leading-tight">{PROMOTER.name}</div>
            <div className="text-[13px] text-muted">{PROMOTER.role} · Domaine XXV</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-brand">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-brand" /></span>
              Responde {when}
            </div>
          </div>
        </div>
      )}

      <div className={variant === "sheet" ? "" : "mt-4"}>
        <div className="mb-2 text-[13px] font-semibold">{variant === "inline" ? "Sobre o que quer falar?" : "Pergunte ao André"}</div>
        <div className={`flex gap-1.5 ${compact ? "flex-wrap" : "no-scrollbar -mx-1 overflow-x-auto px-1 pb-1 sm:flex-wrap"}`}>
          {QUICK_INTENTS.map((q) => (
            <button key={q.id} type="button" className="chip shrink-0" aria-pressed={intent === q.id} onClick={() => pickIntent(q.id)}>
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-3 block">
        <span className="sr-only">Mensagem</span>
        <textarea
          className="field resize-none leading-relaxed"
          rows={compact ? 4 : 4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
        />
      </label>
      {lot && (
        <div className="mt-2 flex items-center gap-2 text-[13px]">
          <span className="rounded-md bg-brand-soft px-2 py-0.5 font-semibold text-brand-ink">{lot}</span>
          <button type="button" className="text-muted underline" onClick={() => setLot(null)}>remover</button>
        </div>
      )}

      <div className={`mt-3 grid gap-2.5 ${variant === "inline" ? "sm:grid-cols-2" : ""}`}>
        <label className="block">
          <span className="mb-1 block text-[13px] font-semibold">Nome</span>
          <input className="field" id={`nome-${variant}`} name="name" autoComplete="name" autoCapitalize="words" enterKeyHint="next" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={error?.field === "name"} placeholder="O seu nome" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] font-semibold">Telemóvel</span>
          <input className="field" id={`tel-${variant}`} name="tel" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={error?.field === "phone"} placeholder="912 345 678" />
        </label>
        <label className={`block ${variant === "inline" ? "sm:col-span-2" : ""}`}>
          <span className="mb-1 flex items-baseline justify-between text-[13px] font-semibold">
            Email <span className="font-normal text-muted">opcional</span>
          </span>
          <input className="field" id={`email-${variant}`} name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="off" enterKeyHint="send" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={error?.field === "email"} placeholder="Para receber a resposta por escrito" />
        </label>
        <input tabIndex={-1} autoComplete="off" className="hidden" value={hp} onChange={(e) => setHp(e.target.value)} name="website_hp" aria-hidden />
      </div>

      {error && <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-800" role="alert">{error.msg}</p>}

      <button type="submit" disabled={sending} className="btn btn-primary mt-4 w-full py-3.5 text-[15px] disabled:opacity-70">
        {sending ? "A enviar…" : (<><IconSend size={18} /> Enviar mensagem</>)}
      </button>

      <ul className="mt-3 space-y-1 text-[12.5px] text-muted">
        <li className="flex items-start gap-1.5"><IconCheck size={14} className="mt-0.5 shrink-0 text-brand" /> O André contacta-o {when}, por telefone ou por escrito</li>
        <li className="flex items-start gap-1.5"><IconCheck size={14} className="mt-0.5 shrink-0 text-brand" /> Recebe um link privado para acompanhar a conversa</li>
        <li className="flex items-start gap-1.5"><IconLock size={14} className="mt-0.5 shrink-0 text-brand" /> Sem compromisso. Os seus dados não são partilhados</li>
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-muted/80">
        Ao enviar aceita ser contactado sobre este imóvel. <Link href="/privacidade" className="underline">Privacidade</Link>
      </p>
    </form>
  );
}
