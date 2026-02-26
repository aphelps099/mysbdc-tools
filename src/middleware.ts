import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

/* ═══════════════════════════════════════════════════════
   Middleware — Password-gate the entire app
   Redirects unauthenticated users to /login.
   ═══════════════════════════════════════════════════════ */

const COOKIE_NAME = 'sbdc_session';

function getSecret(): string {
  return process.env.APP_SECRET || process.env.APP_PASSWORD || 'fallback-dev-secret';
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

export function middleware(req: NextRequest) {
  // Skip auth if APP_PASSWORD is not set (dev mode / not configured)
  if (!process.env.APP_PASSWORD) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token || !verifyToken(token)) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - /login (the login page itself)
     * - /api/auth/* (auth endpoints)
     * - /_next/* (Next.js internals)
     * - /fonts/* (static font files)
     * - /brand/* static assets
     * - favicon, images, static files
     */
    '/((?!login|api/auth|_next|fonts|brand/assets|favicon\\.ico|.*\\.png|.*\\.svg|.*\\.ico|.*\\.jpg|.*\\.webp).*)',
  ],
};
