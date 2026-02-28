/**
 * TFG Application submission route.
 *
 * Accepts multipart/form-data with:
 *   - `data`      — JSON string of all TFG application fields
 *   - `pitchDeck` — optional file upload
 *
 * Flow:
 *   1. Create client via backend's /api/intake/submit
 *   2. Populate the TFG Application 2026 PIN form via Neoserra REST API
 *   3. Upload pitch deck to Google Drive (if present)
 *   4. Persist application JSON to disk
 *   5. Send notification emails via Resend (fire-and-forget)
 */

import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { uploadPitchDeck } from '@/lib/google-drive';
import { saveApplication } from '@/lib/tfg-storage';
import { buildClientConfirmationHtml } from '@/lib/emails/tfg-client-confirmation';
import {
  buildAdminNotificationHtml,
  TFG_ADMIN_RECIPIENTS,
} from '@/lib/emails/tfg-admin-notification';

export const dynamic = 'force-dynamic';

function backendUrl(): string {
  return (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
}

function neoserraUrl(): string {
  return (process.env.NEOSERRA_BASE_URL || '').replace(/\/+$/, '');
}

function neoserraKey(): string {
  return process.env.NEOSERRA_API_KEY || '';
}

// ─── Value translation maps ─────────────────────────────────
// Our form IDs → Neoserra coded values (only where they differ)

const SECTOR_MAP: Record<string, string> = {
  'SaaS_B2B': 'SaaS (B2B)',
  'SaaS_B2C': 'SaaS (B2C)',
  'Biotech': 'Biotech',
  'HealthTech': 'Health Tech/MedTech',
  'ClimateTech': 'Climate Tech',
  'FinTech': 'FinTech',
  'AgTech': 'AgTech',
  'Other': 'Other',
};

const REVENUE_MAP: Record<string, string> = {
  '0-0': 'Pre-Revenue',
  '1-1': 'Pilot Revenue',
  '2-2': 'Less thank $500K', // Neoserra typo — must match their code list exactly
  'under1mm': 'Less than $1M',
  'over1mm': 'Greater than $1M',
};

const SUPPORT_MAP: Record<string, string> = {
  'Go-to-Market': 'Go-to-Market',
  'Positioning / Marketing': 'Positioning/Marketing',
  'Investment Readiness': 'Investment Readiness',
  'Product Development': 'Product Development',
  'Business Development': 'Business Development',
  'Federal SBIR/STTR Funding': 'Federal SBIR/STTR Funding',
  'Other Federal Grants': 'Other Federal Grants & Contracts',
  'State Grants': 'State Grants',
  'Other': 'Other',
};

const REFERRAL_MAP: Record<string, string> = {
  'Accelerator': 'Accelerator',
  'Referral': 'Referreal', // Neoserra typo — must match their code list exactly
  'SBDC': 'SBDC',
  'Event': 'Event',
  'Investor': 'Investor',
  'Social Media': 'Social Media',
  'Other': 'Other',
};

// ─── PIN payload builder ─────────────────────────────────────

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function mapMulti(values: unknown, map: Record<string, string>): string {
  if (!Array.isArray(values)) return '';
  return values.map((v: string) => map[v] ?? v).join(',');
}

function formatTeam(members: unknown): string {
  if (!Array.isArray(members)) return '';
  return members
    .filter((m: { name?: string }) => m.name?.trim())
    .map((m: { name: string; linkedinUrl?: string }) =>
      m.linkedinUrl?.trim() ? `${m.name} — ${m.linkedinUrl}` : m.name,
    )
    .join('\n');
}

function formatAddress(d: Record<string, unknown>): string {
  const parts = [str(d.streetAddress), str(d.city), str(d.state), str(d.zipCode)];
  const street = parts[0];
  const cityStateZip = [parts[1], parts[2]].filter(Boolean).join(', ')
    + (parts[3] ? ` ${parts[3]}` : '');
  return [street, cityStateZip].filter(Boolean).join(', ');
}

function buildPinPayload(
  d: Record<string, unknown>,
  clientId: string,
): Record<string, unknown> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  return {
    clientId,
    date: today,
    centerId: '34',

    // Contact details
    tfgweb: str(d.website),
    firstname: str(d.firstName),
    lastname: str(d.lastName),
    tfgemail: str(d.email),
    tfgphone: str(d.phone),
    tfglinkedi: str(d.linkedin),
    contactaddress: formatAddress(d),
    stateofinc: str(d.stateOfIncorporation),

    // Industry
    industrysect: mapMulti(d.industrySectors, SECTOR_MAP),
    otherindustry: str(d.otherIndustry),

    // Vision & Product
    tfgvision: str(d.vision),
    tfgproblem: str(d.problem),
    tfgsolut: str(d.solution),

    // Market & Validation
    marketopp: str(d.marketOpportunity),
    icorpsstat: str(d.icorpsStatus),
    icorpsdet: str(d.icorpsDetails),
    cusdiscint: str(d.interviewStatus),
    numintcomp: parseInt(str(d.interviewCount), 10) || undefined,
    intlearn: str(d.interviewLearnings),
    icpidealcustomerprofile: str(d.idealCustomerProfile),

    // Traction & Revenue
    productstage: str(d.productStage),
    inmarkstat: str(d.inMarketStatus),
    revstage: REVENUE_MAP[str(d.revenueStage)] ?? str(d.revenueStage),
    sbirsttrstat: str(d.sbirStatus),
    keyachievement: str(d.recentAchievements),

    // Financing & Runway
    totalfundrec: str(d.totalFunding),
    recround: mapMulti(d.lastRound, {}), // values match exactly
    currentlyraisingcapital: str(d.raisingCapital),
    raisedetails: str(d.raiseDetails),
    runmonth: parseFloat(str(d.runwayMonths)) || undefined,

    // Team
    cofteam: formatTeam(d.teamMembers),
    teamfit: str(d.teamFit),
    timeproj: str(d.timeWorking),

    // Support & Referral
    suppneed: mapMulti(d.supportNeeds, SUPPORT_MAP),
    othsupp: str(d.otherSupport),
    referral: REFERRAL_MAP[str(d.referralSource)] ?? str(d.referralSource),
    referrer: str(d.referrerName),

    // Signature & Score
    digitalsignature: str(d.signature),
    readiscore: typeof d.readinessScore === 'number' ? d.readinessScore : undefined,
  };
}

