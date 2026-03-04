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

  // Timing-safe comparison — check main password first, then lender password
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

  if (!mainMatch && !lenderMatch) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Create signed session token
  const nonce = randomBytes(16).toString('hex');
  const payload = `${nonce}:${Date.now()}`;
  const token = signToken(payload);

  const res = NextResponse.json({
    ok: true,
    ...(lenderMatch ? { redirect: '/brand/lender-resources' } : {}),
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
