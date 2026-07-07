/* ═══════════════════════════════════════════════════════
   Marketing Engine — slugs and Rebrandly slashtags
   ═══════════════════════════════════════════════════════ */

/** Last path segment of a detail URL — the pipeline's dedup key. */
export function slugFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '');
    const seg = path.split('/').filter(Boolean).pop() ?? '';
    return seg.toLowerCase();
  } catch {
    return '';
  }
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'the', 'of', 'for', 'to', 'in', 'on', 'with', 'your', 'you',
]);

/**
 * Slugify an event title into a Rebrandly slashtag:
 * lowercase, accents stripped (Spanish titles are common), hyphen-separated,
 * light stop-word trim, capped at ~40 chars on a word boundary.
 */
export function slashtagFromTitle(title: string, maxLen = 40): string {
  const base = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents: cómo → como
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean);

  const kept = base.filter((w) => !STOP_WORDS.has(w));
  const words = kept.length >= 2 ? kept : base; // don't trim a title to nothing

  let out = '';
  for (const w of words) {
    const next = out ? `${out}-${w}` : w;
    if (next.length > maxLen) break;
    out = next;
  }
  return out || 'event';
}

/** slashtag, slashtag-2, slashtag-3… for collision retries. */
export function slashtagWithSuffix(slashtag: string, attempt: number): string {
  return attempt <= 1 ? slashtag : `${slashtag}-${attempt}`;
}

/**
 * Append UTM parameters, correct whether or not the URL already has a query.
 */
export function withUtm(destination: string, slug: string): string {
  const utm =
    `utm_source=sbdc-events&utm_medium=shortlink&utm_campaign=event-promo&utm_content=${encodeURIComponent(slug)}`;
  try {
    const u = new URL(destination);
    for (const kv of utm.split('&')) {
      const [k, v] = kv.split('=');
      u.searchParams.set(k, decodeURIComponent(v));
    }
    return u.toString();
  } catch {
    return `${destination}${destination.includes('?') ? '&' : '?'}${utm}`;
  }
}
