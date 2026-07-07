import { describe, it, expect } from 'vitest';
import { buildEventPromoPrompt, sanitizeEventPromo } from '@/lib/prompts/event-promo';
import type { NormalizedEvent } from '@/lib/pipeline/types';

const event: NormalizedEvent = {
  slug: 'menu-pricing-margins',
  title: 'Menu Pricing That Protects Your Margins',
  detailUrl: 'https://www.norcalsbdc.org/event/menu-pricing-margins/',
  center: 'Restaurant Program',
  startDate: '2026-07-23',
  startTime: '10:00 AM',
  endTime: '11:30 AM',
  language: 'en',
  description: 'Learn to price your menu using food-cost math.',
  format: 'webinar',
};

describe('buildEventPromoPrompt', () => {
  const opts = buildEventPromoPrompt(event, 'https://sbdc.events/menu-pricing-margins');

  it('carries the voice rules and the shortlink', () => {
    expect(opts.system).toContain('no-cost');
    expect(opts.system).toContain('Your Business People');
    expect(opts.prompt).toContain('https://sbdc.events/menu-pricing-margins');
    expect(opts.prompt).toContain('2026-07-23');
  });

  it('includes the Spanish rule', () => {
    expect(opts.system).toContain('language: "es"');
  });
});

describe('sanitizeEventPromo', () => {
  const good = {
    tweet: 'Price your menu with confidence. Jul 23, 10AM PT. https://sbdc.events/menu-pricing-margins',
    linkedin: 'Hook.\n\nBody.\n\nJul 23 · 10:00 AM PT · no-cost.\n\nRegister: https://sbdc.events/menu-pricing-margins',
    email: { subject: 'Protect your margins', body: 'Body text. Register: https://sbdc.events/menu-pricing-margins' },
  };

  it('accepts a well-formed object', () => {
    const out = sanitizeEventPromo(good);
    expect(out).not.toBeNull();
    expect(out!.email.subject).toBe('Protect your margins');
  });

  it('rejects missing fields', () => {
    expect(sanitizeEventPromo({ tweet: 'x', linkedin: 'y' })).toBeNull();
    expect(sanitizeEventPromo({ ...good, email: { subject: 'only' } })).toBeNull();
    expect(sanitizeEventPromo(null)).toBeNull();
    expect(sanitizeEventPromo('a string')).toBeNull();
  });

  it('enforces length caps', () => {
    const long = sanitizeEventPromo({
      ...good,
      tweet: 'x'.repeat(500),
      email: { subject: 's'.repeat(200), body: good.email.body },
    })!;
    expect(long.tweet.length).toBeLessThanOrEqual(280);
    expect(long.email.subject.length).toBeLessThanOrEqual(80);
  });
});

// The code-fence stripping the spec requires lives in callClaude's extractJson;
// this replicates its fence case to pin the behavior the route depends on.
describe('code-fence tolerance (route contract)', () => {
  it('fenced JSON parses after fence stripping', () => {
    const fenced = '```json\n{"tweet":"t https://sbdc.events/x","linkedin":"l","email":{"subject":"s","body":"b"}}\n```';
    const match = fenced.match(/```(?:json)?\s*([\s\S]*?)```/);
    expect(match).not.toBeNull();
    const parsed = JSON.parse(match![1].trim());
    expect(sanitizeEventPromo(parsed)).not.toBeNull();
  });
});
