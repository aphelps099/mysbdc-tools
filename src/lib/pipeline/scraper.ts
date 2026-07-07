/* ═══════════════════════════════════════════════════════
   Marketing Engine — event source: norcalsbdc.org/events
   Scrapes the syndicated aggregate page (decision §3.2).

   Strategy, most-stable-first:
   · Listing pages exist only to DISCOVER detail links (+
     center badge / title as hints). Link discovery is
     heuristic (hrefs containing /event/), which survives
     theme changes far better than class-exact selectors.
   · Detail pages are the source of truth: JSON-LD Event
     schema first (works across center domains too),
     main-content text as fallback.

   NOTE: built against a fixture; validate selectors against
   the live page with POST /api/pipeline/scan-events?dryRun=1
   before trusting production output.
   ═══════════════════════════════════════════════════════ */

import * as cheerio from 'cheerio';
import { NormalizedEvent, EventSource } from './types';
import { slugFromUrl } from './slug';

const USER_AGENT = 'NorCalSBDC-MarketingEngine/1.0';
const AGGREGATE_URL = 'https://www.norcalsbdc.org/events/';

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export interface ListingHit {
  detailUrl: string;
  title: string;
  center: string;
  dateText: string;
  timeText: string;
}

/** Discover event listings on one aggregate page. Exported for fixture tests. */
export function parseListingPage(html: string, baseUrl: string): ListingHit[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const hits: ListingHit[] = [];

  $('a[href*="/event/"], a[href*="/events/"]').each((_, el) => {
    const a = $(el);
    let href = a.attr('href') ?? '';
    try {
      href = new URL(href, baseUrl).toString();
    } catch {
      return;
    }
    // Detail pages, not listing/pagination links
    const path = new URL(href).pathname;
    if (!/\/events?\/[^/]+\/?$/.test(path)) return;
    if (/\/events?\/(page|category|tag|month|list|today)\b/.test(path)) return;
    if (seen.has(href)) return;
    seen.add(href);

    // The enclosing listing container — nearest article/li above the anchor
    // (start from the parent so the anchor's own classes can't match)
    const container = a.parent().closest('article, li, .event, [class*="event-"], [class*="tribe-"]');
    const scope = container.length ? container : a.parent();

    const title =
      scope.find('h1, h2, h3, h4').first().text().trim() ||
      a.attr('title')?.trim() ||
      a.text().trim();

    // Center badge: short label element (category/badge/center-ish class)
    const center = scope
      .find('[class*="badge"], [class*="category"], [class*="center"], [class*="cat-"], .label')
      .first()
      .text()
      .trim();

    // Date/time hints from the listing (fallbacks only — JSON-LD wins)
    const timeAttr = scope.find('time[datetime]').first().attr('datetime') ?? '';
    const text = scope.text().replace(/\s+/g, ' ');
    const dateMatch =
      timeAttr ||
      text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+\d{1,2}(,?\s*\d{4})?\b/i)?.[0] ||
      '';
    const timeMatch = text.match(/\b\d{1,2}(:\d{2})?\s*(am|pm)\s*[-–—]\s*\d{1,2}(:\d{2})?\s*(am|pm)\b/i)?.[0] ?? '';

    if (!title || /view event details/i.test(title)) {
      // anchor was the "View Event Details" button with no heading nearby — keep
      // the hit but let the detail page supply the title
    }
    hits.push({
      detailUrl: href,
      title: /view event details/i.test(title) ? '' : title,
      center,
      dateText: dateMatch,
      timeText: timeMatch,
    });
  });

  return hits;
}

export interface DetailData {
  title?: string;
  description?: string;
  startDate?: string;   // ISO
  startTime?: string;
  endTime?: string;
  format?: NormalizedEvent['format'];
}

