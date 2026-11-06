import "server-only";
import postgres from "postgres";

// Funciona com qualquer Postgres (Neon, Supabase, Railway, local...).
// Na Vercel/Neon use a connection string "pooled" (com -pooler no host).

declare global {
  var __dx_sql: ReturnType<typeof postgres> | undefined;
  var __dx_schema: Promise<void> | undefined;
}

function client() {
  if (!globalThis.__dx_sql) {
    // A integração Neon da Vercel cria DATABASE_URL (e também POSTGRES_URL).
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL não está definido");
    const isLocal = /localhost|127\.0\.0\.1/.test(url);
    globalThis.__dx_sql = postgres(url, {
      ssl: isLocal ? false : "require",
      max: 3,
      idle_timeout: 20,
      prepare: false, // compatível com poolers (pgbouncer / Neon pooler)
    });
  }
  return globalThis.__dx_sql;
}

export async function db() {
  const sql = client();
  if (!globalThis.__dx_schema) {
    globalThis.__dx_schema = ensureSchema(sql).catch((e) => {
      globalThis.__dx_schema = undefined;
      throw e;
    });
  }
  await globalThis.__dx_schema;
  return sql;
}

async function ensureSchema(sql: ReturnType<typeof postgres>) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS leads (
      id            SERIAL PRIMARY KEY,
      token         TEXT UNIQUE NOT NULL,
      name          TEXT NOT NULL,
      phone         TEXT NOT NULL,
      email         TEXT,
      intent        TEXT,
      lot           TEXT,
      status        TEXT NOT NULL DEFAULT 'nova',
      notes         TEXT NOT NULL DEFAULT '',
      unread        BOOLEAN NOT NULL DEFAULT TRUE,
      source        JSONB NOT NULL DEFAULT '{}'::jsonb,
      ip            TEXT,
      user_agent    TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS leads_last_msg_idx ON leads (last_message_at DESC);
    CREATE INDEX IF NOT EXISTS leads_ip_created_idx ON leads (ip, created_at);
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_at TIMESTAMPTZ;
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS affordability JSONB;

    CREATE TABLE IF NOT EXISTS messages (
      id          SERIAL PRIMARY KEY,
      lead_id     INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      sender      TEXT NOT NULL CHECK (sender IN ('lead','admin')),
      body        TEXT NOT NULL,
      notified    TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS messages_lead_idx ON messages (lead_id, created_at);

    CREATE TABLE IF NOT EXISTS settings (
      key    TEXT PRIMARY KEY,
      value  JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export type LeadRow = {
  id: number;
  token: string;
  name: string;
  phone: string;
  email: string | null;
  intent: string | null;
  lot: string | null;
  status: string;
  notes: string;
  unread: boolean;
  source: Record<string, string>;
  ip: string | null;
  user_agent: string | null;
  created_at: Date;
  updated_at: Date;
  last_message_at: Date;
  whatsapp_at: Date | null;
  affordability: { income: number; debts: number; years: number; rate: number; maxLoan: number; fits: boolean; at: string } | null;
};

export type MessageRow = {
  id: number;
  lead_id: number;
  sender: "lead" | "admin";
  body: string;
  notified: string | null;
  created_at: Date;
};