// ─── Neoserra PIN creation ───────────────────────────────────

async function createPin(
  tfgData: Record<string, unknown>,
  clientId: string,
): Promise<Record<string, unknown>> {
  const base = neoserraUrl();
  const key = neoserraKey();
  if (!base || !key) {
    console.warn('[tfg/submit] NEOSERRA_BASE_URL or NEOSERRA_API_KEY not set; skipping PIN creation');
    return { _pinStatus: 'skipped', reason: 'missing_env', baseSet: !!base, keySet: !!key };
  }

  const payload = buildPinPayload(tfgData, clientId);
  const url = `${base}/api/v1/tfg2026/new`;

  console.log(`[tfg/submit] Creating PIN for clientId=${clientId} → POST ${url}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `apikey ${key}`,
      },
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    let body: Record<string, unknown> | null = null;
    try {
      body = JSON.parse(rawText);
    } catch {
      // Response was not JSON
    }

    if (!res.ok || (body && body.status === 'fail')) {
      console.warn(`[tfg/submit] PIN creation failed (HTTP ${res.status}):`, rawText.slice(0, 500));
      return {
        _pinStatus: 'http_error',
        httpStatus: res.status,
        statusText: res.statusText,
        body: body ?? rawText.slice(0, 300),
        url,
      };
    }

    console.log(`[tfg/submit] PIN created successfully:`, JSON.stringify(body));
    return { _pinStatus: 'ok', ...(body ?? {}) };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[tfg/submit] PIN creation error: ${reason}`);
    return { _pinStatus: 'fetch_error', error: reason, url };
  }
}

