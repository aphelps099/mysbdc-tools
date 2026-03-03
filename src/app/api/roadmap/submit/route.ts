/**
 * Roadmap for Innovation — Application submit route.
 *
 * Flow:
 *   1. Map R4I fields to intake-compatible payload (with all required fields)
 *   2. Create client via backend /api/intake/submit
 *   3. Send welcome email via Resend
 */

import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { buildR4iWelcomeHtml } from '@/lib/emails/r4i-client-welcome';
import {
  COACHING_OPTIONS,
  GROUP_COURSE_OPTIONS,
  EMPLOYEE_RANGES,
  YEARS_RANGES,
} from '@/components/roadmap/types';

export const dynamic = 'force-dynamic';

const NEOSERRA_CENTER_ID = 113;

function backendUrl(): string {
  return (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
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

  if (str(d.yearsInOperation)) {
    lines.push(`Years in Operation: ${lookupLabel(str(d.yearsInOperation), YEARS_RANGES)}`);
  }

  if (str(d.employeeCount)) {
    lines.push(`Employees: ${lookupLabel(str(d.employeeCount), EMPLOYEE_RANGES)}`);
  }

  if (str(d.website)) {
    lines.push(`Website: ${str(d.website)}`);
  }

  const coaching = arr(d.coachingInterests);
  if (coaching.length) {
    lines.push(`Coaching Interests: ${lookupLabels(coaching, COACHING_OPTIONS)}`);
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
    website: r4iData.website ?? '',
    businessDescription: r4iData.productDescription ?? '',

    // Structured R4I application details → NeoSerra Contact "notes" field
    notes: buildR4iNotes(r4iData),

    // Signature
    signature: r4iData.signature ?? '',
    privacyRelease: r4iData.privacyRelease ?? 'No',

    // Program flags
    programSignup: 'r4i',
    specialPrograms: ['r4i'],

    // Suppress backend emails — R4I sends its own
    sendEmails: false,

    // Defaults for required intake fields
    goals: [],
    gender: '',
    ethnicity: '',
    hispanic: '',
    veteran: '',
    education: '',
    language: '',
    referral: '',
    referralOther: '',
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

  // Step 2: Send welcome email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  let emailResult: unknown = null;

  if (resendKey && str(r4iData.email)) {
    try {
      const resend = new Resend(resendKey);
      const from = process.env.RESEND_FROM_SBDC
        || process.env.RESEND_FROM
        || 'California SBDC <onboarding@resend.dev>';

      const result = await resend.emails.send({
        from,
        to: [str(r4iData.email)],
        subject: 'Application Received — Roadmap for Innovation',
        html: buildR4iWelcomeHtml({
          firstName: str(r4iData.firstName),
          companyName: str(r4iData.companyName),
        }),
      });

      emailResult = result;
      console.log('[r4i/submit] Welcome email sent:', JSON.stringify(result));
    } catch (e: unknown) {
      emailResult = { error: e instanceof Error ? e.message : String(e) };
      console.error('[r4i/submit] Welcome email FAILED:', e);
    }
  } else if (!resendKey) {
    console.warn('[r4i/submit] RESEND_API_KEY not set; skipping welcome email');
  }

  return Response.json({
    success: (intakeResult as Record<string, unknown>)?.success ?? true,
    applicationId: (intakeResult as Record<string, unknown>)?.id ?? null,
    neoserraResult: (intakeResult as Record<string, unknown>)?.neoserraResult ?? null,
    emailResult,
  });
}
