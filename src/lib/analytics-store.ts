import {
  accessSync,
  appendFileSync,
  constants,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

/* ═══════════════════════════════════════════════════════
   Usage analytics — append-only event log (server side).

   First-party and dependency-free: events are JSON lines
   in one file on the Railway persistent volume (same
   convention as the network-map and partnerships stores).
   Point ANALYTICS_DATA_DIR at the volume for durability;
   without one, events reset on redeploy.

   The log self-compacts: past MAX_BYTES the oldest half is
   dropped so it can never grow unbounded.
   ═══════════════════════════════════════════════════════ */

const EVENTS_FILE = 'events.jsonl';
const MAX_BYTES = 4 * 1024 * 1024; // ~4 MB ≈ tens of thousands of events
const KEEP_LINES = 20000;

export type AnalyticsEvent = {
  ts: string; // ISO timestamp
  event: string; // 'login' | 'app_open' | 'view' | 'partner_open' | ...
  scope: string; // session scope: 'admin' | 'crm' | ... | 'anon'
  meta?: Record<string, string | number>;
  ua?: string; // truncated user agent
};

export function resolveDataDir(env: NodeJS.ProcessEnv = process.env): string {
  if (env.ANALYTICS_DATA_DIR) return env.ANALYTICS_DATA_DIR;
  try {
    accessSync('/data', constants.W_OK);
    return '/data/analytics';
  } catch {
    return path.join(process.cwd(), '.data', 'analytics');
  }
}

export function appendEvent(dir: string, event: AnalyticsEvent): void {
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, EVENTS_FILE);
  appendFileSync(file, JSON.stringify(event) + '\n');
  try {
    if (statSync(file).size > MAX_BYTES) compact(file);
  } catch {
    /* compaction is best-effort */
  }
}

function compact(file: string): void {
  const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
  const kept = lines.slice(-KEEP_LINES / 2);
  const tmp = file + '.tmp';
  writeFileSync(tmp, kept.join('\n') + '\n');
  renameSync(tmp, file);
}

/** All stored events, oldest first. Malformed lines are skipped. */
export function readEvents(dir: string): AnalyticsEvent[] {
  try {
    const raw = readFileSync(path.join(dir, EVENTS_FILE), 'utf8');
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as AnalyticsEvent;
        } catch {
          return null;
        }
      })
      .filter((e): e is AnalyticsEvent => e !== null && typeof e.ts === 'string' && typeof e.event === 'string');
  } catch {
    return [];
  }
}

export type DayRow = { date: string; logins: number; events: number };

export type AnalyticsSummary = {
  totalEvents: number;
  totalsByEvent: Record<string, number>;
  totalsByScope: Record<string, number>;
  days: DayRow[]; // most recent first
  recent: AnalyticsEvent[]; // most recent first
};

export function summarize(events: AnalyticsEvent[], dayCount = 30, recentCount = 200): AnalyticsSummary {
  const totalsByEvent: Record<string, number> = {};
  const totalsByScope: Record<string, number> = {};
  const byDay = new Map<string, { logins: number; events: number }>();

  for (const e of events) {
    totalsByEvent[e.event] = (totalsByEvent[e.event] || 0) + 1;
    totalsByScope[e.scope] = (totalsByScope[e.scope] || 0) + 1;
    const date = e.ts.slice(0, 10);
    const row = byDay.get(date) || { logins: 0, events: 0 };
    row.events += 1;
    if (e.event === 'login') row.logins += 1;
    byDay.set(date, row);
  }

  const days: DayRow[] = Array.from(byDay.entries())
    .map(([date, row]) => ({ date, ...row }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, dayCount);

  return {
    totalEvents: events.length,
    totalsByEvent,
    totalsByScope,
    days,
    recent: events.slice(-recentCount).reverse(),
  };
}
