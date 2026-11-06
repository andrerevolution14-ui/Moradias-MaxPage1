import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard } from "../_guard";

// Resumo das estatísticas anónimas para o painel /leads → Estatísticas
export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const days = Math.max(1, Math.min(90, Number(req.nextUrl.searchParams.get("days")) || 7));
  const sql = await db();
  const since = sql`now() - make_interval(days => ${days})`;

  const [totals] = await sql<{ sessions: number; views: number }[]>`
    SELECT count(DISTINCT session)::int AS sessions, count(*)::int AS views
    FROM events WHERE type = 'view' AND path = '/' AND created_at > ${since}`;

  const [engage] = await sql<{ avg_time: number; median_time: number; avg_scroll: number }[]>`
    WITH t AS (SELECT session, sum(value) AS secs FROM events WHERE type = 'time' AND path = '/' AND created_at > ${since} GROUP BY session),
         s AS (SELECT session, max(value) AS pct FROM events WHERE type = 'scroll' AND path = '/' AND created_at > ${since} GROUP BY session)
    SELECT coalesce(round(avg(t.secs)), 0)::int AS avg_time,
           coalesce(round(percentile_cont(0.5) WITHIN GROUP (ORDER BY t.secs)), 0)::int AS median_time,
           coalesce((SELECT round(avg(pct)) FROM s), 0)::int AS avg_scroll
    FROM t`;

  const step = (where: ReturnType<typeof sql>) =>
    sql<{ n: number }[]>`SELECT count(DISTINCT session)::int AS n FROM events WHERE created_at > ${since} AND ${where}`.then((r) => r[0].n);
  const [formOpen, leads, thanks, guide, whatsapp] = await Promise.all([
    step(sql`type = 'form_open'`),
    step(sql`type = 'lead'`),
    step(sql`type = 'view' AND path = '/obrigado'`),
    step(sql`type = 'view' AND path = '/guia'`),
    step(sql`type = 'whatsapp'`),
  ]);

  const sections = await sql<{ name: string; n: number }[]>`
    SELECT name, count(DISTINCT session)::int AS n FROM events
    WHERE type = 'section' AND path = '/' AND created_at > ${since}
    GROUP BY name ORDER BY n DESC LIMIT 15`;
  const guideSections = await sql<{ name: string; n: number }[]>`
    SELECT name, count(DISTINCT session)::int AS n FROM events
    WHERE type = 'section' AND path = '/guia' AND created_at > ${since}
    GROUP BY name ORDER BY n DESC LIMIT 15`;
  const clicks = await sql<{ name: string; n: number }[]>`
    SELECT name, count(*)::int AS n FROM events
    WHERE type = 'click' AND created_at > ${since} AND name <> ''
    GROUP BY name ORDER BY n DESC LIMIT 15`;
  const sources = await sql<{ name: string; n: number }[]>`
    SELECT coalesce(meta->>'source', 'direto') AS name, count(DISTINCT session)::int AS n FROM events
    WHERE type = 'view' AND path = '/' AND created_at > ${since}
    GROUP BY 1 ORDER BY n DESC LIMIT 8`;
  const devices = await sql<{ name: string; n: number }[]>`
    SELECT coalesce(meta->>'device', '?') AS name, count(DISTINCT session)::int AS n FROM events
    WHERE type = 'view' AND path = '/' AND created_at > ${since}
    GROUP BY 1 ORDER BY n DESC`;
  const daily = await sql<{ day: string; n: number }[]>`
    SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'Europe/Lisbon'), 'DD/MM') AS day, count(DISTINCT session)::int AS n
    FROM events WHERE type = 'view' AND path = '/' AND created_at > ${since}
    GROUP BY date_trunc('day', created_at AT TIME ZONE 'Europe/Lisbon') ORDER BY date_trunc('day', created_at AT TIME ZONE 'Europe/Lisbon')`;

  return NextResponse.json(
    {
      days,
      visits: totals.sessions,
      avgTime: engage?.avg_time || 0,
      medianTime: engage?.median_time || 0,
      avgScroll: engage?.avg_scroll || 0,
      funnel: [
        ["Visitas", totals.sessions],
        ["Abriram o formulário", formOpen],
        ["Enviaram o pedido", leads],
        ["Viram a página de obrigado", thanks],
        ["Abriram o guia", guide],
        ["Carregaram no WhatsApp", whatsapp],
      ],
      sections,
      guideSections,
      clicks,
      sources,
      devices,
      daily,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
