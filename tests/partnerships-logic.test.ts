import { describe, expect, it } from 'vitest';
import {
  activityFeed,
  attentionItems,
  computeMetrics,
  daysAgo,
  filterPartners,
  fmt,
  initials,
  isOverdue,
  nextPartnerId,
  normalizeUrl,
  referralBars,
  sortPartners,
  stageBars,
  typeBars,
} from '@/components/partnerships/logic';
import { SEED_PARTNERS } from '@/components/partnerships/seed';
import { FIXTURE_PARTNERS } from './fixtures/partners';
import { STAGES } from '@/components/partnerships/types';

/* The handoff prototype pins "today" to 2026-07-27; using the same date here
   lets us assert against the exact numbers shown in the design reference. */
const TODAY = '2026-07-27';

describe('date helpers', () => {
  it('formats dates as MMM d, year only when not the current year', () => {
    expect(fmt('2026-07-22', TODAY)).toBe('Jul 22');
    expect(fmt('2025-12-01', TODAY)).toBe('Dec 1, 2025');
    expect(fmt('', TODAY)).toBe('—');
  });

  it('computes whole days between dates', () => {
    expect(daysAgo('2026-07-21', TODAY)).toBe(6);
    expect(daysAgo('2026-02-12', TODAY)).toBe(165);
  });
});

describe('initials', () => {
  it('takes first letters of multi-word names, capped at two', () => {
    expect(initials('Dana Whitfield')).toBe('DW');
    expect(initials('Aaron')).toBe('AA');
    expect(initials('  Preet ')).toBe('PR');
  });
});

describe('overdue rule', () => {
  it('needs a follow-up date in the past and a non-dormant stage', () => {
    const base = FIXTURE_PARTNERS[0];
    expect(isOverdue({ ...base, nextFollowUp: '2026-07-26', stage: 'Active' }, TODAY)).toBe(true);
    expect(isOverdue({ ...base, nextFollowUp: '2026-07-27', stage: 'Active' }, TODAY)).toBe(false);
    expect(isOverdue({ ...base, nextFollowUp: '', stage: 'Active' }, TODAY)).toBe(false);
    expect(isOverdue({ ...base, nextFollowUp: '2026-07-26', stage: 'Dormant' }, TODAY)).toBe(false);
  });
});

describe('derived metrics (seed data, dashboard numbers)', () => {
  it('matches the metric strip in the design reference', () => {
    const m = computeMetrics(FIXTURE_PARTNERS, TODAY);
    expect(m.active).toBe(8);
    expect(m.inPipeline).toBe(5);
    expect(m.atAgreement).toBe(2);
    expect(m.referralsYTD).toBe(70);
    expect(m.overdue).toBe(3);
  });

  it('lists overdue partners before going-stale ones, never dormant', () => {
    const items = attentionItems(FIXTURE_PARTNERS, TODAY);
    expect(items.map((i) => i.kind)).toEqual(['overdue', 'overdue', 'overdue']);
    expect(items.every((i) => i.partner.stage !== 'Dormant')).toBe(true);
    // Pacific Gateway (dormant, last contact Feb) must not appear as stale
    expect(items.find((i) => i.partner.id === 16)).toBeUndefined();
  });

  it('flags a non-dormant partner as going stale after 45 days', () => {
    const partners = FIXTURE_PARTNERS.map((p) =>
      p.id === 16 ? { ...p, stage: 'Outreach' as const, nextFollowUp: '2026-09-15' } : p,
    );
    const items = attentionItems(partners, TODAY);
    const stale = items.find((i) => i.partner.id === 16);
    expect(stale?.kind).toBe('stale');
    expect(stale?.detail).toBe('No contact in 165 days');
    // and overdue items still sort first
    expect(items[items.length - 1].kind).toBe('stale');
  });
});

describe('dashboard bars', () => {
  it('builds one stage bar per stage in pipeline order', () => {
    const bars = stageBars(FIXTURE_PARTNERS);
    expect(bars.map((b) => b.label)).toEqual(STAGES);
    expect(bars.map((b) => b.n)).toEqual([1, 0, 2, 2, 8, 1]);
  });

  it('excludes dormant partners from the type bars', () => {
    const bars = typeBars(FIXTURE_PARTNERS);
    expect(bars.map((b) => b.n)).toEqual([5, 4, 4]); // Referral, Funding, Community
  });

  it('takes the top 6 referrers, descending', () => {
    const bars = referralBars(FIXTURE_PARTNERS);
    expect(bars).toHaveLength(6);
    expect(bars[0].label).toBe('Redwood Coast Community Bank');
    expect(bars.map((b) => b.n)).toEqual([14, 11, 9, 8, 7, 6]);
  });
});

describe('table filtering and sorting', () => {
  it('AND-combines filters and searches across name/contact/city/subtype/center', () => {
    expect(filterPartners(FIXTURE_PARTNERS, { q: 'eureka', fType: '', fStage: '', fOwner: '' })).toHaveLength(2);
    expect(filterPartners(FIXTURE_PARTNERS, { q: 'eureka', fType: 'Referral', fStage: '', fOwner: '' })).toHaveLength(1);
    expect(filterPartners(FIXTURE_PARTNERS, { q: '', fType: '', fStage: 'Active', fOwner: 'Aaron' })).toHaveLength(3);
    expect(filterPartners(FIXTURE_PARTNERS, { q: 'dana', fType: '', fStage: '', fOwner: '' })).toHaveLength(1);
  });

  it('sorts stage by pipeline order, not alphabetically', () => {
    const sorted = sortPartners(FIXTURE_PARTNERS, 'stage', 1);
    expect(sorted[0].stage).toBe('Prospect');
    expect(sorted[sorted.length - 1].stage).toBe('Dormant');
  });

  it('flips with sortDir and sorts referrals numerically', () => {
    const desc = sortPartners(FIXTURE_PARTNERS, 'referrals', -1);
    expect(desc[0].referrals).toBe(14);
    expect(desc[desc.length - 1].referrals).toBe(0);
  });
});

describe('activity feed', () => {
  it('flattens all activities date-desc and filters by type', () => {
    const feed = activityFeed(FIXTURE_PARTNERS, '');
    expect(feed).toHaveLength(FIXTURE_PARTNERS.reduce((s, p) => s + p.activities.length, 0));
    for (let i = 1; i < feed.length; i++) {
      expect(feed[i - 1].date >= feed[i].date).toBe(true);
    }
    const referrals = activityFeed(FIXTURE_PARTNERS, 'Referral');
    expect(referrals.every((f) => f.type === 'Referral')).toBe(true);
    expect(referrals).toHaveLength(3);
  });
});

describe('nextPartnerId', () => {
  it('is one more than the max id (seed ids are non-contiguous)', () => {
    expect(nextPartnerId(FIXTURE_PARTNERS)).toBe(19);
    expect(nextPartnerId([])).toBe(1);
  });
});

describe('normalizeUrl', () => {
  it('prefixes https:// when missing and keeps explicit schemes', () => {
    expect(normalizeUrl('linkedin.com/company/x')).toBe('https://linkedin.com/company/x');
    expect(normalizeUrl('https://linkedin.com/company/x')).toBe('https://linkedin.com/company/x');
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    expect(normalizeUrl('  ')).toBe('');
  });
});

describe('app seed', () => {
  it('ships exactly one demo record, with a LinkedIn link', () => {
    expect(SEED_PARTNERS).toHaveLength(1);
    expect(SEED_PARTNERS[0].name).toBe('Redwood Coast Community Bank');
    expect(SEED_PARTNERS[0].linkedin).toContain('linkedin.com');
  });
});
