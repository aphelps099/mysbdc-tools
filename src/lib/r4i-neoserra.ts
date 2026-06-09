/**
 * R4I (Roadmap for Innovation) — shared NeoSerra payload builders + inject runner.
 *
 * Single source of truth for how an R4I application becomes CRM records, used by:
 *   - the public form submit route (/api/roadmap/submit)
 *   - the admin inject tool (/api/admin/inject-r4i)
 * so both paths produce identical clients.
 *
 * Two CRM calls per application:
 *   1. Intake — POST {BACKEND_URL}/api/intake/submit (creates client + contact)
 *   2. PIN    — POST {NEOSERRA_BASE_URL}/api/v1/r4i/new (program-specific form)
 */

import {
  COACHING_OPTIONS,
  GROUP_COURSE_OPTIONS,
  YEARS_RANGES,
} from '@/components/roadmap/types';

export const NEOSERRA_CENTER_ID = 113;

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
export const REFERRAL_TO_REFFROM: Record<string, string> = {
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

/** Position is a dropdown sending NeoSerra codes directly. Fallback to OWN. */
const VALID_POSITIONS = new Set(['CEO', 'VPR', 'PR', 'OWN', 'SP', 'GM', 'PTR', 'EMP']);
export function resolvePosition(code: string): string {
  return VALID_POSITIONS.has(code) ? code : 'OWN';
}

/** Map R4I coaching interest IDs to NeoSerra step2 (MultipleSelection) codes. */
export const COACHING_TO_STEP2: Record<string, string> = {
  lean: 'Lean Operations',
  quality: 'Quality Systems',
  cybersecurity: 'Cybersecurity Assistance',
  hr: 'HR/Managing Employees',
  food: 'Food Market Development',
  financial: 'Financial Advising',
  strategy: 'Strategy & Leadership',
};

/** Map R4I group course IDs to NeoSerra step2 codes. */
export const COURSE_TO_STEP2: Record<string, string> = {
  strategic_planning: 'Managing a Business',
  supply_chain: 'Supply Chain/Inventory Management',
};

/**
 * Build a structured notes string from R4I-specific fields so the reviewer
 * can see everything in the NeoSerra client record at a glance.
 */
export function buildR4iNotes(d: Record<string, unknown>): string {
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

// ─── Intake payload ──────────────────────────────────────────

/**
 * Map R4I fields to an intake-compatible payload with all required fields.
 * `sendEmails` is always false — R4I sends its own emails on the public path,
 * and the inject tool must never email anyone.
 */
export function buildR4iIntakePayload(
  r4iData: Record<string, unknown>,
): Record<string, unknown> {
  // Map R4I referral source to NeoSerra reffrom code
  const r4iReferral = str(r4iData.referralSource);
  const neoReffrom = REFERRAL_TO_REFFROM[r4iReferral] || '';

  // Map R4I coaching interests + group courses to NeoSerra Step Two codes
  const stepTwoCodes = new Set<string>();
  for (const id of arr(r4iData.coachingInterests)) {
    if (COACHING_TO_STEP2[id]) stepTwoCodes.add(COACHING_TO_STEP2[id]);
  }
  for (const id of arr(r4iData.groupCourses)) {
    if (COURSE_TO_STEP2[id]) stepTwoCodes.add(COURSE_TO_STEP2[id]);
  }

  return {
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

    // Suppress backend emails — R4I sends its own (and inject sends none)
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
}

// ─── R4I PIN payload ─────────────────────────────────────────

export function buildR4iPinPayload(
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
    centerId: String(NEOSERRA_CENTER_ID),
    r4iadvising: advisingLabels,
    r4icourses: courseLabels,
    r4ichallenge: str(d.biggestChallenge),
  };
}

// ─── R4I PIN creation ────────────────────────────────────────

export interface PinPostResult {
  ok: boolean;
  status: number;
  body: Record<string, unknown> | null;
  /** true when NEOSERRA_BASE_URL / NEOSERRA_API_KEY are not configured */
  skipped?: boolean;
  error?: string;
}

/**
 * Post the R4I PIN form for an existing client. Never throws — callers
 * decide whether a failure is fatal (inject) or tolerable (public form).
 */
export async function postR4iPin(
  r4iData: Record<string, unknown>,
  clientId: string,
): Promise<PinPostResult> {
  const base = neoserraUrl();
  const key = neoserraKey();
  if (!base || !key) {
    return {
      ok: false,
      status: 0,
      body: null,
      skipped: true,
      error: 'NEOSERRA_BASE_URL or NEOSERRA_API_KEY not set',
    };
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

    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;

    if (!res.ok || (body && body.status === 'fail')) {
      return {
        ok: false,
        status: res.status,
        body,
        error: `PIN endpoint returned ${res.status}${body ? `: ${JSON.stringify(body)}` : ''}`,
      };
    }

    return { ok: true, status: res.status, body };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, body: null, error: `PIN request failed: ${reason}` };
  }
}

// ─── Inject runner (admin tool) ──────────────────────────────

/**
 * Intake succeeded but the PIN step failed. Carries the new client ID so
 * the UI can offer "Run PIN" against it instead of creating a duplicate.
 */
export class PinAfterIntakeError extends Error {
  clientId: string;
  intakeResult: Record<string, unknown> | null;
  pinResponse: Record<string, unknown> | null;
  status: number;

  constructor(
    message: string,
    opts: {
      clientId: string;
      intakeResult: Record<string, unknown> | null;
      pinResponse: Record<string, unknown> | null;
      status: number;
    },
  ) {
    super(message);
    this.name = 'PinAfterIntakeError';
    this.clientId = opts.clientId;
    this.intakeResult = opts.intakeResult;
    this.pinResponse = opts.pinResponse;
    this.status = opts.status;
  }
}

export interface InjectResult {
  clientId: string;
  intakeResult: Record<string, unknown> | null;
  pinResult: Record<string, unknown> | null;
  pinOnly: boolean;
}

/**
 * Back-office injection of an R4I record. No emails are ever sent.
 *
 * - existingClientId set → PIN-only mode: post just the R4I PIN form.
 * - otherwise → create the client via intake, then post the PIN form.
 *
 * Throws PinAfterIntakeError when intake succeeded but the PIN step failed,
 * and plain Error for everything else.
 */
export async function injectR4iRecord(
  r4iData: Record<string, unknown>,
  opts: { existingClientId?: string } = {},
): Promise<InjectResult> {
  const existingClientId = (opts.existingClientId || '').trim();

  // ── PIN-only mode ──
  if (existingClientId) {
    const pin = await postR4iPin(r4iData, existingClientId);
    if (!pin.ok) {
      throw new Error(pin.error || 'PIN creation failed');
    }
    return {
      clientId: existingClientId,
      intakeResult: null,
      pinResult: pin.body,
      pinOnly: true,
    };
  }

  // ── Step 1: create client via backend intake ──
  const intakePayload = buildR4iIntakePayload(r4iData);

  let intakeResult: Record<string, unknown>;
  try {
    const res = await fetch(`${backendUrl()}/api/intake/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intakePayload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      throw new Error(`Intake backend returned ${res.status}: ${text}`);
    }

    intakeResult = (await res.json()) as Record<string, unknown>;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Intake backend returned')) {
      throw err;
    }
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`Intake backend unreachable: ${reason}`);
  }

  const neoserraResult = intakeResult?.neoserraResult as Record<string, unknown> | undefined;
  const clientId = String(neoserraResult?.id ?? intakeResult?.id ?? '0');

  if (!clientId || clientId === '0') {
    throw new Error(
      `Intake succeeded but no client ID was returned — check the record in NeoSerra before retrying. Intake response: ${JSON.stringify(intakeResult)}`,
    );
  }

  // ── Step 2: PIN form ──
  const pin = await postR4iPin(r4iData, clientId);
  if (!pin.ok) {
    throw new PinAfterIntakeError(
      pin.error || 'PIN creation failed after intake',
      {
        clientId,
        intakeResult,
        pinResponse: pin.body,
        status: pin.status,
      },
    );
  }

  return { clientId, intakeResult, pinResult: pin.body, pinOnly: false };
}
