/* ═══════════════════════════════════════════════════════
   Marketing Engine — core types
   Events flow: source → NormalizedEvent → Sheet row.
   The EventSource interface isolates everything downstream
   from HOW events are discovered — today an HTML scrape of
   norcalsbdc.org/events, someday a lead-site JSON endpoint.
   ═══════════════════════════════════════════════════════ */

export interface NormalizedEvent {
  /** Dedup key: last path segment of the detail URL. */
  slug: string;
  title: string;
  /** As given by the aggregate page — lead-center OR center domain. */
  detailUrl: string;
  /** Badge text from the aggregate page, e.g. "San Mateo SBDC". */
  center: string;
  /** ISO 8601 date (YYYY-MM-DD). */
  startDate: string;
  /** As displayed, e.g. "10:00 AM". */
  startTime?: string;
  endTime?: string;
  /** "es" when the event is Spanish-language, else "en". */
  language?: string;
  /** From the detail page (JSON-LD Event schema preferred). */
  description?: string;
  format?: 'webinar' | 'in-person' | 'unknown';
}

export interface EventSource {
  /** Discover current events. Implementations must not throw on partial failures. */
  fetchEvents(): Promise<NormalizedEvent[]>;
}

/** One pipeline run's outcome, returned to cron logs. */
export interface ScanSummary {
  scanned: number;
  new: number;
  updated: number;
  errors: { slug: string; message: string }[];
  dryRun: boolean;
  durationMs: number;
}

export const STATUSES = ['new', 'copy_ready', 'approved', 'video_ready', 'posted'] as const;
export type EventStatus = typeof STATUSES[number];

export function isValidNormalizedEvent(e: unknown): e is NormalizedEvent {
  if (!e || typeof e !== 'object') return false;
  const ev = e as Record<string, unknown>;
  return (
    typeof ev.slug === 'string' && ev.slug.length > 0 &&
    typeof ev.title === 'string' && ev.title.length > 0 &&
    typeof ev.detailUrl === 'string' && /^https?:\/\//.test(ev.detailUrl) &&
    typeof ev.center === 'string' &&
    typeof ev.startDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(ev.startDate)
  );
}
