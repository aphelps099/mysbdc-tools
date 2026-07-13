import { NextRequest, NextResponse } from 'next/server';
import { buildQueryVariants } from '@/components/network-map/geocode-query';

/* ═══════════════════════════════════════════════════════
   /api/geocode — server-side address lookup for Network Map

   US Census Bureau geocoder first (free, keyless, public
   domain, US-only — but no CORS, hence this proxy), MapTiler
   geocoding as fallback. Partial addresses are retried with
   progressively friendlier variants (", CA" appended,
   suite/room codes stripped — see geocode-query.ts). Results
   are bounded to the NorCal service area and cached in
   memory. Session-cookie-gated by src/middleware.ts.
   ═══════════════════════════════════════════════════════ */

interface Candidate {
  label: string;
  lat: number;
  lon: number;
  source: 'census' | 'maptiler';
  precision: 'exact' | 'relaxed';
}

// Northern California service-area bounds (west, south, east, north) —
// matches the prototype's Nominatim viewbox.
const BBOX = { west: -124.7, south: 36.6, east: -119.0, north: 42.2 };
const LIMIT = 5;
const TIMEOUT_MS = 5000;
const OVERALL_DEADLINE_MS = 14000;

const cache = new Map<string, { at: number; results: Candidate[] }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 500;

function inBbox(lat: number, lon: number): boolean {
  return lat >= BBOX.south && lat <= BBOX.north && lon >= BBOX.west && lon <= BBOX.east;
}

async function censusLookup(query: string, precision: 'exact' | 'relaxed'): Promise<Candidate[]> {
  const url =
    'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?benchmark=Public_AR_Current&format=json&address=' +
    encodeURIComponent(query);
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error('census ' + response.status);
  const data = await response.json();
  const matches: Array<{ matchedAddress?: string; coordinates?: { x: number; y: number } }> =
    data?.result?.addressMatches || [];
  return matches
    .filter((m) => m.coordinates && inBbox(m.coordinates.y, m.coordinates.x))
    .slice(0, LIMIT)
    .map((m) => ({
      label: m.matchedAddress || query,
      lat: m.coordinates!.y,
      lon: m.coordinates!.x,
      source: 'census' as const,
      precision,
    }));
}

async function maptilerLookup(query: string, precision: 'exact' | 'relaxed'): Promise<Candidate[]> {
  const key = process.env.MAPTILER_API_KEY || process.env.NEXT_PUBLIC_MAPTILER_KEY;
  // No key = this provider is unavailable, not "no results" — it must not
  // count as a successful lookup.
  if (!key) throw new Error('maptiler key missing');
  const url =
    'https://api.maptiler.com/geocoding/' +
    encodeURIComponent(query) +
    `.json?key=${key}&country=us&limit=${LIMIT}&language=en&types=address,poi&bbox=${BBOX.west},${BBOX.south},${BBOX.east},${BBOX.north}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error('maptiler ' + response.status);
  const data = await response.json();
  const features: Array<{ place_name?: string; center?: [number, number] }> = data?.features || [];
  return features
    .filter((f) => Array.isArray(f.center) && inBbox(f.center[1], f.center[0]))
    .slice(0, LIMIT)
    .map((f) => ({
      label: f.place_name || query,
      lat: f.center![1],
      lon: f.center![0],
      source: 'maptiler' as const,
      precision,
    }));
}

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') || '').trim();
  if (query.length < 4) {
    return NextResponse.json({ error: 'Enter a complete street address.' }, { status: 400 });
  }

  const cacheKey = query.toLowerCase();
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ results: hit.results, cached: true });
  }

  const startedAt = Date.now();
  const expired = () => Date.now() - startedAt > OVERALL_DEADLINE_MS;
  let results: Candidate[] = [];
  let everSucceeded = false;

  for (const variant of buildQueryVariants(query)) {
    for (const lookup of [censusLookup, maptilerLookup]) {
      if (expired()) break;
      try {
        results = await lookup(variant.query, variant.precision);
        everSucceeded = true;
        if (results.length) break;
      } catch {
        /* provider unavailable for this variant — keep trying */
      }
    }
    if (results.length || expired()) break;
  }

  if (!results.length && !everSucceeded) {
    return NextResponse.json({ error: 'Address lookup is unavailable right now.' }, { status: 502 });
  }

  // Only cache hits. An empty answer may just mean a provider was having a
  // bad minute — caching it would wedge that address for a day.
  if (results.length) {
    if (cache.size >= CACHE_MAX) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(cacheKey, { at: Date.now(), results });
  }

  return NextResponse.json({ results });
}
