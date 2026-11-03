import "server-only";
import { db } from "./db";
import { DEFAULT_LOTS, type Lot, type LotStatus } from "./config";

const VALID: LotStatus[] = ["disponivel", "reservado", "vendido"];

export async function getLots(): Promise<Lot[]> {
  try {
    const sql = await db();
    const [row] = await sql<{ value: Record<string, LotStatus> }[]>`SELECT value FROM settings WHERE key = 'lots'`;
    if (!row) return DEFAULT_LOTS;
    return DEFAULT_LOTS.map((l) => ({ ...l, status: VALID.includes(row.value[l.id]) ? row.value[l.id] : l.status }));
  } catch {
    return DEFAULT_LOTS;
  }
}

export async function setLots(input: Record<string, string>) {
  const value: Record<string, LotStatus> = {};
  for (const l of DEFAULT_LOTS) {
    const s = input[l.id] as LotStatus;
    value[l.id] = VALID.includes(s) ? s : l.status;
  }
  const sql = await db();
  await sql`
    INSERT INTO settings (key, value, updated_at) VALUES ('lots', ${sql.json(value)}, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
  return getLots();
}
