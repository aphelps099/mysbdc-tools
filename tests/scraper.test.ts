import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import {
  parseListingPage, parseDetailPage, inferLanguage, parseDateText, normalizeEvent,
} from '@/lib/pipeline/scraper';

const listingHtml = readFileSync(path.join(__dirname, 'fixtures/events-listing.html'), 'utf-8');
const detailHtml = readFileSync(path.join(__dirname, 'fixtures/event-detail.html'), 'utf-8');

describe('parseListingPage', () => {
  const hits = parseListingPage(listingHtml, 'https://www.norcalsbdc.org/events/');

  it('finds exactly the three event detail links (not pagination/category)', () => {
    expect(hits).toHaveLength(3);
    expect(hits.map((h) => h.detailUrl)).toEqual([
      'https://www.sanjoaquinsbdc.org/event/start-up-sprint-stockton/',
      'https://www.norcalsbdc.org/event/menu-pricing-margins/',
      'https://sierrasbdc.com/event/construyendo-mi-negocio-plan/',
    ]);
  });

  it('extracts title, center badge, and date/time hints', () => {
    const first = hits[0];
    expect(first.title).toBe('Start Up Sprint: Stockton');
    expect(first.center).toBe('San Mateo SBDC');
    expect(first.dateText).toBe('2026-07-21');
    expect(first.timeText.toLowerCase()).toContain('9:00 am');
  });

  it('keeps center-domain events (mixed domains are expected)', () => {
    expect(hits.some((h) => h.detailUrl.includes('sierrasbdc.com'))).toBe(true);
  });
});

describe('parseDetailPage', () => {
  const detail = parseDetailPage(detailHtml);

  it('prefers JSON-LD Event schema', () => {
    expect(detail.title).toBe('Start Up Sprint: Stockton');
    expect(detail.startDate).toBe('2026-07-21');
    expect(detail.startTime).toBe('9:00 AM');
    expect(detail.endTime).toBe('4:00 PM');
    expect(detail.format).toBe('in-person');
    expect(detail.description).toContain('idea to action plan');
    expect(detail.description).not.toContain('<p>');
  });

  it('falls back to meta description when there is no JSON-LD', () => {
    const bare = parseDetailPage('<html><head><meta name="description" content="Fallback text."></head><body><h1>T</h1></body></html>');
    expect(bare.description).toBe('Fallback text.');
    expect(bare.title).toBe('T');
  });
});

describe('inferLanguage', () => {
  it('detects Spanish events', () => {
    expect(inferLanguage('Construyendo Mi Negocio: Plan de Empresa para emprendedores')).toBe('es');
  });
  it('defaults to English', () => {
    expect(inferLanguage('Menu Pricing That Protects Your Margins')).toBe('en');
  });
});

describe('parseDateText', () => {
  const now = new Date('2026-07-07T12:00:00Z');
  it('passes through ISO dates', () => {
    expect(parseDateText('2026-07-21', now)).toBe('2026-07-21');
  });
  it('parses "July 23, 2026"', () => {
    expect(parseDateText('July 23, 2026', now)).toBe('2026-07-23');
  });
  it('assumes next year for passed month/day without a year', () => {
    expect(parseDateText('Jan 5', now)).toBe('2027-01-05');
  });
});

describe('normalizeEvent', () => {
  it('merges listing + detail with detail winning', () => {
    const hits = parseListingPage(listingHtml, 'https://www.norcalsbdc.org/events/');
    const ev = normalizeEvent(hits[0], parseDetailPage(detailHtml));
    expect(ev.slug).toBe('start-up-sprint-stockton');
    expect(ev.startDate).toBe('2026-07-21');
    expect(ev.startTime).toBe('9:00 AM');
    expect(ev.center).toBe('San Mateo SBDC');
    expect(ev.language).toBe('en');
    expect(ev.format).toBe('in-person');
  });

  it('marks the Spanish event as es', () => {
    const hits = parseListingPage(listingHtml, 'https://www.norcalsbdc.org/events/');
    const ev = normalizeEvent(hits[2], {});
    expect(ev.language).toBe('es');
    expect(ev.startDate).toBe('2026-08-05');
  });
});
