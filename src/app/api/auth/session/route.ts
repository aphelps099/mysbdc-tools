import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/* ═══════════════════════════════════════════════════════
   POST /api/auth/session — Validate password, set cookie
   DELETE /api/auth/session — Clear cookie (logout)
   ═══════════════════════════════════════════════════════ */

const COOKIE_NAME = 'sbdc_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  return process.env.APP_SECRET || process.env.APP_PASSWORD || 'fallback-dev-secret';
}

function signToken(payload: string): string {
  const sig = createHmac('sha256', getSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyToken(token: string): boolean {
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = createHmac('sha256', getSecret()).update(payload).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) {
    return NextResponse.json(
      { error: 'APP_PASSWORD not configured' },
      { status: 503 },
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  // Timing-safe comparison — check main password first, then scoped passwords
  const a = Buffer.from(body.password);
  const b = Buffer.from(appPassword);
  const mainMatch = a.length === b.length && timingSafeEqual(a, b);

  // Second password: LENDER_PASSWORD → redirects to lender resources
  const lenderPassword = process.env.LENDER_PASSWORD;
  let lenderMatch = false;
  if (!mainMatch && lenderPassword) {
    const c = Buffer.from(lenderPassword);
    lenderMatch = a.length === c.length && timingSafeEqual(a, c);
  }

  // Third password: MILESTONES_PASSWORD → redirects to milestones page
  const milestonesPassword = process.env.MILESTONES_PASSWORD;
  let milestonesMatch = false;
  if (!mainMatch && !lenderMatch && milestonesPassword) {
    const d = Buffer.from(milestonesPassword);
    milestonesMatch = a.length === d.length && timingSafeEqual(a, d);
  }

  // Fourth password: INJECT_PASSWORD → session scoped to ONLY the inject tool
  const injectPassword = process.env.INJECT_PASSWORD;
  let injectMatch = false;
  if (!mainMatch && !lenderMatch && !milestonesMatch && injectPassword) {
    const e = Buffer.from(injectPassword);
    injectMatch = a.length === e.length && timingSafeEqual(a, e);
  }

  // Fifth password: TFG Motion → session scoped to ONLY /motion/tfg,
  // for direct links to the studio without the full tools password.
  const tfgPassword = process.env.TFG_MOTION_PASSWORD || 'tfgmotion';
  let tfgMatch = false;
  if (!mainMatch && !lenderMatch && !milestonesMatch && !injectMatch) {
    const f = Buffer.from(tfgPassword);
    tfgMatch = a.length === f.length && timingSafeEqual(a, f);
  }

  // Sixth password: Network Map → session scoped to ONLY /network-map,
  // so the map can be shared without exposing the rest of the toolbox.
  const mapPassword = process.env.MAP_PASSWORD || 'sbdc2027';
  let mapMatch = false;
  if (!mainMatch && !lenderMatch && !milestonesMatch && !injectMatch && !tfgMatch) {
    const g = Buffer.from(mapPassword);
    mapMatch = a.length === g.length && timingSafeEqual(a, g);
  }

  if (!mainMatch && !lenderMatch && !milestonesMatch && !injectMatch && !tfgMatch && !mapMatch) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Create signed session token. The scope is baked into the signed payload
  // so it cannot be altered client-side; middleware restricts inject-scoped
  // sessions to the inject tool, tfg-scoped to TFG Motion, and map-scoped to
  // the Network Map.
  const scope = injectMatch ? 'inject' : tfgMatch ? 'tfg' : mapMatch ? 'map' : 'admin';
  const nonce = randomBytes(16).toString('hex');
  const payload = `${scope}:${nonce}:${Date.now()}`;
  const token = signToken(payload);

  const res = NextResponse.json({
    ok: true,
    scope,
    ...(lenderMatch ? { redirect: '/brand/lender-resources' } : {}),
    ...(milestonesMatch ? { redirect: '/milestones' } : {}),
    ...(injectMatch ? { redirect: '/admin/inject-r4i' } : {}),
    ...(tfgMatch ? { redirect: '/motion/tfg' } : {}),
    ...(mapMatch ? { redirect: '/network-map' } : {}),
  });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
