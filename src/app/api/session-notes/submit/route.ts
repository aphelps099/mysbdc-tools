/**
 * Session Notes submission route.
 *
 * Accepts JSON with session note data and creates a counseling
 * record in NeoSerra via the REST API.
 *
 * All mandatory NeoSerra counseling fields are included:
 * contactDuration, date, type, contactType, sbaArea, text,
 * fundarea, centerId, nbrpeople, clients, contacts, counselors
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function neoserraUrl(): string {
  return (process.env.NEOSERRA_BASE_URL || '').replace(/\/+$/, '');
}

function neoserraKey(): string {
  return process.env.NEOSERRA_API_KEY || '';
}

/** Convert minutes (number) to "H:MM" duration string for NeoSerra. */
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/** Ensure a client↔contact relationship exists in NeoSerra before creating counseling records. */
async function ensureRelationship(
  base: string,
  key: string,
  clientId: string,
  contactId: string,
): Promise<{ ok: boolean; status: number; body: unknown; error?: string }> {
  try {
    const url = `${base}/api/v1/relationships/${encodeURIComponent(clientId)}/${encodeURIComponent(contactId)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({}),
    });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
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

  // Build NeoSerra counseling payload with all mandatory fields
  // Note: clients, contacts, counselors are "List" types — pass as arrays
  const counselingPayload: Record<string, unknown> = {
    // Client / contact / counselor linkage (array format for List types)
    clients: [payload.clientId],
    contacts: payload.contactId ? [payload.contactId] : undefined,
    counselors: payload.counselorId ? [payload.counselorId] : undefined,

    // Mandatory fields
    text: payload.subject.trim(),
    memo: payload.memo.trim(),
    date: payload.sessionDate,
    contactDuration: formatDuration(payload.contactDuration),
    type: payload.sessionType,
    contactType: payload.contactType,
    sbaArea: payload.counselingArea,
    fundarea: payload.fundingSource,
    centerId: payload.centerId || undefined,
    nbrpeople: payload.nbrPeople || 1,

    // Optional
    language: payload.language || 'EN',
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

  const counselingUrl = `${base}/api/v1/counseling/`;
  console.log('[session-notes/submit] POST', counselingUrl, JSON.stringify(counselingPayload));

  try {
    const res = await fetch(counselingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify(counselingPayload),
    });

    const body = await res.json().catch(() => null);
    console.log(`[session-notes/submit] NeoSerra responded ${res.status}:`, JSON.stringify(body));

    if (!res.ok || (body && body.status === 'fail')) {
      return Response.json(
        {
          success: false,
          error: body?.message || body?.error || `NeoSerra returned ${res.status}`,
          neoserraResponse: body,
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
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[session-notes/submit] fetch failed for ${counselingUrl}: ${reason}`);
    return Response.json(
      { success: false, error: `Failed to reach NeoSerra: ${reason}`, ...(relationshipWarning ? { relationshipWarning } : {}) },
      { status: 502 },
    );
  }
}
