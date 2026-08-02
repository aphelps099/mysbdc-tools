import { fmt } from './logic';
import type { Partner } from './types';

/* ═══════════════════════════════════════════════════════
   Partnership CRM — one-click follow-up drafts.
   Builds a prefilled mailto: link so "this partner is
   overdue" becomes "an email is open in front of me" with
   zero sending infrastructure and a human in the loop.
   Copy rules: second person, plain, no hype, no
   exclamation marks.
   ═══════════════════════════════════════════════════════ */

const LAST_TOUCH_PHRASE: Record<string, string> = {
  Meeting: 'our meeting',
  Call: 'our call',
  Email: 'my last note',
  Event: 'the event',
  Referral: 'your recent referrals',
  Agreement: 'the agreement',
};

export function buildFollowUpEmail(
  p: Partner,
  today: string,
): { subject: string; body: string } {
  const first =
    p.contact && p.contact !== '—' ? p.contact.trim().split(/\s+/)[0] : '';

  const last = p.activities
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  const opener = last
    ? `Wanted to follow up on ${LAST_TOUCH_PHRASE[last.type] ?? 'our last conversation'} on ${fmt(last.date, today)} and keep things moving on the NorCal SBDC partnership.`
    : 'Wanted to check in and keep things moving on the NorCal SBDC partnership.';

  const body = [
    `Hi${first ? ` ${first}` : ''},`,
    '',
    opener,
    '',
    'Do you have time for a quick call in the next week or two?',
    '',
    'Thanks,',
    p.owner,
    'NorCal SBDC',
  ].join('\r\n');

  return { subject: `Following up — NorCal SBDC & ${p.name}`, body };
}

export function buildFollowUpMailto(p: Partner, today: string): string {
  const { subject, body } = buildFollowUpEmail(p, today);
  return `mailto:${p.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
