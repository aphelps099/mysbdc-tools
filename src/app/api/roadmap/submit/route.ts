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
 * The backend creates the client + contact record in NeoSerra.
 * R4I application details are passed as `notes` in the intake payload
 * so they appear on the contact record alongside all other fields
 * (business status, signature, etc.).
 */

import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { buildR4iWelcomeHtml } from '@/lib/emails/r4i-client-welcome';
import {
  buildR4iAdminNotificationHtml,
  R4I_ADMIN_RECIPIENTS,
} from '@/lib/emails/r4i-admin-notification';
import {
  COACHING_OPTIONS,
  GROUP_COURSE_OPTIONS,
  YEARS_RANGES,
} from '@/components/roadmap/types';

export const dynamic = 'force-dynamic';

const NEOSERRA_CENTER_ID = 113;

function backendUrl(): string {
  return (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
}

function neoserraUrl(): string {
  return (process.env.NEOSERRA_BASE_URL || '').replace(/\/+$/, '');
}

function neoserraKey(): string {
  return process.env.NEOSERRA_API_KEY || '';
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}

/** Map stored id values back to human-readable labels */
function lookupLabel(value: string, options: { value: string; label: string }[]): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

function lookupLabels(
  ids: string[],
  options: { id: string; label: string }[],
): string {
  return ids.map((id) => options.find((o) => o.id === id)?.label ?? id).join(', ');
}

/** Map R4I referral source values to NeoSerra reffrom codes. */
const REFERRAL_TO_REFFROM: Record<string, string> = {
  sbdc: 'D',      // Small Business Development Center (SBDC)
  sba: 'N',       // Small Business Administration District Office (SBA)
  calosba: 'SG',  // State Government Agency
  CT: 'CT',       // Roadmap 4 Innovation (R4I)
  mep: 'ZZ',      // Partners: APEX/PTAC, SCORE, WBC, VBOC
  industry: 'TA', // Trade Associations
  peer: 'BU',     // Business Owner
  web: 'IW',      // Internet: Website
  social: 'SM',   // Internet: Social Media
  event: 'EV',    // Event
  other: 'O',     // Other
};

/** Position is now a dropdown sending NeoSerra codes directly. Fallback to OWN. */
const VALID_POSITIONS = new Set(['CEO', 'VPR', 'PR', 'OWN', 'SP', 'GM', 'PTR', 'EMP']);
function resolvePosition(code: string): string {
  return VALID_POSITIONS.has(code) ? code : 'OWN';
}

/** Map R4I coaching interest IDs to NeoSerra step2 (MultipleSelection) codes. */
const COACHING_TO_STEP2: Record<string, string> = {
  lean: 'Lean Operations',
  quality: 'Quality Systems',
  cybersecurity: 'Cybersecurity Assistance',
  hr: 'HR/Managing Employees',
  food: 'Food Market Development',
  financial: 'Financial Advising',
  strategy: 'Strategy & Leadership',
};

/** Map R4I group course IDs to NeoSerra step2 codes. */
const COURSE_TO_STEP2: Record<string, string> = {
  strategic_planning: 'Managing a Business',
  supply_chain: 'Supply Chain/Inventory Management',
};

/**
 * Build a structured notes string from R4I-specific fields so the reviewer
 * can see everything in the NeoSerra client record at a glance.
 */
function buildR4iNotes(d: Record<string, unknown>): string {
  const lines: string[] = [];

  lines.push('— R4I Application Details —');

  if (str(d.productDescription)) {
    lines.push(`Products / Manufacturing: ${str(d.productDescription)}`);
  }

  if (str(d.dateEstablished)) {
    lines.push(`Date Established: ${str(d.dateEstablished)}`);
  }

  if (str(d.yearsInOperation)) {
    lines.push(`Years in Operation: ${lookupLabel(str(d.yearsInOperation), YEARS_RANGES)}`);
  }

  if (str(d.website)) {
    lines.push(`Website: ${str(d.website)}`);
  }

  const coaching = arr(d.coachingInterests);
  if (coaching.length) {
    lines.push(`Advising Interests: ${lookupLabels(coaching, COACHING_OPTIONS)}`);
  }

  const courses = arr(d.groupCourses);
  if (courses.length) {
    lines.push(`Group Courses: ${lookupLabels(courses, GROUP_COURSE_OPTIONS)}`);
  }

  if (str(d.biggestChallenge)) {
    lines.push(`Biggest Challenge: ${str(d.biggestChallenge)}`);
  }

  return lines.join('\n');
}

// ─── R4I PIN payload builder ─────────────────────────────────

function buildR4iPinPayload(
  d: Record<string, unknown>,
  clientId: string,
): Record<string, unknown> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Map coaching interest IDs to human-readable labels for NeoSerra multi-select
  const advisingLabels = arr(d.coachingInterests)
    .map((id) => COACHING_OPTIONS.find((o) => o.id === id)?.label ?? id)
    .join(',');

  // Map group course IDs to human-readable labels for NeoSerra multi-select
  const courseLabels = arr(d.groupCourses)
    .map((id) => GROUP_COURSE_OPTIONS.find((o) => o.id === id)?.label ?? id)
    .join(',');

  return {
    clientId,
    date: today,
    centerId: '113',
    r4iadvising: advisingLabels,
    r4icourses: courseLabels,
    r4ichallenge: str(d.biggestChallenge),
  };
}

