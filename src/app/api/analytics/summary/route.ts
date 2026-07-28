import { NextResponse } from 'next/server';
import { readEvents, resolveDataDir, summarize } from '@/lib/analytics-store';

/* ═══════════════════════════════════════════════════════
   GET /api/analytics/summary — usage rollup for the admin
   dashboard at /admin/analytics.

   Auth: cookie-gated by middleware. This path is NOT in
   any scoped allowlist, so tool-scoped sessions (crm, map,
   tfg, inject) get 403 — only full-access admin sessions
   can read the analytics.
   ═══════════════════════════════════════════════════════ */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const events = readEvents(resolveDataDir());
  return NextResponse.json(summarize(events));
}
