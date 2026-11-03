import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { escapeHtml, formatPhone } from "./server-utils";
import { PROMOTER, PROJECT } from "./config";

// ---------------- EMAIL (Resend por API; SMTP como alternativa) ----------------

let transporter: Transporter | null = null;
function mailer() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

function fromAddress() {
  return process.env.EMAIL_FROM || process.env.SMTP_FROM || `${PROJECT.name} <onboarding@resend.dev>`;
}

export function emailStatus() {
  const provider = process.env.RESEND_API_KEY ? "resend" : process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS ? "smtp" : null;
  return { provider, from: fromAddress(), notifyTo: process.env.LEADS_NOTIFY_EMAIL || null, customFrom: Boolean(process.env.EMAIL_FROM || process.env.SMTP_FROM) };
}

/** Envia email pelo Resend (RESEND_API_KEY) ou, em alternativa, por SMTP. Devolve o erro em texto. Nunca lança. */
export async function sendEmailDetailed(to: string, subject: string, html: string, replyTo?: string): Promise<{ ok: boolean; error?: string }> {
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromAddress(), to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
      });
      if (res.ok) return { ok: true };
      const text = await res.text();
      console.error("[email] Resend falhou", res.status, text);
      let msg = text;
      try {
        msg = JSON.parse(text).message || text;
      } catch {}
      return { ok: false, error: `Resend ${res.status}: ${msg}` };
    } catch (e) {
      console.error("[email] Resend erro", e);
      return { ok: false, error: `Resend: ${(e as Error).message}` };
    }
  }
  const t = mailer();
  if (!t) {
    console.warn("[email] Email não configurado (RESEND_API_KEY ou SMTP_*) — não enviado:", subject);
    return { ok: false, error: "Email não configurado: falta a variável RESEND_API_KEY na Vercel." };
  }
  try {
    await t.sendMail({ from: fromAddress(), to, subject, html, replyTo });
    return { ok: true };
  } catch (e) {
    console.error("[email] SMTP falhou", e);
    return { ok: false, error: `SMTP: ${(e as Error).message}` };
  }
}

export async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  return (await sendEmailDetailed(to, subject, html, replyTo)).ok;
}

/** Email de teste para o André (botão em /leads → Definições) */
export async function sendTestEmail() {
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!to) return { ok: false, error: "Falta a variável LEADS_NOTIFY_EMAIL na Vercel (o email onde quer receber as leads)." };
  const r = await sendEmailDetailed(
    to,
    `Teste de email · ${PROJECT.name}`,
    layout(`<h1 style="font-size:20px;margin:0 0 8px">Os avisos de leads estão a funcionar.</h1><p style="font-size:15px;line-height:1.6;margin:0">A partir de agora recebe aqui um email por cada nova mensagem no site.</p>`),
  );
  return { ...r, to };
}

function layout(inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f2;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1c1c">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="font-family:Georgia,serif;font-size:20px;letter-spacing:.04em;margin-bottom:16px">${PROJECT.name}</div>
    <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e7e5e0">${inner}</div>
    <p style="font-size:12px;color:#8a8780;margin-top:16px">${PROJECT.name} · ${PROJECT.postal}</p>
  </div></body></html>`;
}

function button(href: string, label: string, bg = "#1b3048") {
  return `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;margin:4px 6px 4px 0">${label}</a>`;
}

type LeadInfo = { id: number; name: string; phone: string; email: string | null; intent?: string | null; lot?: string | null; source?: Record<string, string> };

/** Email para o André: nova lead */
export async function notifyAdminNewLead(lead: LeadInfo, message: string, base: string) {
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!to) return false;
  const wa = `https://wa.me/${lead.phone}?text=${encodeURIComponent(`Olá ${lead.name.split(" ")[0]}, é o André Queirós, do Domaine XXV. Recebi a sua mensagem sobre as moradias em Oliveirinha.`)}`;
  const src = lead.source || {};
  const srcLine = [src.utm_source, src.utm_campaign, src.utm_content, src.variant && `variante ${src.variant}`].filter(Boolean).join(" · ");
  const html = layout(`
    <div style="font-size:13px;color:#1b3048;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Nova lead</div>
    <h1 style="font-size:22px;margin:6px 0 2px">${escapeHtml(lead.name)}</h1>
    <div style="font-size:16px;margin-bottom:14px"><a href="tel:+${lead.phone}" style="color:#1c1c1c">${formatPhone(lead.phone)}</a>${lead.email ? ` · ${escapeHtml(lead.email)}` : ""}</div>
    <div style="background:#f4f4f2;border-radius:10px;padding:14px 16px;white-space:pre-wrap;font-size:15px;line-height:1.5">${escapeHtml(message)}</div>
    ${lead.lot ? `<p style="font-size:14px;margin:12px 0 0">Interesse: <b>${escapeHtml(lead.lot)}</b></p>` : ""}
    ${srcLine ? `<p style="font-size:12px;color:#8a8780;margin:8px 0 0">Origem: ${escapeHtml(srcLine)}</p>` : ""}
    <div style="margin-top:18px">
      ${button(`tel:+${lead.phone}`, "Ligar agora")}
      ${button(wa, "WhatsApp", "#1f9d55")}
      ${button(`${base}/leads?id=${lead.id}`, "Abrir no centro de leads", "#1c1c1c")}
    </div>`);
  return sendEmail(to, `Nova lead: ${lead.name} · ${formatPhone(lead.phone)}`, html, lead.email || undefined);
}

