import { describe, it, expect } from 'vitest';
import { slugFromUrl, slashtagFromTitle, slashtagWithSuffix, withUtm } from '@/lib/pipeline/slug';

describe('slugFromUrl', () => {
  it('takes the last path segment, trailing slash or not', () => {
    expect(slugFromUrl('https://www.sanjoaquinsbdc.org/event/start-up-sprint-stockton/')).toBe('start-up-sprint-stockton');
    expect(slugFromUrl('https://www.norcalsbdc.org/event/menu-pricing-margins')).toBe('menu-pricing-margins');
  });
  it('lowercases and survives garbage', () => {
    expect(slugFromUrl('https://x.org/event/MiXeD-Case/')).toBe('mixed-case');
    expect(slugFromUrl('not a url')).toBe('');
  });
});

describe('slashtagFromTitle', () => {
  it('slugifies simple titles', () => {
    expect(slashtagFromTitle('Cannabis Tax Workshop')).toBe('cannabis-tax-workshop');
  });
  it('strips Spanish accents and punctuation', () => {
    expect(slashtagFromTitle('Cómo Financiar Su Negocio: Guía Práctica')).toBe('como-financiar-su-negocio-guia-practica');
  });
  it('trims stop words but never to nothing', () => {
    expect(slashtagFromTitle('An Introduction to QuickBooks for Your Business')).toBe('introduction-quickbooks-business');
    expect(slashtagFromTitle('The And Of')).not.toBe('');
  });
  it('caps length on a word boundary (~40 chars)', () => {
    const tag = slashtagFromTitle('A Very Long Workshop Title About Marketing Strategy And Social Media For Restaurants');
    expect(tag.length).toBeLessThanOrEqual(40);
    expect(tag.endsWith('-')).toBe(false);
  });
  it('handles collision suffixes', () => {
    expect(slashtagWithSuffix('cannabis-tax-workshop', 1)).toBe('cannabis-tax-workshop');
    expect(slashtagWithSuffix('cannabis-tax-workshop', 2)).toBe('cannabis-tax-workshop-2');
    expect(slashtagWithSuffix('cannabis-tax-workshop', 3)).toBe('cannabis-tax-workshop-3');
  });
});

describe('withUtm', () => {
  it('appends to a clean URL', () => {
    const out = withUtm('https://x.org/event/foo/', 'foo');
    expect(out).toContain('utm_source=sbdc-events');
    expect(out).toContain('utm_content=foo');
  });
  it('appends correctly when a query string already exists', () => {
    const out = withUtm('https://x.org/event/foo/?ref=nav', 'foo');
    expect(out).toContain('ref=nav');
    expect(out).toContain('utm_campaign=event-promo');
    expect((out.match(/\?/g) ?? []).length).toBe(1);
  });
});