// ─── Main handler ────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<Response> {
  let tfgData: Record<string, unknown>;
  let pitchDeckFile: File | null = null;

  try {
    const fd = await req.formData();
    const raw = fd.get('data');
    if (!raw || typeof raw !== 'string') {
      return Response.json(
        { success: false, error: 'Missing "data" field' },
        { status: 400 },
      );
    }
    tfgData = JSON.parse(raw);

    // Extract pitch deck file (if present)
    const deck = fd.get('pitchDeck');
    if (deck && deck instanceof File && deck.size > 0) {
      pitchDeckFile = deck;
    }
  } catch {
    return Response.json(
      { success: false, error: 'Invalid form data' },
      { status: 400 },
    );
  }

  // Map TFG fields to intake-compatible payload
  const intakePayload = {
    // Shared contact fields
    firstName: tfgData.firstName ?? '',
    lastName: tfgData.lastName ?? '',
    email: tfgData.email ?? '',
    phone: tfgData.phone ?? '',
    streetAddress: tfgData.streetAddress ?? '',
    city: tfgData.city ?? '',
    state: tfgData.state ?? 'CA',
    zipCode: tfgData.zipCode ?? '',

    // Company
    companyName: tfgData.companyName ?? '',
    website: tfgData.website ?? '',
    businessStatus: 'B', // TFG applicants are in-business startups
    businessDescription: tfgData.vision ?? '',

    // Signature
    signature: tfgData.signature ?? '',
    privacyRelease: 'Yes',

    // Flag as TFG application
    programSignup: 'tfg',
    specialPrograms: ['tfg'],

    // Defaults for required intake fields
    goals: [],
    gender: '',
    ethnicity: '',
    hispanic: '',
    veteran: '',
    education: '',
    language: '',
    referral: '',       // Don't send — TFG values aren't valid Neoserra reffrom codes
    referralOther: '',  // Referral info preserved in tfgData bundle below
    newsletter: '',
    centerId: 107,

    // Bundle all TFG-specific data for backend passthrough to Neoserra
    tfgData: {
      linkedin: tfgData.linkedin,
      stateOfIncorporation: tfgData.stateOfIncorporation,
      industrySectors: tfgData.industrySectors,
      otherIndustry: tfgData.otherIndustry,
      vision: tfgData.vision,
      problem: tfgData.problem,
      solution: tfgData.solution,
      marketOpportunity: tfgData.marketOpportunity,
      icorpsStatus: tfgData.icorpsStatus,
      icorpsDetails: tfgData.icorpsDetails,
      interviewStatus: tfgData.interviewStatus,
      interviewCount: tfgData.interviewCount,
      interviewLearnings: tfgData.interviewLearnings,
      idealCustomerProfile: tfgData.idealCustomerProfile,
      productStage: tfgData.productStage,
      inMarketStatus: tfgData.inMarketStatus,
      revenueStage: tfgData.revenueStage,
      sbirStatus: tfgData.sbirStatus,
      recentAchievements: tfgData.recentAchievements,
      totalFunding: tfgData.totalFunding,
      lastRound: tfgData.lastRound,
      raisingCapital: tfgData.raisingCapital,
      raiseDetails: tfgData.raiseDetails,
      runwayMonths: tfgData.runwayMonths,
      teamMembers: tfgData.teamMembers,
      teamFit: tfgData.teamFit,
      timeWorking: tfgData.timeWorking,
      supportNeeds: tfgData.supportNeeds,
      otherSupport: tfgData.otherSupport,
      referralSource: tfgData.referralSource,
      referrerName: tfgData.referrerName,
      pitchDeckFileName: tfgData.pitchDeckFileName,
      readinessScore: tfgData.readinessScore,
    },
  };

  // Step 1: Create client via backend intake endpoint
  let intakeResult: Record<string, unknown> | null = null;
  let backendOk = false;

  try {
    const res = await fetch(`${backendUrl()}/api/intake/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intakePayload),
    });

    backendOk = res.ok;

    // Always try to parse response — even non-OK responses may contain the client ID
    const body = await res.json().catch(() => null);
    intakeResult = body;

    if (!res.ok) {
      console.warn(`[tfg/submit] Backend returned ${res.status}:`, JSON.stringify(body));
    } else {
      console.log(`[tfg/submit] Backend response:`, JSON.stringify(body));
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[tfg/submit] Backend unreachable (${reason}); using success stub`);
    return Response.json({ success: true, neoserraResult: { stub: true } });
  }

  // Step 2: Populate TFG Application 2026 PIN form directly via Neoserra API
  //
  // Extract clientId from whichever shape the backend returns:
  //   - intakeResult.neoserraResult.id  (standard intake path)
  //   - intakeResult.id                 (fallback / direct Neoserra shape)
  const neoserraResult = (intakeResult as Record<string, unknown>)?.neoserraResult as Record<string, unknown> | undefined;
  const clientId = String(
    neoserraResult?.id ?? (intakeResult as Record<string, unknown>)?.id ?? '0',
  );

  console.log(`[tfg/submit] Extracted clientId=${clientId} (backendOk=${backendOk}, neoserraResult=${JSON.stringify(neoserraResult)})`);

  let pinResult: Record<string, unknown> | null = null;
  if (clientId && clientId !== '0') {
    pinResult = await createPin(tfgData, clientId);
  } else {
    pinResult = { _pinStatus: 'skipped', reason: 'no_clientId', clientId };
    console.warn('[tfg/submit] No valid clientId from intake — skipping PIN creation. Full intakeResult:', JSON.stringify(intakeResult));
  }

  // ── Step 3: Upload pitch deck to Google Drive ───────────────
  let pitchDeckUrl: string | null = null;
  const pitchDeckFileName = str(tfgData.pitchDeckFileName) || pitchDeckFile?.name || null;

  if (pitchDeckFile) {
    try {
      const buffer = Buffer.from(await pitchDeckFile.arrayBuffer());
      const result = await uploadPitchDeck(pitchDeckFile.name, buffer, pitchDeckFile.type || 'application/octet-stream');
      if (result) {
        pitchDeckUrl = result.webViewLink;
        console.log(`[tfg/submit] Pitch deck uploaded to Drive: ${pitchDeckUrl}`);
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(`[tfg/submit] Pitch deck upload failed: ${reason}`);
    }
  }

  // ── Step 4: Persist application data ──────────────────────
  const applicationId = crypto.randomUUID();

  try {
    await saveApplication(applicationId, tfgData, pitchDeckUrl, pitchDeckFileName, clientId !== '0' ? clientId : null);
    console.log(`[tfg/submit] Application saved: ${applicationId}`);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[tfg/submit] Failed to save application: ${reason}`);
  }

  // ── Step 5: Send notification emails (fire-and-forget) ────
  const resendKey = process.env.RESEND_API_KEY;
  const appUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
  const onePagerUrl = appUrl ? `${appUrl}/api/tfg/applications/${applicationId}` : '';

  const emailDebug: Record<string, unknown> = {
    resendKeySet: !!resendKey,
    appUrl: appUrl || '(not set)',
    onePagerUrl: onePagerUrl || '(not set)',
    clientEmail: str(tfgData.email) || '(empty)',
    fromAddress: process.env.RESEND_FROM || 'Tech Futures Group <onboarding@resend.dev>',
  };

  if (resendKey) {
    const resend = new Resend(resendKey);
    const from = process.env.RESEND_FROM || 'Tech Futures Group <onboarding@resend.dev>';

    // Build batch of emails to send in a single API call (avoids rate-limiting
    // when the Python backend also sends emails using the same Resend key).
    const batch: { from: string; to: string[]; subject: string; html: string }[] = [];

    // Client confirmation email (NO score)
    if (str(tfgData.email)) {
      emailDebug.clientEmailAttempted = true;
      batch.push({
        from,
        to: [str(tfgData.email)],
        subject: "You're in.",
        html: buildClientConfirmationHtml({
          firstName: str(tfgData.firstName),
          companyName: str(tfgData.companyName),
        }),
      });
    }

    // Admin notification email
    if (onePagerUrl) {
      emailDebug.adminEmailAttempted = true;
      emailDebug.adminRecipients = TFG_ADMIN_RECIPIENTS;
      batch.push({
        from,
        to: TFG_ADMIN_RECIPIENTS,
        subject: `[TFG] New Application: ${str(tfgData.companyName)}`,
        html: buildAdminNotificationHtml({
          firstName: str(tfgData.firstName),
          lastName: str(tfgData.lastName),
          companyName: str(tfgData.companyName),
          email: str(tfgData.email),
          phone: str(tfgData.phone),
          website: str(tfgData.website),
          industrySectors: Array.isArray(tfgData.industrySectors) ? tfgData.industrySectors as string[] : [],
          productStage: str(tfgData.productStage),
          revenueStage: str(tfgData.revenueStage),
          readinessScore: typeof tfgData.readinessScore === 'number' ? tfgData.readinessScore : 0,
          onePagerUrl,
          pitchDeckUrl,
        }),
      });
    }

    // Send all emails in one API call to avoid 429 rate-limit errors
    if (batch.length > 0) {
      emailDebug.batchSize = batch.length;
      resend.batch.send(batch).catch((err) => console.warn('[tfg/submit] Batch email failed:', err));
    }
  } else {
    emailDebug.skipped = 'RESEND_API_KEY not set';
    console.warn('[tfg/submit] RESEND_API_KEY not set; skipping emails');
  }

  return Response.json({
    success: (intakeResult as Record<string, unknown>)?.success ?? true,
    neoserraResult: neoserraResult ?? intakeResult,
    pinResult: pinResult ?? undefined,
    applicationId,
    // Temporary debug — remove after confirming full pipeline works
    _debug: {
      backendOk,
      backendStatus: intakeResult ? 'parsed' : 'null',
      clientId,
      pinResult,
      emailDebug,
      neoserraBaseSet: !!neoserraUrl(),
      neoserraKeySet: !!neoserraKey(),
      intakeResultKeys: intakeResult ? Object.keys(intakeResult) : [],
      rawNeoserraResult: neoserraResult ?? null,
    },
  });
}
