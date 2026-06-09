/**
 * Roadmap for Innovation — Application submit route.
 *
 * Flow:
 *   1. Map R4I fields to intake-compatible payload (with all required fields)
 *   2. Create client via backend /api/intake/submit
 *   3. Populate R4I PIN form directly via NeoSerra REST API
 *   4. Send welcome email to applicant via Resend
 *   5. Send admin notification email (with notes + NeoSerra link) via Resend
 *
 * Payload construction lives in src/lib/r4i-neoserra.ts, shared with the
 * admin inject tool so both paths produce identical NeoSerra records.
 */

import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { buildR4iWelcomeHtml } from '@/lib/emails/r4i-client-welcome';
import {
  buildR4iAdminNotificationHtml,
  R4I_ADMIN_RECIPIENTS,
} from '@/lib/emails/r4i-admin-notification';
import {
  buildR4iIntakePayload,
  buildR4iNotes,
  postR4iPin,
} from '@/lib/r4i-neoserra';

export const dynamic = 'force-dynamic';

function backendUrl(): string {
  return (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export async function POST(req: NextRequest): Promise<Response> {
  let r4iData: Record<string, unknown>;

  try {
    r4iData = await req.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const intakePayload = buildR4iIntakePayload(r4iData);

  // Step 1: Create client via backend intake endpoint
  let intakeResult: Record<string, unknown> | null = null;

  try {
    const res = await fetch(`${backendUrl()}/api/intake/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intakePayload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      console.warn(`[r4i/submit] Backend returned ${res.status}: ${text}`);
      return Response.json(
        { success: false, error: `Backend error (${res.status})` },
        { status: 502 },
      );
    }

    intakeResult = await res.json();
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[r4i/submit] Backend unreachable: ${reason}`);
    return Response.json(
      { success: false, error: 'Backend service unavailable' },
      { status: 502 },
    );
  }

  const neoserraResult = (intakeResult as Record<string, unknown>)?.neoserraResult as Record<string, unknown> | undefined;

  // Step 2: Populate R4I PIN form directly via NeoSerra API
  const clientId = String(
    neoserraResult?.id ?? (intakeResult as Record<string, unknown>)?.id ?? '0',
  );

  let pinResult: Record<string, unknown> | null = null;
  if (clientId && clientId !== '0') {
    const pin = await postR4iPin(r4iData, clientId);
    if (!pin.ok) {
      console.warn(`[r4i/submit] PIN creation failed: ${pin.error}`);
    }
    pinResult = pin.body;
  } else {
    console.warn('[r4i/submit] No valid clientId from intake — skipping PIN creation');
  }

  // Step 3: Send emails via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const emailResults: { client?: unknown; admin?: unknown } = {};
  const notes = buildR4iNotes(r4iData);

  if (resendKey) {
    const resend = new Resend(resendKey);
    const from = process.env.RESEND_FROM_SBDC
      || 'California SBDC <noreply@californiasbdc.org>';

    // Helper: retry once on 429 rate-limit (Resend free tier: 2 req/s)
    async function sendWithRetry(
      opts: Parameters<typeof resend.emails.send>[0],
    ) {
      const first = await resend.emails.send(opts);
      if (
        first.error &&
        'statusCode' in first.error &&
        (first.error as { statusCode?: number }).statusCode === 429
      ) {
        console.warn('[r4i/submit] Rate-limited — retrying after 1.5 s');
        await new Promise((r) => setTimeout(r, 1500));
        return resend.emails.send(opts);
      }
      return first;
    }

    // 2a: Client welcome email
    if (str(r4iData.email)) {
      try {
        const result = await sendWithRetry({
          from,
          to: [str(r4iData.email)],
          subject: 'Application Received — Roadmap for Innovation',
          html: buildR4iWelcomeHtml({
            firstName: str(r4iData.firstName),
            companyName: str(r4iData.companyName),
          }),
        });
        emailResults.client = result;
        console.log('[r4i/submit] Welcome email sent:', JSON.stringify(result));
      } catch (e: unknown) {
        emailResults.client = { error: e instanceof Error ? e.message : String(e) };
        console.error('[r4i/submit] Welcome email FAILED:', e);
      }
    }

    // 2b: Admin notification email (with application details)
    try {
      // Small delay to avoid rate-limiting after client email
      await new Promise((r) => setTimeout(r, 600));

      const adminResult = await sendWithRetry({
        from,
        to: R4I_ADMIN_RECIPIENTS,
        subject: `New R4I Application: ${str(r4iData.companyName) || `${str(r4iData.firstName)} ${str(r4iData.lastName)}`}`,
        html: buildR4iAdminNotificationHtml({
          firstName: str(r4iData.firstName),
          lastName: str(r4iData.lastName),
          companyName: str(r4iData.companyName),
          email: str(r4iData.email),
          phone: str(r4iData.phone),
          notes,
        }),
      });
      emailResults.admin = adminResult;
      console.log('[r4i/submit] Admin notification sent:', JSON.stringify(adminResult));
    } catch (e: unknown) {
      emailResults.admin = { error: e instanceof Error ? e.message : String(e) };
      console.error('[r4i/submit] Admin notification FAILED:', e);
    }
  } else {
    console.warn('[r4i/submit] RESEND_API_KEY not set; skipping emails');
  }

  return Response.json({
    success: (intakeResult as Record<string, unknown>)?.success ?? true,
    applicationId: (intakeResult as Record<string, unknown>)?.id ?? null,
    neoserraResult: neoserraResult ?? null,
    pinResult: pinResult ?? undefined,
    emailResults,
  });
}
