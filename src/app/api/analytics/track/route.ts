import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { appendEvent, resolveDataDir } from '@/lib/analytics-store';

/* ═══════════════════════════════════════════════════════
   POST /api/analytics/track — record a client usage event.

   Fire-and-forget beacon target for the tools' UIs (the
   Partnership CRM sends view switches, partner opens, and
   saves here). Events are whitelisted and meta is clamped
   so the log stays small and boring. Login events are NOT
   accepted from clients — the auth route records those
   server-side.

   Auth: cookie-gated by middleware (any session scope may
   report usage). The session scope is read from the signed
   cookie so events say who was clicking.
   ═══════════════════════════════════════════════════════ */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_EVENTS = new Set([
  'app_open',
  'view',
  'partner_open',
  'partner_add',
  'partner_save',
  'activity_log',
]);

const MAX_META_KEYS = 8;
const MAX_META_VALUE = 120;

function getSecret(): string {
  return process.env.APP_SECRET || process.env.APP_PASSWORD || 'fallback-dev-secret';
}

/** Scope from the signed session cookie ('anon' when absent/invalid — dev mode). */
function cookieScope(req: NextRequest): string {
  const token = req.cookies.get('sbdc_session')?.value;
  if (!token) return 'anon';
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return 'anon';
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = createHmac('sha256', getSecret()).update(payload).digest('hex');
  try {
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return 'anon';
  } catch {
    return 'anon';
  }
  const parts = payload.split(':');
  return parts.length >= 3 ? parts[0] : 'admin';
}

function cleanMeta(meta: unknown): Record<string, string | number> | undefined {
  if (!meta || typeof meta !== 'object') return undefined;
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(meta as Record<string, unknown>).slice(0, MAX_META_KEYS)) {
    if (typeof v === 'number' && Number.isFinite(v)) out[k.slice(0, 40)] = v;
    else if (typeof v === 'string') out[k.slice(0, 40)] = v.slice(0, MAX_META_VALUE);
  }
  return Object.keys(out).length ? out : undefined;
}

export async function POST(req: NextRequest) {
  let body: { event?: unknown; meta?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event = typeof body.event === 'string' ? body.event : '';
  if (!ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: 'Unknown event' }, { status: 400 });
  }

  try {
    appendEvent(resolveDataDir(), {
      ts: new Date().toISOString(),
      event,
      scope: cookieScope(req),
      meta: cleanMeta(body.meta),
      ua: (req.headers.get('user-agent') || '').slice(0, 140) || undefined,
    });
  } catch (err) {
    console.error('[analytics] append failed:', err);
    // beacons are fire-and-forget — never surface an error to the UI
  }

  return NextResponse.json({ ok: true });
}
