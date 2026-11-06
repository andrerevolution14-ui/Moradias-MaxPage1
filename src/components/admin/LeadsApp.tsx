"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_LOTS, LEAD_STATUSES, PROMOTER, type Lot, type LotStatus } from "@/lib/config";
import { IconArrowL, IconChat, IconPhone, IconSend, IconWhatsApp, IconX } from "../icons";

type LeadListItem = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  unread: boolean;
  intent: string | null;
  lot: string | null;
  source: Record<string, string>;
  created_at: string;
  last_message_at: string;
  whatsapp_at: string | null;
  affordability: { income: number; debts: number; years: number; rate: number; maxLoan: number; fits: boolean } | null;
  last_message: string | null;
  last_sender: "lead" | "admin" | null;
};
type Lead = LeadListItem & { token: string; notes: string; ip: string | null; user_agent: string | null };
type Msg = { id: number; sender: "lead" | "admin"; body: string; notified: string | null; created_at: string };

const STATUS = Object.fromEntries(LEAD_STATUSES.map((s) => [s.id, s]));

function fmtPhone(d: string) {
  return /^351\d{9}$/.test(d) ? `+351 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}` : `+${d}`;
}
function ago(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "agora";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d`;
  return new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}
function fullDate(d: string) {
  return new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Lisbon" }).format(new Date(d));
}
const first = (n: string) => n.split(" ")[0];

const TEMPLATES = [
  { label: "Tentei ligar", text: (n: string) => `Olá ${first(n)}, obrigado pela sua mensagem! Tentei ligar-lhe agora mas não consegui. Qual é o melhor horário para falarmos?` },
  { label: "Marcar visita", text: (n: string) => `Olá ${first(n)}, terei todo o gosto em mostrar-lhe o terreno em Oliveirinha. Que dia e hora lhe dá mais jeito esta semana?` },
  { label: "Enviar plantas", text: (n: string) => `Olá ${first(n)}, envio-lhe as plantas e o caderno de acabamentos. Se lhe der jeito, posso explicar tudo numa chamada de 10 minutos.` },
  { label: "Estudo bancário", text: (n: string) => `Olá ${first(n)}, para o estudo de viabilidade bancária gratuito preciso de saber: rendimento líquido mensal do agregado, idade(s) e se tem outros créditos. Pode responder aqui ou por chamada.` },
];

export default function LeadsApp() {
  const [auth, setAuth] = useState<"loading" | "out" | "in">("loading");
  const [sms, setSms] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setAuth(d.admin ? "in" : "out");
        setSms(Boolean(d.sms));
        setConfig(d.config || null);
      })
      .catch(() => setAuth("out"));
  }, []);

  if (auth === "loading") return <div className="grid min-h-dvh place-items-center text-muted">A carregar…</div>;
  if (auth === "out") return <Login onOk={() => location.reload()} />;
  return <Dashboard sms={sms} config={config} onLogout={() => setAuth("out")} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid min-h-dvh place-items-center bg-soft px-4">
      <form
        className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
          setBusy(false);
          if (r.ok) onOk();
          else setErr((await r.json().catch(() => ({}))).error || "Erro");
        }}
      >
        <div className="font-serif text-2xl font-semibold">Domaine XXV</div>
        <div className="mb-5 text-sm text-muted">Centro de leads</div>
        <input className="field" type="password" autoFocus placeholder="Palavra-passe" value={pw} onChange={(e) => setPw(e.target.value)} />
        {err && <p className="mt-2 text-sm text-orange-700">{err}</p>}
        <button disabled={busy} className="btn btn-primary mt-4 w-full">{busy ? "A entrar…" : "Entrar"}</button>
      </form>
    </div>
  );
}

type Config = {
  email: { provider: string | null; from: string; notifyTo: string | null; customFrom: boolean };
  meta: { pixelId: string; capi: boolean; testCode: boolean };
  database: boolean;
  siteUrl: string | null;
};

function Dashboard({ sms, config, onLogout }: { sms: boolean; config: Config | null; onLogout: () => void }) {
  const [tab, setTab] = useState<"leads" | "lotes" | "definicoes">("leads");
  const [leads, setLeads] = useState<LeadListItem[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("todas");
  const [q, setQ] = useState("");
  const [now, setNow] = useState(0);

  const loadList = useCallback(async () => {
    const r = await fetch("/api/admin/leads", { cache: "no-store" });
    if (r.status === 401) return onLogout();
    if (r.ok) {
      setLeads((await r.json()).leads);
      setNow(Date.now());
    }
  }, [onLogout]);

  useEffect(() => {
    loadList();
    const id = new URLSearchParams(location.search).get("id");
    if (id) setSelected(Number(id));
    const iv = setInterval(() => document.visibilityState === "visible" && loadList(), 20000);
    return () => clearInterval(iv);
  }, [loadList]);

  const unread = leads?.filter((l) => l.unread).length || 0;
  useEffect(() => {
    document.title = unread ? `(${unread}) Centro de leads` : "Centro de leads · Domaine XXV";
  }, [unread]);

  const stats = useMemo(() => {
    const l = leads || [];
    return {
      total: l.length,
      hoje: l.filter((x) => now - new Date(x.created_at).getTime() < 864e5).length,
      semana: l.filter((x) => now - new Date(x.created_at).getTime() < 7 * 864e5).length,
      porResponder: l.filter((x) => x.last_sender === "lead").length,
    };
  }, [leads, now]);

  const visible = useMemo(() => {
    let l = leads || [];
    if (filter === "por_responder") l = l.filter((x) => x.last_sender === "lead");
    else if (filter !== "todas") l = l.filter((x) => x.status === filter);
    const s = q.trim().toLowerCase();
    if (s) l = l.filter((x) => x.name.toLowerCase().includes(s) || x.phone.includes(s.replace(/\D/g, "") || "§") || (x.email || "").includes(s));
    return l;
  }, [leads, filter, q]);

  function open(id: number) {
    setSelected(id);
    history.replaceState(null, "", `/leads?id=${id}`);
    setLeads((ls) => ls?.map((l) => (l.id === id ? { ...l, unread: false } : l)) || ls);
  }

  return (
    <div className="flex h-dvh flex-col bg-soft">
      <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-2.5">
        <div className="flex items-center gap-4">
          <div className="leading-tight">
            <div className="font-serif text-lg font-semibold">Domaine XXV</div>
            <div className="text-[11px] text-muted">Centro de leads</div>
          </div>
          <div className="flex rounded-lg bg-soft p-0.5 text-sm">
            {(["leads", "lotes", "definicoes"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-md px-2.5 py-1.5 font-semibold sm:px-3 ${tab === t ? "bg-white shadow-sm" : "text-muted"}`}>
                {t === "leads" ? "Leads" : t === "lotes" ? "Lotes" : <span title="Definições">⚙<span className="hidden sm:inline"> Definições</span></span>}
                {t === "leads" && unread > 0 && <span className="ml-1.5 rounded-full bg-brand px-1.5 text-[11px] text-white">{unread}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <a href="/api/admin/export" className="hidden rounded-lg border border-line px-3 py-1.5 font-medium hover:bg-soft sm:block">Exportar CSV</a>
          <a href="/" target="_blank" className="hidden rounded-lg border border-line px-3 py-1.5 font-medium hover:bg-soft sm:block">Ver página</a>
          <button
            className="rounded-lg px-3 py-1.5 text-muted hover:bg-soft"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              onLogout();
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {tab === "definicoes" ? (
        <Settings config={config} />
      ) : tab === "lotes" ? (
        <LotsEditor />
      ) : (
        <div className="flex min-h-0 flex-1">
          {/* LISTA */}
          <div className={`flex w-full min-w-0 flex-col border-r border-line bg-white md:w-[380px] md:shrink-0 ${selected ? "hidden md:flex" : "flex"}`}>
            <div className="grid grid-cols-4 gap-px border-b border-line bg-line text-center">
              {[
                ["Total", stats.total],
                ["Hoje", stats.hoje],
                ["7 dias", stats.semana],
                ["Por responder", stats.porResponder],
              ].map(([k, v]) => (
                <div key={k as string} className="bg-white px-1 py-2">
                  <div className="text-lg font-bold tabular-nums">{v}</div>
                  <div className="text-[10.5px] uppercase tracking-wide text-muted">{k}</div>
                </div>
              ))}
            </div>
            {config && (!config.email.provider || !config.email.notifyTo) && (
              <button onClick={() => setTab("definicoes")} className="border-b border-orange-200 bg-orange-50 px-3 py-2 text-left text-[12.5px] text-orange-800">
                Os avisos de novas leads por email estão desligados. <u>Ver Definições</u>
              </button>
            )}
            <div className="space-y-2 border-b border-line p-3">
              <input className="field py-2 text-sm" placeholder="Procurar nome, telefone ou email" value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                {[{ id: "todas", label: "Todas" }, { id: "por_responder", label: "Por responder" }, ...LEAD_STATUSES].map((s) => (
                  <button key={s.id} className="chip shrink-0 py-1 text-[12px]" aria-pressed={filter === s.id} onClick={() => setFilter(s.id)}>{s.label}</button>
                ))}
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto">
              {!leads && <li className="p-6 text-center text-muted">A carregar…</li>}
              {leads && visible.length === 0 && <li className="p-6 text-center text-sm text-muted">Sem leads {filter !== "todas" ? "neste filtro" : "ainda"}.</li>}
              {visible.map((l) => {
                const st = STATUS[l.status];
                return (
                  <li key={l.id}>
                    <button onClick={() => open(l.id)} className={`flex w-full gap-3 border-b border-line px-3 py-3 text-left hover:bg-soft ${selected === l.id ? "bg-brand-soft" : ""}`}>
                      <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-soft font-bold text-brand-ink">
                        {l.name.slice(0, 1).toUpperCase()}
                        {l.unread && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-brand" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`truncate ${l.unread ? "font-bold" : "font-semibold"}`}>{l.name}</span>
                          <span className="shrink-0 text-[11.5px] text-muted">{ago(l.last_message_at)}</span>
                        </div>
                        <div className="truncate text-[13px] text-muted">
                          {l.last_sender === "admin" && "Você: "}{l.last_message}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="rounded px-1.5 py-0.5 text-[10.5px] font-semibold text-white" style={{ background: st?.color || "#666" }}>{st?.label || l.status}</span>
                          {l.last_sender === "lead" && <span className="text-[10.5px] font-semibold text-orange-600">por responder</span>}
                          {l.whatsapp_at && <span className="rounded bg-[#1fae5b] px-1.5 py-0.5 text-[10.5px] font-semibold text-white">abriu WhatsApp</span>}
                          {l.affordability && (
                            <span className={`rounded px-1.5 py-0.5 text-[10.5px] font-semibold ${l.affordability.fits ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                              {l.affordability.fits ? "orçamento ok" : "orçamento curto"}
                            </span>
                          )}
                          {l.lot && <span className="text-[10.5px] text-muted">{l.lot}</span>}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* DETALHE */}
          <div className={`min-w-0 flex-1 ${selected ? "flex" : "hidden md:flex"}`}>
            {selected ? (
              <LeadDetail key={selected} id={selected} sms={sms} onBack={() => { setSelected(null); history.replaceState(null, "", "/leads"); }} onChange={loadList} />
            ) : (
              <div className="grid flex-1 place-items-center text-muted">
                <div className="text-center"><IconChat size={32} className="mx-auto mb-2" />Escolha uma lead</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadDetail({ id, sms, onBack, onChange }: { id: number; sms: boolean; onBack: () => void; onChange: () => void }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [notes, setNotes] = useState("");
  const [reply, setReply] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/leads/${id}`, { cache: "no-store" });
    if (!r.ok) return;
    const d = await r.json();
    setLead(d.lead);
    setMsgs(d.messages);
    setNotes((n) => (n === "" ? d.lead.notes : n));
  }, [id]);

  useEffect(() => {
    load().then(onChange);
    const iv = setInterval(() => document.visibilityState === "visible" && load(), 15000);
    return () => clearInterval(iv);
  }, [load, onChange]);

  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [msgs.length]);
  useEffect(() => {
    if (lead) {
      setNotifyEmail(Boolean(lead.email));
      setNotifySms(!lead.email && sms);
    }
  }, [lead?.email, sms]); // eslint-disable-line react-hooks/exhaustive-deps

  function flash(t: string) {
    setToast(t);
    setTimeout(() => setToast(""), 3500);
  }

  async function patch(body: Record<string, unknown>) {
    const r = await fetch(`/api/admin/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) {
      setLead((await r.json()).lead);
      onChange();
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    const r = await fetch(`/api/admin/leads/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply, notifyEmail, notifySms }),
    });
    setSending(false);
    if (!r.ok) return flash("Erro ao enviar.");
    const d = await r.json();
    setReply("");
    flash(d.notified ? `Enviado · avisado por ${d.notified.replace(",", " e ")}` : "Guardado no chat (sem aviso por email/SMS)");
    load();
    onChange();
  }

  if (!lead) return <div className="grid flex-1 place-items-center text-muted">A carregar…</div>;

  const waText = `Olá ${first(lead.name)}, é o ${PROMOTER.name}, do Domaine XXV. Recebi a sua mensagem sobre as moradias em Oliveirinha.`;
  const chatUrl = `${location.origin}/conversa/${lead.token}`;
  const src = lead.source || {};

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      {/* Cabeçalho da lead */}
      <div className="border-b border-line bg-white px-3 py-3 sm:px-5">
        <div className="flex items-start gap-2">
          <button onClick={onBack} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-soft md:hidden" aria-label="Voltar"><IconArrowL /></button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-bold">{lead.name}</h2>
              <select
                value={lead.status}
                onChange={(e) => patch({ status: e.target.value })}
                className="rounded-md border-0 px-2 py-1 text-[12px] font-semibold text-white"
                style={{ background: STATUS[lead.status]?.color }}
              >
                {LEAD_STATUSES.map((s) => <option key={s.id} value={s.id} className="bg-white text-ink">{s.label}</option>)}
              </select>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 text-[13.5px] text-muted">
              <span className="tabular-nums">{fmtPhone(lead.phone)}</span>
              {lead.email && <span>{lead.email}</span>}
              <span>desde {fullDate(lead.created_at)}</span>
              {lead.whatsapp_at && <span className="font-semibold text-[#1a8f4b]">abriu o WhatsApp · {fullDate(lead.whatsapp_at)}</span>}
              {lead.affordability && (
                <span className={`font-semibold ${lead.affordability.fits ? "text-emerald-700" : "text-amber-700"}`}>
                  Calculadora: {lead.affordability.income.toLocaleString("pt-PT")} €/mês líquidos
                  {lead.affordability.debts ? ` · ${lead.affordability.debts.toLocaleString("pt-PT")} € em prestações` : ""} · crédito máx. ≈ {lead.affordability.maxLoan.toLocaleString("pt-PT")} € · {lead.affordability.fits ? "cabe no orçamento" : "não chega (sozinho)"}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setShowInfo((s) => !s)} className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-[12.5px] font-medium hover:bg-soft">{showInfo ? "Fechar" : "Detalhes"}</button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:flex">
          <a href={`tel:+${lead.phone}`} className="btn btn-primary px-3 py-2 text-sm"><IconPhone size={16} /> Ligar</a>
          <a href={`https://wa.me/${lead.phone}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener" className="btn btn-wa px-3 py-2 text-sm"><IconWhatsApp size={16} /> WhatsApp</a>
          {lead.email ? (
            <a href={`mailto:${lead.email}?subject=${encodeURIComponent("Moradias Domaine XXV")}`} className="btn btn-ghost px-3 py-2 text-sm">Email</a>
          ) : (
            <button onClick={() => { navigator.clipboard.writeText(`+${lead.phone}`); flash("Número copiado"); }} className="btn btn-ghost px-3 py-2 text-sm">Copiar nº</button>
          )}
        </div>
      </div>

      {showInfo && (
        <div className="fade-in border-b border-line bg-white px-4 py-4 text-[13px] sm:px-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1 font-semibold">Notas internas</div>
              <textarea
                className="field min-h-[90px] text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => notes !== lead.notes && patch({ notes }).then(() => flash("Notas guardadas"))}
                placeholder="Ex.: casal, 2 filhos, aprovação bancária em curso…"
              />
            </div>
            <div className="space-y-1">
              <div className="mb-1 font-semibold">Origem</div>
              {[
                ["Interesse", [lead.intent, lead.lot].filter(Boolean).join(" · ")],
                ["Fonte", src.utm_source],
                ["Campanha", src.utm_campaign],
                ["Anúncio", src.utm_content],
                ["Variante", src.variant],
                ["Botão", src.cta],
                ["Página", src.page],
                ["Facebook click", src.fbclid ? "sim" : ""],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex gap-2"><span className="w-24 shrink-0 text-muted">{k}</span><span className="break-all">{v}</span></div>
              ))}
              <div className="flex gap-2 pt-1"><span className="w-24 shrink-0 text-muted">Link do chat</span>
                <button className="text-left text-brand underline" onClick={() => { navigator.clipboard.writeText(chatUrl); flash("Link copiado"); }}>copiar</button>
              </div>
              <button
                className="pt-2 text-[12px] text-red-600 underline"
                onClick={async () => {
                  if (!confirm(`Apagar a lead ${lead.name} e toda a conversa? Não é possível desfazer.`)) return;
                  await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
                  onChange();
                  onBack();
                }}
              >
                Apagar lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversa */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
        <div className="mx-auto max-w-2xl space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm ${m.sender === "admin" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-white"}`}>
                <div className="whitespace-pre-wrap break-words">{m.body}</div>
                <div className={`mt-1 text-right text-[11px] ${m.sender === "admin" ? "text-white/70" : "text-muted"}`}>
                  {fullDate(m.created_at)}{m.notified ? ` · avisado por ${m.notified}` : ""}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* Resposta */}
      <form onSubmit={send} className="border-t border-line bg-white px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 sm:px-5">
        <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
          {TEMPLATES.map((t) => (
            <button type="button" key={t.label} className="chip shrink-0 py-1 text-[12px]" onClick={() => setReply(t.text(lead.name))}>{t.label}</button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder={`Responder a ${first(lead.name)}…`} className="field max-h-48 flex-1 resize-y text-[15px]" />
          <button disabled={sending || !reply.trim()} className="btn btn-primary h-[46px] px-4 disabled:opacity-50"><IconSend size={18} /></button>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
          <label className={`flex items-center gap-1.5 ${lead.email ? "" : "opacity-50"}`}>
            <input type="checkbox" disabled={!lead.email} checked={notifyEmail && Boolean(lead.email)} onChange={(e) => setNotifyEmail(e.target.checked)} />
            Avisar por email {lead.email ? "" : "(sem email)"}
          </label>
          <label className={`flex items-center gap-1.5 ${sms ? "" : "opacity-50"}`} title={sms ? "" : "Configure o Twilio para ativar SMS"}>
            <input type="checkbox" disabled={!sms} checked={notifySms && sms} onChange={(e) => setNotifySms(e.target.checked)} />
            Avisar por SMS {sms ? "" : "(não configurado)"}
          </label>
        </div>
      </form>

      {toast && (
        <div className="fade-in absolute bottom-28 left-1/2 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg">
          {toast} <button onClick={() => setToast("")} className="ml-1 align-middle opacity-70"><IconX size={14} /></button>
        </div>
      )}
    </div>
  );
}

function LotsEditor() {
  const [lots, setLots] = useState<Lot[]>(DEFAULT_LOTS);
  const [saved, setSaved] = useState("");
  useEffect(() => {
    fetch("/api/lots", { cache: "no-store" }).then((r) => r.json()).then((d) => d.lots && setLots(d.lots)).catch(() => {});
  }, []);
  async function save(next: Lot[]) {
    setLots(next);
    const r = await fetch("/api/admin/lots", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(next.map((l) => [l.id, l.status]))),
    });
    setSaved(r.ok ? "Guardado. A página pública atualiza em menos de 1 minuto." : "Erro ao guardar");
  }
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Estado das moradias</h2>
        <p className="mb-4 text-sm text-muted">O que escolher aqui aparece na tabela da página e no contador “Restam X de 3”.</p>
        <div className="divide-y divide-line">
          {lots.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3 py-3">
              <span className="font-semibold">{l.label}</span>
              <div className="flex rounded-lg bg-soft p-0.5 text-[13px]">
                {(["disponivel", "reservado", "vendido"] as LotStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => save(lots.map((x) => (x.id === l.id ? { ...x, status: s } : x)))}
                    className={`rounded-md px-2.5 py-1.5 font-semibold ${l.status === s ? "bg-white shadow-sm" : "text-muted"}`}
                  >
                    {s === "disponivel" ? "Disponível" : s === "reservado" ? "Reservado" : "Vendido"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {saved && <p className="mt-3 text-sm text-brand">{saved}</p>}
      </div>
    </div>
  );
}

function StatusRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white ${ok ? "bg-emerald-600" : "bg-orange-500"}`}>{ok ? "✓" : "!"}</span>
      <div className="min-w-0"><div className="font-semibold">{label}</div><div className="break-words text-[13px] text-muted">{detail}</div></div>
    </div>
  );
}

function Settings({ config }: { config: Config | null }) {
  const [test, setTest] = useState<{ ok: boolean; error?: string; to?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  if (!config) return <div className="grid flex-1 place-items-center text-muted">A carregar…</div>;
  const e = config.email;
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-lg font-bold">Estado do site</h2>
          <div className="divide-y divide-line text-[14px]">
            <StatusRow ok={config.database} label="Base de dados" detail={config.database ? "Ligada. As leads ficam guardadas aqui." : "Falta DATABASE_URL na Vercel."} />
            <StatusRow ok={Boolean(e.provider)} label="Envio de email" detail={e.provider ? `Ativo por ${e.provider === "resend" ? "Resend" : "SMTP"} · remetente: ${e.from}` : "Falta RESEND_API_KEY na Vercel."} />
            <StatusRow ok={Boolean(e.notifyTo)} label="Email que recebe as leads" detail={e.notifyTo || "Falta LEADS_NOTIFY_EMAIL na Vercel."} />
            <StatusRow ok={config.meta.capi} label="Meta Pixel + API de Conversões" detail={`Pixel ${config.meta.pixelId} · API ${config.meta.capi ? "ativa" : "desligada (falta META_CAPI_ACCESS_TOKEN)"}${config.meta.testCode ? " · ATENÇÃO: modo de teste ligado (apague META_TEST_EVENT_CODE)" : ""}`} />
            <StatusRow ok={Boolean(config.siteUrl)} label="Endereço do site" detail={config.siteUrl || "NEXT_PUBLIC_SITE_URL não definido (usa o domínio da Vercel)."} />
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-lg font-bold">Testar email</h2>
          <p className="mt-1 text-sm text-muted">Envia um email de teste para o endereço que recebe as leads e mostra o erro, se houver.</p>
          <button
            disabled={busy}
            className="btn btn-primary mt-4"
            onClick={async () => {
              setBusy(true);
              setTest(null);
              const r = await fetch("/api/admin/email-test", { method: "POST" });
              setTest(await r.json().catch(() => ({ ok: false, error: "Sem resposta do servidor." })));
              setBusy(false);
            }}
          >
            {busy ? "A enviar…" : "Enviar email de teste"}
          </button>
          {test && (
            <div className={`mt-4 rounded-xl p-3 text-sm ${test.ok ? "bg-emerald-50 text-emerald-800" : "bg-orange-50 text-orange-800"}`}>
              {test.ok ? `Enviado para ${test.to}. Veja a caixa de entrada (e o spam).` : test.error}
              {!test.ok && /domain|verify|testing emails|own email/i.test(test.error || "") && (
                <p className="mt-2">
                  Isto significa que o domínio do remetente não está verificado no Resend. Em resend.com → Domains, adicione o domínio (ex.: verdemont.eu),
                  copie os registos DNS para o seu fornecedor de domínio e carregue em Verify. Depois defina EMAIL_FROM com um endereço desse domínio.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
