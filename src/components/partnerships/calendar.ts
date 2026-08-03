import type { Partner } from './types';

/* ═══════════════════════════════════════════════════════
   Partnership CRM — "Add to calendar" links.
   Google Calendar's event-template URL: a prefilled
   all-day event for a follow-up date, no API, no OAuth.
   ═══════════════════════════════════════════════════════ */

const CRM_URL = 'https://tools.norcalsbdc.org/partnerships';

/** All-day Google Calendar event for a partner follow-up on `date` (YYYY-MM-DD). */
export function buildCalendarUrl(p: Partner, date: string): string {
  const start = date.replace(/-/g, '');
  const [y, m, d] = date.split('-').map(Number);
  const end = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10).replace(/-/g, '');

  const details = [
    'NorCal SBDC partnership follow-up.',
    `Contact: ${p.contact}${p.email ? ` · ${p.email}` : ''}`,
    `Owner: ${p.owner}`,
    '',
    `Open the CRM: ${CRM_URL}`,
  ].join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Follow up — ${p.name}`,
    dates: `${start}/${end}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
