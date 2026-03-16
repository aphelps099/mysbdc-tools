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

  try {
    const res = await fetch(`${base}/api/v1/counseling/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify(counselingPayload),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok || (body && body.status === 'fail')) {
      console.warn('[session-notes/submit] NeoSerra counseling creation failed:', JSON.stringify(body));
      return Response.json(
        {
          success: false,
          error: body?.message || body?.error || `NeoSerra returned ${res.status}`,
          neoserraResponse: body,
        },
        { status: 502 },
      );
    }

    console.log('[session-notes/submit] Counseling record created:', JSON.stringify(body));
    return Response.json({
      success: true,
      counselingId: body?.id || body?.counselingId,
      neoserraResponse: body,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[session-notes/submit] NeoSerra request error: ${reason}`);
    return Response.json(
      { success: false, error: `Failed to reach NeoSerra: ${reason}` },
      { status: 502 },
    );
  }
}
