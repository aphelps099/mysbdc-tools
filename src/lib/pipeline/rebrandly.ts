/* ═══════════════════════════════════════════════════════
   Marketing Engine — Rebrandly shortlinks (sbdc.events)
   Slashtag = slugified title; collisions retry with -2/-3…
   suffixes; 429s back off. Link IDs are stored so
   destinations can be remapped in bulk after the website
   redesign — the shortlink layer is the insulation.
   ═══════════════════════════════════════════════════════ */

import { slashtagFromTitle, slashtagWithSuffix, withUtm } from './slug';

// Overridable so tests can point at a local mock instead of the network.
const API = process.env.REBRANDLY_API_URL || 'https://api.rebrandly.com/v1';
const MAX_SLASHTAG_ATTEMPTS = 5;
const MAX_429_RETRIES = 3;

export interface Shortlink {
  id: string;
  slashtag: string;
  shortlink: string; // https://sbdc.events/<slashtag>
}

function apiKey(): string {
  const key = process.env.REBRANDLY_API_KEY;
  if (!key) throw new Error('REBRANDLY_API_KEY not set');
  return key;
}

function domain(): string {
  return process.env.REBRANDLY_DOMAIN || 'sbdc.events';
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function post(path: string, body: unknown, attempt = 0): Promise<Response> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: apiKey() },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 429 && attempt < MAX_429_RETRIES) {
    const after = Number(res.headers.get('retry-after')) || 2 ** attempt * 2;
    await delay(after * 1000);
    return post(path, body, attempt + 1);
  }
  return res;
}

/**
 * Create a shortlink for an event. The destination is the detail URL with
 * UTM parameters appended.
 */
export async function createShortlink(event: {
  title: string;
  slug: string;
  detailUrl: string;
  /** Explicit slashtag base — skips title derivation (collision suffixes still apply). */
  slashtag?: string;
}): Promise<Shortlink> {
  const destination = withUtm(event.detailUrl, event.slug);
  const base = event.slashtag || slashtagFromTitle(event.title);

  let lastError = 'unknown';
  for (let attempt = 1; attempt <= MAX_SLASHTAG_ATTEMPTS; attempt++) {
    const slashtag = slashtagWithSuffix(base, attempt);
    const res = await post('/links', {
      destination,
      slashtag,
      domain: { fullName: domain() },
      title: event.title,
    });

    if (res.ok) {
      const data = await res.json();
      return { id: data.id, slashtag, shortlink: `https://${domain()}/${slashtag}` };
    }

    const text = await res.text().catch(() => '');
    // 403 with "already exists" (code varies) → slashtag collision → suffix and retry
    if (res.status === 403 && /already|exists|invalid.*slashtag|taken/i.test(text)) {
      lastError = `slashtag "${slashtag}" taken`;
      continue;
    }
    throw new Error(`Rebrandly ${res.status}: ${text.slice(0, 200)}`);
  }
  throw new Error(`Rebrandly: no free slashtag after ${MAX_SLASHTAG_ATTEMPTS} attempts (${lastError})`);
}

/** Current click count for a link id. */
export async function getClicks(linkId: string): Promise<number> {
  const res = await fetch(`${API}/links/${encodeURIComponent(linkId)}`, {
    headers: { apikey: apiKey() },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Rebrandly ${res.status} for link ${linkId}`);
  const data = await res.json();
  return Number(data.clicks ?? 0);
}
