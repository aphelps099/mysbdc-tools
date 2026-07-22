/* ═══════════════════════════════════════════════════════
   WordPress event calendar for the SBDC Motion Composer.
   Wraps the Marketing Engine's production scraper
   (src/lib/pipeline/scraper.ts): listing discovery on
   norcalsbdc.org/events, JSON-LD detail parsing. This
   module adds what "chat with the calendar" needs on top:
   · upcoming-only filtering, sorted by date
   · display fields (day, month label, weekday, time line)
   · a ready-to-use suggestedScene per event for the
     "calendar" save-the-date template, with the
     registration URL in `attribution` so shortlink_map
     turns it into an sbdc.events link.
   ═══════════════════════════════════════════════════════ */

import { NorcalAggregateEventSource } from '../../../src/lib/pipeline/scraper';
import { NormalizedEvent } from '../../../src/lib/pipeline/types';
import { SBDC_TOKENS } from './sbdc.js';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface SuggestedCalendarScene {
  template: 'calendar';
  statValue: number;
  statSuffix: string;
  kicker: string;
  title: string;
  subtitle: string;
  attribution: string;
  accentRule: string;
  duration: number;
  /** 'lower-left' → the 1d editorial-columns card (shows the link footer). */
  align: 'lower-left';
}

/** One list scene covering all returned events (the 3a/3b/3c agenda). */
export interface SuggestedAgendaScene {
  template: 'list';
  kicker: string;
  title: string;
  subtitle: string;
  body: string;
  attribution: string;
  duration: number;
}

export interface UpcomingEvent extends NormalizedEvent {
  day: number;
  monthShort: string;
  weekday: string;
  timeLabel: string;
  suggestedScene: SuggestedCalendarScene;
}

function decorate(e: NormalizedEvent): UpcomingEvent {
  // startDate is a plain YYYY-MM-DD — parse as UTC midnight so the
  // day/weekday read back exactly as written, container timezone aside.
  const d = new Date(`${e.startDate}T00:00:00Z`);
  const day = d.getUTCDate();
  const monthShort = MONTHS[d.getUTCMonth()];
  const weekday = WEEKDAYS[d.getUTCDay()];
  const timeLabel = e.startTime
    ? (e.endTime ? `${e.startTime}–${e.endTime}` : e.startTime)
    : '';
  const where = e.format === 'webinar' ? 'Online' : e.format === 'in-person' ? 'In person' : '';
  const subtitle = [weekday, timeLabel, where].filter(Boolean).join(' · ');
  return {
    ...e,
    day,
    monthShort,
    weekday,
    timeLabel,
    suggestedScene: {
      template: 'calendar',
      statValue: day,
      statSuffix: monthShort,
      kicker: `${(e.center || 'NorCal SBDC').toUpperCase()} · FREE TRAINING`,
      title: e.title,
      subtitle,
      // The long registration URL — shortlink_map rewrites it to the
      // sbdc.events display form before preview (1d footer).
      attribution: e.detailUrl,
      accentRule: SBDC_TOKENS.berry,
      duration: 3500,
      align: 'lower-left',
    },
  };
}

/** The one-scene agenda for a set of events ("this month's trainings"). */
function agendaSceneFor(events: UpcomingEvent[]): SuggestedAgendaScene {
  const allOnline = events.every((e) => e.format === 'webinar');
  return {
    template: 'list',
    kicker: 'THIS MONTH | FREE TRAININGS',
    title: 'Upcoming free trainings',
    subtitle: allOnline ? 'All online · No fee' : 'Free · Register early',
    body: events
      .map((e) => {
        const monTc = e.monthShort.charAt(0) + e.monthShort.slice(1).toLowerCase();
        const meta = [e.weekday.slice(0, 3), e.startTime, e.format === 'webinar' ? 'Online' : 'In person']
          .filter(Boolean).join(' · ');
        return `${e.day} ${monTc} | ${e.title} | ${meta}`;
      })
      .join('\n'),
    attribution: 'norcalsbdc.org/events',
    duration: 5000,
  };
}

/**
 * The next `limit` trainings from the calendar, soonest first. Today's
 * events are included. Partial scrape failures surface as warnings, not
 * errors (matching the scraper's contract).
 */
export async function upcomingEvents(limit = 5): Promise<{
  events: UpcomingEvent[];
  agendaScene: SuggestedAgendaScene | null;
  scanned: number;
  warnings: string[];
}> {
  const warnings: string[] = [];
  const mockUrl = process.env.SBDC_EVENTS_URL; // test hook, like REBRANDLY_API_URL
  const source = new NorcalAggregateEventSource({
    aggregateUrl: mockUrl,
    detailDelayMs: mockUrl ? 0 : 400,
    maxPages: 3,
    timeBoxMs: 90_000,
    log: (m) => warnings.push(m),
  });
  const all = await source.fetchEvents();
  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = all
    .filter((e) => e.startDate && e.startDate >= todayIso)
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        (a.startTime ?? '').localeCompare(b.startTime ?? ''),
    );
  const events = upcoming.slice(0, limit).map(decorate);
  return {
    events,
    agendaScene: events.length ? agendaSceneFor(events) : null,
    scanned: all.length,
    warnings,
  };
}
