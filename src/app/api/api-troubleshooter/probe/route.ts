/**
 * API Troubleshooter — Neoserra endpoint explorer. Read-only.
 *
 * Lets an authenticated troubleshooter session test a single GET against
 * the Neoserra API to discover working query shapes (e.g. hunting the
 * milestone read endpoint) without a code change per guess.
 *
 * Guardrails: GET only (enforced by rawNeoserraGet), path must be inside
 * /api/v1/, and the response body is truncated. Nothing is persisted.
 */

import { NextRequest, NextResponse } from 'next/server';
import { neoserraConfigured, rawNeoserraGet } from '@/lib/api-troubleshooter/neoserra-read';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!neoserraConfigured()) {
    return NextResponse.json({ error: 'Neoserra credentials not configured' }, { status: 503 });
  }

  let body: { path?: string; timeoutMs?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const timeoutMs = Math.min(Math.max(Number(body.timeoutMs) || 8_000, 1_000), 25_000);

  const path = (body.path || '').trim();
  if (!path.startsWith('/api/v1/') || path.includes('..') || /\s/.test(path)) {
    return NextResponse.json(
      { error: 'Path must be a single Neoserra /api/v1/... path' },
      { status: 400 },
    );
  }

  const res = await rawNeoserraGet(path, timeoutMs);
  const raw = JSON.stringify(res.body ?? null);
  return NextResponse.json({
    path: res.path,
    status: res.status,
    note: res.note,
    body: raw && raw.length > 20_000 ? `${raw.slice(0, 20_000)}… (truncated)` : res.body,
  });
}
