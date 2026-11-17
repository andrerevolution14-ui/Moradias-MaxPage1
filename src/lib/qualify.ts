import "server-only";
import type { NextRequest } from "next/server";
import { db, type LeadRow } from "./db";
import { sendCapiEvent, capiEnabled } from "./meta";
import { LEAD_QUALITIES, META_LEAD_VALUE, PROMOTER } from "./config";
import { normalizePhone } from "./server-utils";

export type MetaResult = { sent: string[]; skipped?: string };

function excludedPhone(phone: string) {
  const list = [PROMOTER.whatsapp, ...(process.env.META_EXCLUDE_PHONES || "").split(",")].map((p) => normalizePhone(p.trim())).filter(Boolean);
  return list.includes(phone);
}

/**
 * Envia ao Meta (API de Conversões) os eventos da qualificação escolhida, cada um só uma vez por lead.
 * Usa os dados guardados no momento do pedido (IP, navegador, cookies _fbp/_fbc, página) para o Meta
 * conseguir ligar o evento ao clique no anúncio, mesmo que seja enviado dias depois.
 */
export async function sendQualification(req: NextRequest, lead: LeadRow): Promise<{ lead: LeadRow; meta: MetaResult }> {
  const q = LEAD_QUALITIES.find((x) => x.id === lead.quality);
  const wanted = (q?.meta || []) as readonly string[];
  const todo = wanted.filter((e) => !lead.meta_sent.includes(e));
  if (!todo.length) return { lead, meta: { sent: [] } };
  if (!capiEnabled()) return { lead, meta: { sent: [], skipped: "API de Conversões desligada (falta META_CAPI_ACCESS_TOKEN)" } };
  if (excludedPhone(lead.phone)) return { lead, meta: { sent: [], skipped: "Número excluído (o seu ou de teste)" } };

  const src = lead.source || {};
  const sent: string[] = [];
  let skipped: string | undefined;
  for (const eventName of todo) {
    const r = await sendCapiEvent(req, {
      eventName,
      eventId: `${eventName.toLowerCase()}-${lead.id}`,
      eventSourceUrl: src.page,
      user: { phone: lead.phone, email: lead.email, name: lead.name, externalId: String(lead.id) },
      fbp: src.fbp || null,
      fbc: src.fbc || (src.fbclid ? `fb.1.${new Date(lead.created_at).getTime()}.${src.fbclid}` : null),
      ip: lead.ip,
      userAgent: lead.user_agent,
      customData: {
        content_name: "Domaine XXV",
        content_category: lead.intent || "disponibilidade",
        lead_quality: lead.quality,
        ...(eventName === "Schedule" ? {} : META_LEAD_VALUE),
      },
    });
    if ("ok" in r && r.ok) sent.push(eventName);
    else skipped = "reason" in r && r.reason === "not-production" ? "Só envia a partir do site oficial (não de testes/pré-visualizações)" : "O Meta não aceitou o envio (ver registos da Vercel)";
  }
  if (sent.length) {
    const sql = await db();
    [lead] = await sql<LeadRow[]>`
      UPDATE leads SET meta_sent = (SELECT array_agg(DISTINCT e) FROM unnest(meta_sent || ${sent}::text[]) e)
      WHERE id = ${lead.id} RETURNING *`;
  }
  return { lead, meta: { sent, skipped } };
}
