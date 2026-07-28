import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  appendEvent,
  readEvents,
  resolveDataDir,
  summarize,
  type AnalyticsEvent,
} from '@/lib/analytics-store';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'analytics-test-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const ev = (over: Partial<AnalyticsEvent> = {}): AnalyticsEvent => ({
  ts: '2026-07-28T10:00:00.000Z',
  event: 'view',
  scope: 'crm',
  ...over,
});

describe('append + read round-trip', () => {
  it('persists events in order, creating the dir on first write', () => {
    const nested = path.join(dir, 'does', 'not', 'exist');
    appendEvent(nested, ev({ event: 'login' }));
    appendEvent(nested, ev({ event: 'app_open', meta: { view: 'dashboard' } }));
    const events = readEvents(nested);
    expect(events.map((e) => e.event)).toEqual(['login', 'app_open']);
    expect(events[1].meta).toEqual({ view: 'dashboard' });
  });

  it('returns [] for a missing file and skips malformed lines', () => {
    expect(readEvents(dir)).toEqual([]);
    appendEvent(dir, ev());
    writeFileSync(path.join(dir, 'events.jsonl'), JSON.stringify(ev()) + '\nnot json\n{"half":', {
      flag: 'a',
    });
    // first append + one valid line survive, garbage is dropped
    expect(readEvents(dir)).toHaveLength(2);
  });
});

describe('resolveDataDir', () => {
  it('prefers ANALYTICS_DATA_DIR', () => {
    expect(resolveDataDir({ ANALYTICS_DATA_DIR: '/custom' } as NodeJS.ProcessEnv)).toBe('/custom');
  });
});

describe('summarize', () => {
  const events: AnalyticsEvent[] = [
    ev({ ts: '2026-07-27T09:00:00.000Z', event: 'login', scope: 'crm' }),
    ev({ ts: '2026-07-27T09:01:00.000Z', event: 'app_open' }),
    ev({ ts: '2026-07-28T14:00:00.000Z', event: 'login', scope: 'admin' }),
    ev({ ts: '2026-07-28T14:02:00.000Z', event: 'partner_open', meta: { id: 1 } }),
    ev({ ts: '2026-07-28T14:05:00.000Z', event: 'view' }),
  ];

  it('rolls up totals by event and scope', () => {
    const s = summarize(events);
    expect(s.totalEvents).toBe(5);
    expect(s.totalsByEvent).toEqual({ login: 2, app_open: 1, partner_open: 1, view: 1 });
    expect(s.totalsByScope).toEqual({ crm: 4, admin: 1 });
  });

  it('groups by day (most recent first) and counts logins separately', () => {
    const s = summarize(events);
    expect(s.days).toEqual([
      { date: '2026-07-28', logins: 1, events: 3 },
      { date: '2026-07-27', logins: 1, events: 2 },
    ]);
  });

  it('returns recent events newest-first, capped', () => {
    const s = summarize(events, 30, 2);
    expect(s.recent).toHaveLength(2);
    expect(s.recent[0].event).toBe('view');
    expect(s.recent[1].event).toBe('partner_open');
  });
});