// ─── NeoSerra R4I PIN creation ───────────────────────────────

async function createR4iPin(
  r4iData: Record<string, unknown>,
  clientId: string,
): Promise<Record<string, unknown> | null> {
  const base = neoserraUrl();
  const key = neoserraKey();
  if (!base || !key) {
    console.warn('[r4i/submit] NEOSERRA_BASE_URL or NEOSERRA_API_KEY not set; skipping PIN creation');
    return null;
  }

  const payload = buildR4iPinPayload(r4iData, clientId);

  try {
    const res = await fetch(`${base}/api/v1/r4i/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok || (body && body.status === 'fail')) {
      console.warn('[r4i/submit] PIN creation failed:', JSON.stringify(body));
      return body;
    }

    return body;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[r4i/submit] PIN creation error: ${reason}`);
    return null;
  }
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

  // Map R4I referral source to NeoSerra reffrom code
  const r4iReferral = str(r4iData.referralSource);
  const neoReffrom = REFERRAL_TO_REFFROM[r4iReferral] || '';

  // Map R4I coaching interests + group courses to NeoSerra Step Two codes
  const coaching = arr(r4iData.coachingInterests);
  const courses = arr(r4iData.groupCourses);
  const stepTwoCodes = new Set<string>();
  for (const id of coaching) {
    if (COACHING_TO_STEP2[id]) stepTwoCodes.add(COACHING_TO_STEP2[id]);
  }
  for (const id of courses) {
    if (COURSE_TO_STEP2[id]) stepTwoCodes.add(COURSE_TO_STEP2[id]);
  }

  // Map R4I fields to intake-compatible payload with all required fields
  const intakePayload = {
    // Contact
    firstName: r4iData.firstName ?? '',
    lastName: r4iData.lastName ?? '',
    email: r4iData.email ?? '',
    phone: r4iData.phone ?? '',
    streetAddress: r4iData.streetAddress ?? '',
    city: r4iData.city ?? '',
    state: r4iData.state ?? 'CA',
    zipCode: r4iData.zipCode ?? '',

    // Business — R4I applicants are existing manufacturers
    businessStatus: 'B',
    companyName: r4iData.companyName ?? '',
    dateEstablished: r4iData.dateEstablished ?? '',
    website: r4iData.website ?? '',
    businessDescription: r4iData.productDescription ?? '',
    position: resolvePosition(str(r4iData.title)),

    // Structured R4I application details → NeoSerra Contact "notes" field
    notes: buildR4iNotes(r4iData),

    // NeoSerra Step Two: Areas of Assistance (mapped from coaching interests)
    stepTwo: [...stepTwoCodes],

    // NeoSerra If Other: Biggest challenge / additional assistance needed
    ifOther: str(r4iData.biggestChallenge),

    // NeoSerra business type — R4I applicants are manufacturers
    bustype: 'MF',

    // Signature
    signature: r4iData.signature ?? '',
    privacyRelease: r4iData.privacyRelease ?? 'No',

    // Program flags
    programSignup: 'r4i',
    specialPrograms: ['r4i'],

    // Suppress backend emails — R4I sends its own
    sendEmails: false,

    // Mark as eCenter intake so record appears in "New Sign-ups" queue
    intake: true,

    // Defaults for required intake fields
    goals: [],
    gender: '',
    ethnicity: '',
    hispanic: '',
    veteran: '',
    education: '',
    language: '',
    referral: neoReffrom,
    referralOther: r4iReferral === 'other' ? str(r4iData.referralOther) : '',
    newsletter: '',
    centerId: NEOSERRA_CENTER_ID,
  };

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
    pinResult = await createR4iPin(r4iData, clientId);
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
