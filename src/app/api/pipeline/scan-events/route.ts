import { NextRequest } from 'next/server';
import { requirePipelineAuth, requireEnv } from '@/lib/pipeline/auth';
import { NorcalAggregateEventSource, normalizeEvent } from '@/lib/pipeline/scraper';
import { EventSheet, EventRow } from '@/lib/pipeline/sheet';
import { createShortlink } from '@/lib/pipeline/rebrandly';
import { NormalizedEvent, ScanSummary } from '@/lib/pipeline/types';
import { callClaude } from '@/lib/claude';
import { buildEventPromoPrompt, sanitizeEventPromo, type EventPromoOutput } from '@/lib/prompts';

/**
 * Marketing Engine — hourly scan.
 * Discovers events on norcalsbdc.org/events, and for each event not yet
 * in the Sheet: fetches the detail page, creates a Rebrandly shortlink,
 * generates promo copy, and appends a row with status=copy_ready.
 * Partial failures append the row anyway with status=new + notes — an
 * event is never silently dropped.
 *
 * ?dryRun=1 → scrape + normalize only; returns the events instead of
 * writing anything. Use this to validate parser selectors against the
 * live page after any theme change.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const RUN_TIME_BOX_MS = 270_000;

function appUrl(): string {
  return (process.env.APP_URL || 'https://tools.norcalsbdc.org').replace(/\/$/, '');
}

function motionDeeplink(eventUrl: string): string {
  return `${appUrl()}/motion/pro?url=${encodeURIComponent(eventUrl)}&generate=1`;
}

async function generateCopy(event: NormalizedEvent, shortlink: string): Promise<EventPromoOutput> {
  const result = await callClaude<unknown>({
    ...buildEventPromoPrompt(event, shortlink),
    tag: 'event-promo',
  });
  if (!result.ok) throw new Error(result.error);
  const copy = sanitizeEventPromo(result.data);
  if (!copy) throw new Error('Copy response missing required fields');
  return copy;
}

export async function POST(req: NextRequest) {
  const denied = requirePipelineAuth(req);
  if (denied) return denied;

  const dryRun = req.nextUrl.searchParams.get('dryRun') === '1';
  const maxPages = Math.min(10, Number(req.nextUrl.searchParams.get('maxPages')) || 5);
  const started = Date.now();

  const envMissing = dryRun ? null : requireEnv('SHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_KEY');
  if (envMissing) return envMissing;

  const log: string[] = [];
  const source = new NorcalAggregateEventSource({
    maxPages,
    log: (m) => log.push(m),
  });

  const summary: ScanSummary = { scanned: 0, new: 0, updated: 0, errors: [], dryRun, durationMs: 0 };

  try {
    const listings = await source.fetchListings();
    summary.scanned = listings.length;

    if (dryRun) {
      // Parse-only validation: fetch details for the first few listings
      const preview: NormalizedEvent[] = [];
      for (const hit of listings.slice(0, 5)) {
        try {
          preview.push(normalizeEvent(hit, await source.fetchDetail(hit.detailUrl)));
        } catch (e) {
          summary.errors.push({ slug: hit.detailUrl, message: e instanceof Error ? e.message : 'detail fetch failed' });
          preview.push(normalizeEvent(hit, {}));
        }
      }
      summary.durationMs = Date.now() - started;
      return Response.json({ ...summary, listings, preview, log });
    }

    const sheet = EventSheet.fromEnv();
    await sheet.ensureHeader();
    const existing = new Set((await sheet.listAll()).map((r) => r.slug));

    for (const hit of listings) {
      if (Date.now() - started > RUN_TIME_BOX_MS) {
        log.push('run time box reached — remaining events pick up next scan');
        break;
      }
      const preliminarySlug = hit.detailUrl.replace(/\/+$/, '').split('/').pop()?.toLowerCase() ?? '';
      if (!preliminarySlug || existing.has(preliminarySlug)) continue;

      const notes: string[] = [];
      let event: NormalizedEvent;
      try {
        event = normalizeEvent(hit, await source.fetchDetail(hit.detailUrl));
      } catch (e) {
        event = normalizeEvent(hit, {});
        notes.push(`detail fetch failed: ${e instanceof Error ? e.message : 'unknown'}`);
      }

      // Shortlink → copy (copy needs the link). Failures downgrade to status=new.
      let shortlink = '';
      let linkId = '';
      let copy: EventPromoOutput | null = null;
      if (process.env.REBRANDLY_API_KEY) {
        try {
          const link = await createShortlink(event);
          shortlink = link.shortlink;
          linkId = link.id;
        } catch (e) {
          notes.push(`shortlink failed: ${e instanceof Error ? e.message : 'unknown'}`);
        }
      } else {
        notes.push('REBRANDLY_API_KEY not set — no shortlink');
      }

      if (shortlink) {
        try {
          copy = await generateCopy(event, shortlink);
        } catch (e) {
          notes.push(`copy failed: ${e instanceof Error ? e.message : 'unknown'}`);
        }
      }

      const row: EventRow = {
        slug: event.slug,
        center: event.center,
        title: event.title,
        start_date: event.startDate,
        start_time: event.startTime ?? '',
        end_time: event.endTime ?? '',
        format: event.format ?? 'unknown',
        language: event.language ?? 'en',
        event_url: event.detailUrl,
        rebrandly_link_id: linkId,
        shortlink,
        copy_tweet: copy?.tweet ?? '',
        copy_linkedin: copy?.linkedin ?? '',
        copy_email: copy ? `Subject: ${copy.email.subject}\n\n${copy.email.body}` : '',
        status: copy && shortlink ? 'copy_ready' : 'new',
        motion_deeplink: motionDeeplink(event.detailUrl),
        notes: notes.join(' | '),
      };

      try {
        await sheet.appendEvent(row);
        existing.add(event.slug);
        summary.new += 1;
        if (notes.length) summary.errors.push({ slug: event.slug, message: notes.join(' | ') });
      } catch (e) {
        summary.errors.push({ slug: event.slug, message: `sheet append failed: ${e instanceof Error ? e.message : 'unknown'}` });
      }
      await new Promise((r) => setTimeout(r, 500)); // polite pacing
    }
  } catch (e) {
    summary.errors.push({ slug: '(run)', message: e instanceof Error ? e.message : 'scan failed' });
  }

  summary.durationMs = Date.now() - started;
  console.log('[scan-events]', JSON.stringify({ ...summary, log }));
  return Response.json({ ...summary, log });
}
