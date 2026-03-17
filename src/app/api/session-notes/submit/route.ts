/**
 * Session Notes submission route.
 *
 * Accepts JSON with session note data and creates a counseling
 * record in NeoSerra via the REST API.
 *
 * All mandatory NeoSerra counseling fields are included:
 * contact (duration), date, type, contactType, sbaArea, text,
 * fundarea, centerId, nbrpeople, clients, counselors
 *
 * Payload format matches official Neoserra API examples:
 * - clients/contacts are plain strings (not arrays)
 * - counselors is an array of {counselor, prep, travel} objects
 * - duration field is "contact" in decimal hours (e.g. "1.0")
 * - POST URL ends with /new
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function neoserraUrl(): string {
  return (process.env.NEOSERRA_BASE_URL || '').replace(/\/+$/, '');
}

function neoserraKey(): string {
  return process.env.NEOSERRA_API_KEY || '';
}

/** Convert minutes (number) to decimal hours string for NeoSerra (e.g. 90 → "1.5"). */
function formatDuration(minutes: number): string {
  const hours = minutes / 60;
  return hours.toFixed(1);
}

/** Strip control characters that NeoSerra's parser may reject. Keeps \n and \t. */
function sanitize(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/** Ensure a client↔contact relationship exists in NeoSerra before creating counseling records. */
async function ensureRelationship(
  base: string,
  key: string,
  clientId: string,
  contactId: string,
): Promise<{ ok: boolean; status: number; body: unknown; error?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const url = `${base}/api/v1/relationships/${encodeURIComponent(clientId)}/${encodeURIComponent(contactId)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, body: null, error: msg };
  }
}

interface SubmitPayload {
  // Client / contact linkage
  clientId: string;
  contactId?: string;
  counselorId?: string;
  centerId?: string;

  // Mandatory NeoSerra fields
  subject: string;          // → text
  memo: string;             // → memo (session notes)
  sessionDate: string;      // → date
  contactDuration: number;  // → contactDuration (minutes)
  sessionType: string;      // → type (I/F/A)
  contactType: string;      // → contactType (ON/AT/EM/PH/VC)
  counselingArea: string;   // → sbaArea
  fundingSource: string;    // → fundarea
  nbrPeople: number;        // → nbrpeople

  // Optional
  prepTimeMinutes?: number;
  language?: string;
}

export async function POST(req: NextRequest): Promise<Response> {
  let payload: SubmitPayload;

  try {
    payload = await req.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  // Validate required fields
  const missing: string[] = [];
  if (!payload.clientId?.trim()) missing.push('clientId');
  if (!payload.subject?.trim()) missing.push('subject');
  if (!payload.memo?.trim()) missing.push('memo');
  if (!payload.sessionDate) missing.push('sessionDate');
  if (!payload.contactDuration) missing.push('contactDuration');
  if (!payload.sessionType) missing.push('sessionType');
  if (!payload.contactType) missing.push('contactType');
  if (!payload.counselingArea) missing.push('counselingArea');
  if (!payload.fundingSource) missing.push('fundingSource');

  if (missing.length > 0) {
    return Response.json(
      { success: false, error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 },
    );
  }

  const base = neoserraUrl();
  const key = neoserraKey();
  if (!base || !key) {
    return Response.json(
      { success: false, error: 'NeoSerra API not configured (missing NEOSERRA_BASE_URL or NEOSERRA_API_KEY)' },
      { status: 503 },
    );
  }

  // Build NeoSerra counseling payload matching official API examples:
  // - clients/contacts are plain strings (not arrays)
  // - counselors is an array of objects with counselor/prep/travel
  // - duration field is "contact" (not "contactDuration"), decimal hours
  // - URL must end with /new
  const prepHours = payload.prepTimeMinutes ? (payload.prepTimeMinutes / 60).toFixed(1) : '0';

  const counselingPayload: Record<string, unknown> = {
    clients: payload.clientId,
    contacts: payload.contactId || undefined,
    counselors: payload.counselorId
      ? [{ counselor: payload.counselorId, prep: prepHours, travel: '0' }]
      : undefined,

    // Mandatory fields
    contact: formatDuration(payload.contactDuration),
    date: payload.sessionDate,
    type: payload.sessionType,
    contactType: payload.contactType,
    sbaArea: payload.counselingArea,
    text: sanitize(payload.subject.trim()),
    fundarea: payload.fundingSource,
    centerId: payload.centerId || undefined,
    nbrpeople: String(payload.nbrPeople || 1),
    memo: sanitize(payload.memo.trim()),
    isReportable: 'true',

    // Optional
    language: payload.language || 'EN',
    covid19: 'false',
  };

  // Remove undefined values
  for (const k of Object.keys(counselingPayload)) {
    if (counselingPayload[k] === undefined) delete counselingPayload[k];
  }

  // Ensure client↔contact relationship exists before creating counseling record
  let relationshipWarning: string | undefined;
  if (payload.contactId?.trim()) {
    const rel = await ensureRelationship(base, key, payload.clientId, payload.contactId);
    if (rel.ok) {
      console.log(`[session-notes/submit:relationship] Linked client ${payload.clientId} ↔ contact ${payload.contactId} (${rel.status})`);
    } else {
      relationshipWarning = `Relationship linkage returned ${rel.status}: ${rel.error || JSON.stringify(rel.body)}`;
      console.warn(`[session-notes/submit:relationship] ${relationshipWarning}`);
    }
  }

  const counselingUrl = `${base}/api/v1/counseling/new`;
  console.log('[session-notes/submit] POST', counselingUrl, JSON.stringify(counselingPayload));

  // 30-second timeout — Neoserra sometimes hangs without responding
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(counselingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify(counselingPayload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const body = await res.json().catch(() => null);
    console.log(`[session-notes/submit] NeoSerra responded ${res.status}:`, JSON.stringify(body));

    if (!res.ok || (body && body.status === 'fail')) {
      return Response.json(
        {
          success: false,
          error: body?.message || body?.exception || body?.error || `NeoSerra returned ${res.status}`,
          neoserraResponse: body,
          sentPayload: counselingPayload,
          ...(relationshipWarning ? { relationshipWarning } : {}),
        },
        { status: 502 },
      );
    }

    return Response.json({
      success: true,
      counselingId: body?.id || body?.counselingId,
      neoserraResponse: body,
      ...(relationshipWarning ? { relationshipWarning } : {}),
    });
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = err instanceof DOMException && err.name === 'AbortError';
    const reason = isTimeout
      ? 'Request timed out after 30s — NeoSerra did not respond'
      : (err instanceof Error ? err.message : String(err));
    console.warn(`[session-notes/submit] fetch failed for ${counselingUrl}: ${reason}`);
    return Response.json(
      { success: false, error: `Failed to reach NeoSerra: ${reason}`, ...(relationshipWarning ? { relationshipWarning } : {}) },
      { status: 502 },
    );
  }
}
