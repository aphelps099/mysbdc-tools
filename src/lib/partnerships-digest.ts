import {
  activityFeed,
  attentionItems,
  type AttentionItem,
  type FeedItem,
} from '@/components/partnerships/logic';
import type { Partner } from '@/components/partnerships/types';

/* ═══════════════════════════════════════════════════════
   Partnership CRM — weekly digest rollup (pure logic).
   Reuses the CRM's own rules: overdue and going-stale come
   straight from attentionItems, so the email always agrees
   with the dashboard.
   ═══════════════════════════════════════════════════════ */

const DUE_WINDOW_DAYS = 7;
const ACTIVITY_WINDOW_DAYS = 7;

export type DueSoonItem = { partner: Partner; date: string };

export type DigestData = {
  today: string;
  overdue: AttentionItem[];
  stale: AttentionItem[];
  dueSoon: DueSoonItem[]; // next 7 days, today inclusive
  recentActivity: FeedItem[]; // last 7 days, newest first
  hasActionable: boolean;
};

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function computeDigest(allPartners: Partner[], today: string): DigestData {
  const partners = allPartners.filter((p) => !p.archived);
  const attention = attentionItems(partners, today);
  const overdue = attention.filter((a) => a.kind === 'overdue');
  const stale = attention.filter((a) => a.kind === 'stale');

  // Upcoming follow-ups. Dormant partners are included on purpose: a future
  // follow-up on a dormant partner is its wake-up reminder ("revisit in
  // September"), and this window is its only chance to surface.
  const horizon = addDays(today, DUE_WINDOW_DAYS);
  const dueSoon: DueSoonItem[] = partners
    .filter((p) => p.nextFollowUp && p.nextFollowUp >= today && p.nextFollowUp <= horizon)
    .map((p) => ({ partner: p, date: p.nextFollowUp }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const since = addDays(today, -ACTIVITY_WINDOW_DAYS);
  const recentActivity = activityFeed(partners, '').filter(
    (f) => f.date >= since && f.date <= today,
  );

  return {
    today,
    overdue,
    stale,
    dueSoon,
    recentActivity,
    hasActionable: overdue.length + stale.length + dueSoon.length > 0,
  };
}

/** "Partnership follow-ups: 3 overdue · 4 due this week" — plain, no hype. */
export function digestSubject(d: DigestData): string {
  const parts: string[] = [];
  if (d.overdue.length) parts.push(`${d.overdue.length} overdue`);
  if (d.dueSoon.length) parts.push(`${d.dueSoon.length} due this week`);
  if (!parts.length && d.stale.length) parts.push(`${d.stale.length} going stale`);
  return parts.length
    ? `Partnership follow-ups: ${parts.join(' · ')}`
    : 'Partnership CRM weekly digest';
}
