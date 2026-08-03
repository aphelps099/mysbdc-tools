import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { Resend } from 'resend';
import { todayISO } from '@/components/partnerships/logic';
import { appendEvent, resolveDataDir as analyticsDir } from '@/lib/analytics-store';
import { buildDigestHtml, buildDigestText } from '@/lib/emails/partnerships-digest';
import { computeDigest, digestSubject } from '@/lib/partnerships-digest';
import { loadPartners, resolveDataDir } from '@/lib/partnerships-store';

/* ═══════════════════════════════════════════════════════
   POST /api/partnerships/digest — send the weekly
   follow-up digest email.

   Called by the GitHub Actions cron (Mondays) with the
   same PIPELINE_SERVICE_TOKEN the Marketing Engine uses,
   or by a logged-in admin (cookie). Excluded from the
   cookie middleware like /api/pipeline/* — auth happens
   here, and CRM-scoped sessions are NOT accepted.

   Body (optional): { "dryRun": true } → returns subject,
   counts, and rendered HTML without sending anything.

   Skips sending when there is nothing actionable (no
   overdue, no stale, nothing due in 7 days).

   Env: RESEND_API_KEY,
        RESEND_FROM_NORCAL (preferred sender, e.g.
        "NorCal SBDC <partnerships@norcalsbdc.org>" once
        norcalsbdc.org is verified in Resend; falls back
        to RESEND_FROM_SBDC),
        PARTNERSHIPS_DIGEST_TO (comma-separated, defaults
        to phelps@norcalsbdc.org).
   ═══════════════════════════════════════════════════════ */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_RECIPIENTS = ['phelps@norcalsbdc.org'];

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Bearer service token (cron) or a full-access admin session cookie. */
function isAuthorized(req: NextRequest): boolean {
  const serviceToken = process.env.PIPELINE_SERVICE_TOKEN;
  const header = req.headers.get('authorization') ?? '';
  if (serviceToken && header.startsWith('Bearer ') && safeEqual(header.slice(7), serviceToken)) {
    return true;
  }

  const token = req.cookies.get('sbdc_session')?.value;
  const secret = process.env.APP_SECRET || process.env.APP_PASSWORD;
  if (!token || !secret) return false;
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  if (!safeEqual(token.slice(lastDot + 1), expected)) return false;
  // Scoped sessions (crm/map/tfg/inject) may not trigger email — admin only.
  const parts = payload.split(':');
  return parts.length < 3 || parts[0] === 'admin';
}

function recipients(): string[] {
  const raw = process.env.PARTNERSHIPS_DIGEST_TO || '';
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : DEFAULT_RECIPIENTS;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized — digest requires a service token or an admin session' },
      { status: 401 },
    );
  }

  let dryRun = false;
  try {
    const body = await req.json();
    dryRun = Boolean(body?.dryRun);
  } catch {
    /* empty body is fine */
  }

  const { partners, sampleData } = loadPartners(resolveDataDir());
  const digest = computeDigest(partners, todayISO());
  const counts = {
    overdue: digest.overdue.length,
    stale: digest.stale.length,
    dueSoon: digest.dueSoon.length,
    recentActivity: digest.recentActivity.length,
  };
  const subject = digestSubject(digest);

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      sampleData,
      subject,
      counts,
      recipients: recipients(),
      html: buildDigestHtml(digest),
    });
  }

  if (!digest.hasActionable) {
    return NextResponse.json({ ok: true, skipped: 'nothing actionable', counts });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY not set — digest not sent', counts },
      { status: 503 },
    );
  }

  // Sender preference: the NorCal-branded address once norcalsbdc.org is
  // verified in Resend, then the shared SBDC sender. RESEND_FROM is the
  // TFG-branded sender in this repo — never use it here.
  const from = process.env.RESEND_FROM_NORCAL
    || process.env.RESEND_FROM_SBDC
    || 'California SBDC <noreply@californiasbdc.org>';

  const to = recipients();
  const resend = new Resend(resendKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html: buildDigestHtml(digest),
    text: buildDigestText(digest),
  });

  if (error) {
    console.error('[partnerships/digest] send failed:', error);
    return NextResponse.json({ error: `Send failed: ${error.message}`, counts }, { status: 502 });
  }

  try {
    appendEvent(analyticsDir(), {
      ts: new Date().toISOString(),
      event: 'digest_sent',
      scope: 'system',
      meta: { recipients: to.length, ...counts },
    });
  } catch {
    /* analytics is best-effort */
  }

  return NextResponse.json({ ok: true, sent: true, id: data?.id, recipients: to, counts });
}