function fmtTimeFromIso(iso: string): string | undefined {
  const m = iso.match(/T(\d{2}):(\d{2})/);
  if (!m) return undefined;
  let h = parseInt(m[1], 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m[2]} ${ampm}`;
}

interface JsonLdEvent {
  '@type'?: string | string[];
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  eventAttendanceMode?: string;
  location?: { '@type'?: string };
}

function findJsonLdEvent(nodes: unknown): JsonLdEvent | null {
  const queue: unknown[] = Array.isArray(nodes) ? [...nodes] : [nodes];
  while (queue.length) {
    const n = queue.shift();
    if (!n || typeof n !== 'object') continue;
    const obj = n as Record<string, unknown>;
    const type = obj['@type'];
    const types = Array.isArray(type) ? type : [type];
    if (types.some((t) => typeof t === 'string' && /event/i.test(t))) {
      return obj as JsonLdEvent;
    }
    if (Array.isArray(obj['@graph'])) queue.push(...(obj['@graph'] as unknown[]));
  }
  return null;
}

/** Extract event data from a detail page. Exported for fixture tests. */
export function parseDetailPage(html: string): DetailData {
  const $ = cheerio.load(html);
  const out: DetailData = {};

  // 1. JSON-LD Event schema — authoritative and theme-independent
  $('script[type="application/ld+json"]').each((_, el) => {
    if (out.startDate) return;
    try {
      const ev = findJsonLdEvent(JSON.parse($(el).text()));
      if (!ev) return;
      if (ev.name) out.title = String(ev.name).trim();
      if (ev.description) {
        out.description = cheerio.load(`<p>${ev.description}</p>`).text().replace(/\s+/g, ' ').trim();
      }
      if (ev.startDate) {
        out.startDate = String(ev.startDate).slice(0, 10);
        out.startTime = fmtTimeFromIso(String(ev.startDate));
      }
      if (ev.endDate) out.endTime = fmtTimeFromIso(String(ev.endDate));
      if (ev.eventAttendanceMode) {
        out.format = /online/i.test(ev.eventAttendanceMode) ? 'webinar'
          : /offline/i.test(ev.eventAttendanceMode) ? 'in-person'
          : 'unknown';
      } else if (ev.location?.['@type']) {
        out.format = /virtual/i.test(String(ev.location['@type'])) ? 'webinar' : 'in-person';
      }
    } catch {
      // malformed JSON-LD — ignore
    }
  });

  // 2. Fallbacks from page markup
  if (!out.title) out.title = $('h1').first().text().trim() || undefined;
  if (!out.description) {
    const meta =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content');
    const body = $('article, main, .entry-content, #content').first().text().replace(/\s+/g, ' ').trim();
    out.description = (meta || body || '').slice(0, 2000) || undefined;
  }
  if (!out.format) {
    const text = `${out.description ?? ''} ${$('body').text().slice(0, 3000)}`.toLowerCase();
    out.format = /\b(webinar|online|virtual|zoom)\b/.test(text) ? 'webinar'
      : /\b(in.person|location|address|room|suite)\b/.test(text) ? 'in-person'
      : 'unknown';
  }
  return out;
}

/** Cheap Spanish detection for title + description (spec §5.1). */
export function inferLanguage(text: string): 'en' | 'es' {
  const t = ` ${text.toLowerCase()} `;
  const markers = [
    ' cómo ', ' como ', ' negocio', ' empresa', ' taller ', ' seminario ',
    ' para ', ' con ', ' del ', ' los ', ' las ', ' construyendo', ' aprenda',
    ' gratis', ' emprendedor', ' financiamiento', ' pequeñ', ' español',
  ];
  const score = markers.reduce((n, m) => n + (t.includes(m) ? 1 : 0), 0);
  return score >= 2 ? 'es' : 'en';
}

/** Parse listing date hints like "July 15, 2026" / "Jul 15" / ISO datetime attr. */
export function parseDateText(dateText: string, now = new Date()): string {
  if (!dateText) return '';
  const iso = dateText.match(/^\d{4}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  const parsed = new Date(`${dateText}${/\d{4}/.test(dateText) ? '' : `, ${now.getFullYear()}`}`);
  if (Number.isNaN(parsed.getTime())) return '';
  // A date that already passed this year without an explicit year → next year
  if (!/\d{4}/.test(dateText) && parsed.getTime() < now.getTime() - 86400_000) {
    parsed.setFullYear(parsed.getFullYear() + 1);
  }
  return parsed.toISOString().slice(0, 10);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ScraperOptions {
  fetchImpl?: FetchLike;
  maxPages?: number;
  detailDelayMs?: number;
  /** Overall time box (ms) for the whole scan. */
  timeBoxMs?: number;
  log?: (msg: string) => void;
}

export class NorcalAggregateEventSource implements EventSource {
  private fetchImpl: FetchLike;
  private maxPages: number;
  private detailDelayMs: number;
  private timeBoxMs: number;
  private log: (msg: string) => void;

  constructor(opts: ScraperOptions = {}) {
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.maxPages = opts.maxPages ?? 5;
    this.detailDelayMs = opts.detailDelayMs ?? 500;
    this.timeBoxMs = opts.timeBoxMs ?? 240_000;
    this.log = opts.log ?? (() => {});
  }

  private async get(url: string): Promise<string> {
    const res = await this.fetchImpl(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    return res.text();
  }

  /** Listing discovery only — no detail fetches. */
  async fetchListings(): Promise<ListingHit[]> {
    const all: ListingHit[] = [];
    const seen = new Set<string>();
    for (let page = 1; page <= this.maxPages; page++) {
      const url = page === 1 ? AGGREGATE_URL : `${AGGREGATE_URL}page/${page}/`;
      let html: string;
      try {
        html = await this.get(url);
      } catch (e) {
        if (page === 1) throw e; // first page failing is a real error
        break; // later pages 404 when pagination ends
      }
      const hits = parseListingPage(html, url).filter((h) => {
        const key = slugFromUrl(h.detailUrl);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      this.log(`page ${page}: ${hits.length} events`);
      if (hits.length === 0) break;
      all.push(...hits);
    }
    return all;
  }

  /** Fetch + parse one detail page (polite: callers add delays). */
  async fetchDetail(detailUrl: string): Promise<DetailData> {
    return parseDetailPage(await this.get(detailUrl));
  }

  /** Full EventSource contract: listings + details, normalized. */
  async fetchEvents(): Promise<NormalizedEvent[]> {
    const started = Date.now();
    const listings = await this.fetchListings();
    const events: NormalizedEvent[] = [];
    for (const hit of listings) {
      if (Date.now() - started > this.timeBoxMs) {
        this.log('time box reached — stopping detail fetches');
        break;
      }
      let detail: DetailData = {};
      try {
        detail = await this.fetchDetail(hit.detailUrl);
      } catch (e) {
        this.log(`detail failed: ${hit.detailUrl} (${e instanceof Error ? e.message : e})`);
      }
      events.push(normalizeEvent(hit, detail));
      await delay(this.detailDelayMs);
    }
    return events;
  }
}

/** Merge a listing hit + detail data into the canonical shape. */
export function normalizeEvent(hit: ListingHit, detail: DetailData, now = new Date()): NormalizedEvent {
  const title = detail.title || hit.title || slugFromUrl(hit.detailUrl).replace(/-/g, ' ');
  const [startTimeHint, endTimeHint] = hit.timeText
    ? hit.timeText.split(/[-–—]/).map((s) => s.trim().toUpperCase())
    : [undefined, undefined];
  const description = detail.description ?? '';
  return {
    slug: slugFromUrl(hit.detailUrl),
    title,
    detailUrl: hit.detailUrl,
    center: hit.center || 'NorCal SBDC',
    startDate: detail.startDate || parseDateText(hit.dateText, now),
    startTime: detail.startTime || startTimeHint,
    endTime: detail.endTime || endTimeHint,
    language: inferLanguage(`${title} ${description}`),
    description: description || undefined,
    format: detail.format ?? 'unknown',
  };
}
