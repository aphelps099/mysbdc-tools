import { STAGES, TYPES, type Partner, type PartnerType, type SortKey, type Stage } from './types';

/* ═══════════════════════════════════════════════════════
   Partnership CRM — pure logic (no React, vitest-friendly).
   Rules from the handoff README §"Derived metrics":
   - Overdue = nextFollowUp && nextFollowUp < today && stage !== 'Dormant'
   - Going stale = not overdue and lastContact > 45 days ago (never Dormant)
   - Dates render "MMM d", year appended when not the current year
   ═══════════════════════════════════════════════════════ */

const STALE_DAYS = 45;

/** Local calendar date as YYYY-MM-DD (never UTC — follow-ups are people-dates). */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "2026-07-22" → "Jul 22" (year appended when it isn't today's year). */
export function fmt(date: string, today: string): string {
  if (!date) return '—';
  const [y, m, d] = date.split('-').map(Number);
  const currentYear = Number(today.slice(0, 4));
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: y === currentYear ? undefined : 'numeric',
  });
}

/** Long form for the hero sub-line: "Jul 27, 2026". */
export function fmtLong(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isOverdue(p: Partner, today: string): boolean {
  return Boolean(p.nextFollowUp && p.nextFollowUp < today && p.stage !== 'Dormant');
}

export function daysAgo(date: string, today: string): number {
  return Math.round((new Date(today).getTime() - new Date(date).getTime()) / 86400000);
}

/** "Dana Whitfield" → "DW"; single word → first two letters. */
export function initials(name: string): string {
  const trimmed = String(name).trim();
  const parts = trimmed.split(/\s+/);
  const raw = parts.length > 1 ? parts.map((w) => w[0]).join('') : trimmed.slice(0, 2);
  return raw.slice(0, 2).toUpperCase();
}

export type Metrics = {
  active: number;
  inPipeline: number;
  atAgreement: number;
  referralsYTD: number;
  overdue: number;
};

export function computeMetrics(partners: Partner[], today: string): Metrics {
  return {
    active: partners.filter((p) => p.stage === 'Active').length,
    inPipeline: partners.filter((p) => !['Active', 'Dormant'].includes(p.stage)).length,
    atAgreement: partners.filter((p) => p.stage === 'MOU / Agreement').length,
    referralsYTD: partners.reduce((s, p) => s + (p.referrals || 0), 0),
    overdue: partners.filter((p) => isOverdue(p, today)).length,
  };
}

export type AttentionItem = {
  partner: Partner;
  kind: 'overdue' | 'stale';
  detail: string;
};

/** Overdue first, then going-stale; Dormant partners never appear. */
export function attentionItems(partners: Partner[], today: string): AttentionItem[] {
  return partners
    .filter((p) => p.stage !== 'Dormant')
    .map((p): AttentionItem | null => {
      if (isOverdue(p, today)) {
        return { partner: p, kind: 'overdue', detail: `Follow-up was due ${fmt(p.nextFollowUp, today)}` };
      }
      if (daysAgo(p.lastContact, today) > STALE_DAYS) {
        return { partner: p, kind: 'stale', detail: `No contact in ${daysAgo(p.lastContact, today)} days` };
      }
      return null;
    })
    .filter((a): a is AttentionItem => a !== null)
    .sort((a, b) => (a.kind === 'overdue' ? 0 : 1) - (b.kind === 'overdue' ? 0 : 1));
}

export type BarDatum = { label: string; n: number; pct: number; color: string; id?: number };

export function stageBars(partners: Partner[]): BarDatum[] {
  const counts = STAGES.map((s) => partners.filter((p) => p.stage === s).length);
  const max = Math.max(...counts, 1);
  const ramp = ['#dcecf2', '#b9d9e6', '#8fc5d9', '#4f8fc4', '#1b5faf', '#d8d8d8'];
  return STAGES.map((s, i) => ({ label: s, n: counts[i], pct: (counts[i] / max) * 100, color: ramp[i] }));
}

export function typeBars(partners: Partner[]): BarDatum[] {
  const keys = Object.keys(TYPES) as PartnerType[];
  const counts = keys.map((t) => partners.filter((p) => p.type === t && p.stage !== 'Dormant').length);
  const max = Math.max(...counts, 1);
  return keys.map((t, i) => ({
    label: TYPES[t].label,
    n: counts[i],
    pct: (counts[i] / max) * 100,
    color: TYPES[t].color,
  }));
}

/** Top 6 partners by referrals (referrals > 0), descending. */
export function referralBars(partners: Partner[]): BarDatum[] {
  const top = partners
    .filter((p) => p.referrals > 0)
    .sort((a, b) => b.referrals - a.referrals)
    .slice(0, 6);
  const max = Math.max(...top.map((p) => p.referrals), 1);
  return top.map((p) => ({
    label: p.name,
    n: p.referrals,
    pct: (p.referrals / max) * 100,
    color: '#1b5faf',
    id: p.id,
  }));
}

export type TableFilters = { q: string; fType: string; fStage: string; fOwner: string };

/** AND-combined; search matches name + contact + city + subtype + center. */
export function filterPartners(partners: Partner[], f: TableFilters): Partner[] {
  const q = f.q.trim().toLowerCase();
  return partners.filter(
    (p) =>
      (!f.fType || p.type === f.fType) &&
      (!f.fStage || p.stage === f.fStage) &&
      (!f.fOwner || p.owner === f.fOwner) &&
      (!q || [p.name, p.contact, p.city, p.subtype, p.center].join(' ').toLowerCase().includes(q)),
  );
}

/** Stage sorts by pipeline order, not alphabetically. */
export function sortPartners(partners: Partner[], sortKey: SortKey, sortDir: 1 | -1): Partner[] {
  const val = (p: Partner): string | number => {
    switch (sortKey) {
      case 'referrals': return p.referrals || 0;
      case 'stage': return STAGES.indexOf(p.stage as Stage);
      case 'type': return p.type;
      case 'lastContact': return p.lastContact || '';
      case 'nextFollowUp': return p.nextFollowUp || '';
      case 'contact': return p.contact || '';
      case 'owner': return p.owner || '';
      default: return p.name.toLowerCase();
    }
  };
  return partners
    .slice()
    .sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sortDir);
}

export type FeedItem = { date: string; type: string; note: string; partner: Partner };

/** Flattened activity feed, date desc, optionally filtered by activity type. */
export function activityFeed(partners: Partner[], actType: string): FeedItem[] {
  return partners
    .flatMap((p) => p.activities.map((a) => ({ ...a, partner: p })))
    .filter((a) => !actType || a.type === actType)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function nextPartnerId(partners: Partner[]): number {
  return partners.reduce((m, p) => Math.max(m, p.id), 0) + 1;
}