/** Email para o André: a lead respondeu no chat */
export async function notifyAdminLeadReply(lead: LeadInfo, message: string, base: string) {
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!to) return false;
  const html = layout(`
    <div style="font-size:13px;color:#1b3048;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Nova mensagem</div>
    <h1 style="font-size:20px;margin:6px 0 12px">${escapeHtml(lead.name)} respondeu</h1>
    <div style="background:#f4f4f2;border-radius:10px;padding:14px 16px;white-space:pre-wrap;font-size:15px;line-height:1.5">${escapeHtml(message)}</div>
    <div style="margin-top:18px">${button(`${base}/leads?id=${lead.id}`, "Responder")}${button(`tel:+${lead.phone}`, "Ligar", "#1c1c1c")}</div>`);
  return sendEmail(to, `Mensagem de ${lead.name}`, html);
}

/** Email para a lead: confirmação (só se deixou email) */
export async function emailLeadConfirmation(lead: LeadInfo, chatUrl: string) {
  if (!lead.email) return false;
  const first = escapeHtml(lead.name.split(" ")[0]);
  const html = layout(`
    <h1 style="font-size:20px;margin:0 0 10px">Olá ${first}, recebemos a sua mensagem.</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 10px">O ${PROMOTER.name} vai contactá-lo(a) <b>ainda hoje</b> para o número ${formatPhone(lead.phone)} ou responder-lhe por escrito.</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Não precisa de guardar o site: pode acompanhar a conversa a qualquer momento neste link privado.</p>
    ${button(chatUrl, "Abrir a minha conversa")}
    <p style="font-size:13px;color:#8a8780;margin:18px 0 0">Prefere falar já? WhatsApp ${PROMOTER.phoneDisplay}</p>`);
  return sendEmail(lead.email, `Recebemos a sua mensagem · ${PROJECT.name}`, html);
}

/** Email para a lead: o André respondeu */
export async function emailLeadReply(lead: LeadInfo, message: string, chatUrl: string) {
  if (!lead.email) return false;
  const html = layout(`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><b>${PROMOTER.name}</b>&nbsp;respondeu à sua mensagem</div>
    <div style="background:#f4f4f2;border-radius:10px;padding:14px 16px;white-space:pre-wrap;font-size:15px;line-height:1.5">${escapeHtml(message)}</div>
    <div style="margin-top:18px">${button(chatUrl, "Responder")}</div>`);
  return sendEmail(lead.email, `${PROMOTER.name} respondeu · ${PROJECT.name}`, html);
}

// ---------------- SMS (Twilio, opcional) ----------------

export function smsEnabled() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && (process.env.TWILIO_FROM || process.env.TWILIO_MESSAGING_SERVICE_SID));
}

/** Remove acentos para caber em 160 caracteres (GSM-7) */
function gsm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export async function sendSms(toDigits: string, body: string) {
  if (!smsEnabled()) return false;
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const params = new URLSearchParams({ To: `+${toDigits}`, Body: gsm(body) });
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) params.set("MessagingServiceSid", process.env.TWILIO_MESSAGING_SERVICE_SID);
  else params.set("From", process.env.TWILIO_FROM!);
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    if (!res.ok) console.error("[sms] falhou", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("[sms] erro", e);
    return false;
  }
}

export function smsLeadConfirmation(lead: LeadInfo, chatUrl: string) {
  if (process.env.SMS_ON_NEW_LEAD !== "true") return Promise.resolve(false);
  return sendSms(lead.phone, `Domaine XXV: recebemos a sua mensagem. O Andre vai contacta-lo hoje. A sua conversa: ${chatUrl}`);
}

export function smsLeadReply(lead: LeadInfo, chatUrl: string) {
  return sendSms(lead.phone, `Domaine XXV: o Andre Queiros respondeu a sua mensagem. Veja aqui: ${chatUrl}`);
}
