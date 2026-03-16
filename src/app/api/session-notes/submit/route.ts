/**
 * Session Notes submission route.
 *
 * Accepts JSON with session note data and creates a counseling
 * record in NeoSerra via the REST API.
 *
 * POST /api/session-notes/submit
 * Body: { clientId, subject, memo, sessionDate, durationMinutes, prepTimeMinutes, counselorId?, centerId? }
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function neoserraUrl(): string {
  return (process.env.NEOSERRA_BASE_URL || '').replace(/\/+$/, '');
}

function neoserraKey(): string {
  return process.env.NEOSERRA_API_KEY || '';
}

interface SubmitPayload {
  clientId: string;
  subject: string;
  memo: string;
  sessionDate: string;
  durationMinutes: number;
  prepTimeMinutes: number;
  counselorId?: string;
  centerId?: string;
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
  if (!payload.clientId?.trim()) {
    return Response.json(
      { success: false, error: 'clientId is required' },
      { status: 400 },
    );
  }
  if (!payload.subject?.trim()) {
    return Response.json(
      { success: false, error: 'subject is required' },
      { status: 400 },
    );
  }
  if (!payload.memo?.trim()) {
    return Response.json(
      { success: false, error: 'memo (session notes) is required' },
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

  // Build NeoSerra counseling payload
  const counselingPayload: Record<string, unknown> = {
    clientId: payload.clientId,
    text: payload.subject.trim(),
    memo: payload.memo.trim(),
    date: payload.sessionDate || new Date().toISOString().split('T')[0],
  };

  if (payload.durationMinutes) {
    counselingPayload.duration = payload.durationMinutes;
  }
  if (payload.prepTimeMinutes) {
    counselingPayload.prepTime = payload.prepTimeMinutes;
  }
  if (payload.counselorId) {
    counselingPayload.counselorId = payload.counselorId;
  }
  if (payload.centerId) {
    counselingPayload.centerId = payload.centerId;
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
