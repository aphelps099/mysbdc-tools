import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import {
  deleteStoredPartners,
  loadPartners,
  resolveDataDir,
  writePartners,
} from '@/lib/partnerships-store';
import { STAGES, TYPES, type Partner } from '@/components/partnerships/types';

/* ═══════════════════════════════════════════════════════
   GET /api/partnerships — the shared partners collection
     → { partners, sampleData }  (sampleData while the
       untouched SAMPLE_DATA seed is being served)
   PUT /api/partnerships — replace the collection
     ← { partners }  → { ok, sampleData: false }
   DELETE /api/partnerships — reset to the seed (a backup
     of the stored collection is kept). Admin only.

   Auth: cookie-gated by src/middleware.ts (admin or
   crm-scoped sessions); DELETE additionally requires the
   admin scope.
   ═══════════════════════════════════════════════════════ */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidPartner(p: unknown): p is Partner {
  if (!p || typeof p !== 'object') return false;
  const rec = p as Record<string, unknown>;
  return (
    typeof rec.id === 'number' &&
    typeof rec.name === 'string' &&
    rec.name.trim().length > 0 &&
    typeof rec.type === 'string' &&
    rec.type in TYPES &&
    typeof rec.stage === 'string' &&
    (STAGES as string[]).includes(rec.stage) &&
    Array.isArray(rec.activities)
  );
}

export async function GET() {
  const { partners, sampleData } = loadPartners(resolveDataDir());
  return NextResponse.json({ partners, sampleData });
}

export async function PUT(req: NextRequest) {
  let body: { partners?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const partners = body.partners;
  if (!Array.isArray(partners) || !partners.every(isValidPartner)) {
    return NextResponse.json({ error: 'Invalid partners payload' }, { status: 400 });
  }

  try {
    writePartners(resolveDataDir(), partners as Partner[]);
  } catch (err) {
    console.error('[partnerships] write failed:', err);
    return NextResponse.json({ error: 'Failed to save partners' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sampleData: false });
}

/** Middleware already verified the cookie; this only checks its scope. */
function isAdminSession(req: NextRequest): boolean {
  const secret = process.env.APP_SECRET || process.env.APP_PASSWORD;
  if (!secret) return true; // dev mode — no auth configured
  const token = req.cookies.get('sbdc_session')?.value;
  if (!token) return false;
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  try {
    if (!timingSafeEqual(Buffer.from(token.slice(lastDot + 1), 'hex'), Buffer.from(expected, 'hex'))) {
      return false;
    }
  } catch {
    return false;
  }
  const parts = payload.split(':');
  return parts.length < 3 || parts[0] === 'admin';
}

export async function DELETE(req: NextRequest) {
  if (!isAdminSession(req)) {
    return NextResponse.json(
      { error: 'Resetting the CRM requires a full-access admin session' },
      { status: 403 },
    );
  }
  try {
    deleteStoredPartners(resolveDataDir());
  } catch (err) {
    console.error('[partnerships] reset failed:', err);
    return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, reset: true, sampleData: true });
}
