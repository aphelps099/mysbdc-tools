/* ═══════════════════════════════════════════════════════
   Geocode query variants — makes partial addresses work.

   Staff paste addresses like "1 Harpst Street, SBS 427":
   no city, no state, and a room code the geocoders choke
   on. Every address in this tool is Northern California, so
   we can retry progressively friendlier variants instead of
   failing. Pure and unit-tested; used by /api/geocode.
   ═══════════════════════════════════════════════════════ */

const HAS_CALIFORNIA = /\b(ca|calif|california)\b\.?/i;

// Unit/suite/room designators that confuse street-level geocoding. The code
// after the designator must contain a digit or be a single letter ("Suite
// 210", "Unit B") so real street names like "Suite Dr" are never stripped.
const UNIT_PATTERN =
  /,?\s*\b(suite|ste|unit|apt|apartment|rm|room|bldg|building|fl|floor|ofc|office|sbs)\.?\s*#?\s*(\d[\w-]*|[A-Za-z])\b/gi;
const HASH_UNIT_PATTERN = /,?\s*#\s*[\w-]+\b/g;

function clean(value: string): string {
  return value
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*,\s*,+/g, ',')
    .replace(/^\s*,+/, '')
    .replace(/,+\s*$/, '')
    .trim();
}

function withCalifornia(value: string): string {
  return HAS_CALIFORNIA.test(value) ? value : value + ', CA';
}

// A tail like "SBS 427", "Rm 12", or "Bldg C-3": one short token (≤4
// letters) plus a short code (≤4 digits). City tails don't match — 5-letter
// city names ("Ukiah 95482") and 5-digit ZIPs are excluded — so real place
// information is never thrown away.
const NOISE_TAIL = /^\s*[A-Za-z]{1,4}\.?\s*#?\s*\d{1,4}[A-Za-z-]{0,2}\s*$/;

export interface QueryVariant {
  query: string;
  /* 'exact' = the address as the user gave it (± ", CA"); 'relaxed' = we
     stripped parts of it, so a match may be approximate — never auto-place
     a relaxed match without the user confirming it. */
  precision: 'exact' | 'relaxed';
}

/**
 * Ordered lookup variants for a raw address query:
 * 1. as typed (exact)
 * 2. with ", CA" appended when no state is present (exact)
 * 3. with unit/suite/room codes stripped, plus ", CA" (relaxed)
 * 4. street part before the first comma, plus ", CA" — only when the tail
 *    looks like a room/unit code, never when it could be a city (relaxed)
 */
export function buildQueryVariants(query: string): QueryVariant[] {
  const raw = clean(query);
  if (!raw) return [];
  const variants: QueryVariant[] = [{ query: raw, precision: 'exact' }];
  const rawCa = withCalifornia(raw);
  if (rawCa !== raw) variants.push({ query: rawCa, precision: 'exact' });

  const stripped = clean(raw.replace(UNIT_PATTERN, '').replace(HASH_UNIT_PATTERN, ''));
  if (stripped && stripped !== raw) {
    variants.push({ query: withCalifornia(stripped), precision: 'relaxed' });
  }

  const commaIndex = raw.indexOf(',');
  if (commaIndex > 0) {
    const firstSegment = clean(raw.slice(0, commaIndex));
    const tail = raw.slice(commaIndex + 1);
    if (firstSegment && NOISE_TAIL.test(tail)) {
      variants.push({ query: withCalifornia(firstSegment), precision: 'relaxed' });
    }
  }

  const seen = new Set<string>();
  return variants.filter((variant) => {
    if (seen.has(variant.query)) return false;
    seen.add(variant.query);
    return true;
  });
}
