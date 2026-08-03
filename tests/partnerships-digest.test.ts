import { describe, expect, it } from 'vitest';
import { buildCalendarUrl } from '@/components/partnerships/calendar';
import { buildFollowUpEmail, buildFollowUpMailto } from '@/components/partnerships/followup';
import { FIXTURE_PARTNERS } from './fixtures/partners';
import { buildDigestHtml, buildDigestText } from '@/lib/emails/partnerships-digest';
import { addDays, computeDigest, digestSubject } from '@/lib/partnerships-digest';

/* Pinned to the handoff's reference date so counts match the seed exactly. */
const TODAY = '2026-07-27';

describe('addDays', () => {
  it('handles month and year boundaries', () => {
    expect(addDays('2026-07-27', 7)).toBe('2026-08-03');
    expect(addDays('2026-07-27', -7)).toBe('2026-07-20');
    expect(addDays('2026-12-29', 5)).toBe('2027-01-03');
  });
});

describe('computeDigest (seed data)', () => {
  const d = computeDigest(FIXTURE_PARTNERS, TODAY);

  it('matches the CRM dashboard: 3 overdue, 0 stale', () => {
    expect(d.overdue.map((a) => a.partner.id).sort((a, b) => a - b)).toEqual([3, 4, 10]);
    expect(d.stale).toHaveLength(0);
  });

  it('finds follow-ups due in the next 7 days, sorted by date', () => {
    expect(d.dueSoon.map((i) => [i.partner.id, i.date])).toEqual([
      [18, '2026-07-29'],
      [11, '2026-07-30'],
      [14, '2026-08-01'],
      [9, '2026-08-03'],
    ]);
  });

  it('keeps a dormant partner’s scheduled revisit when inside the window', () => {
    const nearRevisit = FIXTURE_PARTNERS.map((p) =>
      p.id === 16 ? { ...p, nextFollowUp: '2026-07-31' } : p,
    );
    const digest = computeDigest(nearRevisit, TODAY);
    expect(digest.dueSoon.some((i) => i.partner.id === 16)).toBe(true);
  });

  it('collects last week’s activity, newest first', () => {
    expect(d.recentActivity.map((f) => f.date)).toEqual(['2026-07-21']);
  });

  it('is actionable and titles the subject plainly', () => {
    expect(d.hasActionable).toBe(true);
    expect(digestSubject(d)).toBe('Partnership follow-ups: 3 overdue · 4 due this week');
  });

  it('excludes archived partners entirely', () => {
    // Shasta Cascade (id 3) is overdue; archiving it must drop it
    const withArchived = FIXTURE_PARTNERS.map((p) =>
      p.id === 3 ? { ...p, archived: true } : p,
    );
    const digest = computeDigest(withArchived, TODAY);
    expect(digest.overdue.map((a) => a.partner.id).sort((a, b) => a - b)).toEqual([4, 10]);
    expect(digest.recentActivity.every((f) => f.partner.id !== 3)).toBe(true);
  });

  it('goes quiet when nothing is actionable', () => {
    const calm = FIXTURE_PARTNERS.map((p) => ({ ...p, nextFollowUp: '', lastContact: TODAY }));
    const digest = computeDigest(calm, TODAY);
    expect(digest.hasActionable).toBe(false);
    expect(digestSubject(digest)).toBe('Partnership CRM weekly digest');
  });
});

describe('digest email rendering', () => {
  const d = computeDigest(FIXTURE_PARTNERS, TODAY);

  it('renders every actionable partner and escapes HTML', () => {
    const html = buildDigestHtml(d);
    for (const a of d.overdue) expect(html).toContain(a.partner.name.replace(/&/g, '&amp;'));
    expect(html).toContain('Overdue follow-ups (3)');
    expect(html).toContain('Due this week (4)');
    expect(html).toContain('/partnerships');
    // "CA GO-Biz — Small Business Unit" has no raw angle brackets to escape,
    // but "Mendocino Wine & Ag Collective" activity must arrive escaped:
    expect(html).not.toContain('Wine & Ag');
  });

  it('renders a text alternative with the same sections', () => {
    const text = buildDigestText(d);
    expect(text).toContain('OVERDUE FOLLOW-UPS (3)');
    expect(text).toContain('DUE THIS WEEK (4)');
    expect(text).toContain('Shasta Cascade Economic Development District');
  });
});

describe('calendar links', () => {
  it('builds an all-day Google Calendar template event', () => {
    const redwood = FIXTURE_PARTNERS.find((p) => p.id === 1)!;
    const url = new URL(buildCalendarUrl(redwood, '2026-08-18'));
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('text')).toBe('Follow up — Redwood Coast Community Bank');
    expect(url.searchParams.get('dates')).toBe('20260818/20260819'); // end is exclusive
    expect(url.searchParams.get('details')).toContain('Dana Whitfield');
    expect(url.searchParams.get('details')).toContain('tools.norcalsbdc.org/partnerships');
  });

  it('rolls the end date across month boundaries', () => {
    const p = FIXTURE_PARTNERS[0];
    expect(new URL(buildCalendarUrl(p, '2026-08-31')).searchParams.get('dates')).toBe(
      '20260831/20260901',
    );
  });

  it('appears in the digest email for due-soon rows', () => {
    const d = computeDigest(FIXTURE_PARTNERS, TODAY);
    const html = buildDigestHtml(d);
    expect(html).toContain('calendar.google.com/calendar/render');
    expect(html.match(/Add to calendar/g)?.length).toBe(d.dueSoon.length);
  });
});

describe('follow-up drafts', () => {
  it('references the most recent activity in plain language', () => {
    const redwood = FIXTURE_PARTNERS.find((p) => p.id === 1)!;
    const { subject, body } = buildFollowUpEmail(redwood, TODAY);
    expect(subject).toBe('Following up — NorCal SBDC & Redwood Coast Community Bank');
    expect(body).toContain('Hi Dana,');
    expect(body).toContain('our meeting on Jul 21');
    expect(body).toContain('Thanks,\r\nAaron\r\nNorCal SBDC');
    expect(body).not.toContain('!');
  });

  it('falls back gracefully with no contact name or activities', () => {
    const bare = { ...FIXTURE_PARTNERS[0], contact: '—', activities: [] };
    const { body } = buildFollowUpEmail(bare, TODAY);
    expect(body.startsWith('Hi,')).toBe(true);
    expect(body).toContain('Wanted to check in');
  });

  it('builds an encoded mailto link', () => {
    const redwood = FIXTURE_PARTNERS.find((p) => p.id === 1)!;
    const href = buildFollowUpMailto(redwood, TODAY);
    expect(href.startsWith('mailto:dwhitfield@rccb.example.com?subject=')).toBe(true);
    expect(href).toContain(encodeURIComponent('Following up — NorCal SBDC & Redwood Coast Community Bank'));
    expect(href).not.toContain(' ');
  });
});
