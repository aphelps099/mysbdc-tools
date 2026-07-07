/* ═══════════════════════════════════════════════════════
   Marketing Engine — pipeline route auth
   /api/pipeline/* routes are excluded from the APP_PASSWORD
   cookie middleware (cron can't do the cookie dance). They
   accept EITHER:
   · Authorization: Bearer ${PIPELINE_SERVICE_TOKEN}
     (constant-time compare) — for cron/workers, or
   · a valid admin sbdc_session cookie — so the "Scan now"
     button works for logged-in humans.
   ═══════════════════════════════════════════════════════ */

import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function verifySessionCookie(token: string | undefined): boolean {
  if (!token) return false;
  const secret = process.env.APP_SECRET || process.env.APP_PASSWORD;
  if (!secret) return false;
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  if (!safeEqual(sig, expected)) return false;
  // Scoped sessions (inject/tfg) may not run the pipeline — admin only
  const scope = payload.split(':')[0];
  return scope !== 'inject' && scope !== 'tfg';
}

/**
 * Returns null when authorized, or a Response to return immediately.
 * Never logs tokens.
 */
export function requirePipelineAuth(req: NextRequest): Response | null {
  const serviceToken = process.env.PIPELINE_SERVICE_TOKEN;
  const header = req.headers.get('authorization') ?? '';
  if (serviceToken && header.startsWith('Bearer ')) {
    if (safeEqual(header.slice(7), serviceToken)) return null;
  }
  if (verifySessionCookie(req.cookies.get('sbdc_session')?.value)) return null;

  return Response.json(
    { error: 'Unauthorized — pipeline routes require a service token or an admin session' },
    { status: 401 },
  );
}

/** Fail fast with a clear message when a required env var is missing. */
export function requireEnv(...names: string[]): Response | null {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length === 0) return null;
  return Response.json(
    { error: `Pipeline not configured — missing env: ${missing.join(', ')}` },
    { status: 503 },
  );
}
