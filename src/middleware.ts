import { NextRequest, NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════
   Middleware — Password-gate the entire app
   Redirects unauthenticated users to /login.

   Uses Web Crypto API (Edge Runtime compatible).
   ═══════════════════════════════════════════════════════ */

const COOKIE_NAME = 'sbdc_session';

function getSecret(): string {
  return process.env.APP_SECRET || process.env.APP_PASSWORD || 'fallback-dev-secret';
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return bytesToHex(new Uint8Array(sig));
}

async function verifyToken(token: string): Promise<boolean> {
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);

  const expected = await hmacSha256(getSecret(), payload);

  // Constant-time comparison
  if (sig.length !== expected.length) return false;
  const a = hexToBytes(sig);
  const b = hexToBytes(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function middleware(req: NextRequest) {
  // Skip auth if APP_PASSWORD is not set (dev mode / not configured)
  if (!process.env.APP_PASSWORD) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token || !(await verifyToken(token))) {
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
