import "server-only";
import { db } from "./db";
import type { MetaLeadMode } from "./config";

/** Quando o Lead vai para o Meta: "qualificado" (só depois de o André qualificar no CRM) ou "imediato" (ao enviar o formulário). */
export async function getMetaLeadMode(): Promise<MetaLeadMode> {
  try {
    const sql = await db();
    const [row] = await sql<{ value: { mode?: string } }[]>`SELECT value FROM settings WHERE key = 'meta_lead_mode'`;
    return row?.value?.mode === "imediato" ? "imediato" : "qualificado";
  } catch {
    return "qualificado";
  }
}

export async function setMetaLeadMode(mode: MetaLeadMode) {
  const sql = await db();
  await sql`
    INSERT INTO settings (key, value, updated_at) VALUES ('meta_lead_mode', ${sql.json({ mode })}, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}
