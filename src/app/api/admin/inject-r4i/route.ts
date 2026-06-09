/**
 * POST /api/admin/inject-r4i — back-office injection of R4I applications.
 *
 * Body:
 *   {
 *     "data": { ...R4I form fields },
 *     "dryRun": false,          // preview payloads without sending
 *     "clientId": "426342"      // optional → PIN-only mode (skip intake)
 *   }
 *
 * No emails are ever sent from this route — the intake payload sets
 * sendEmails: false and the Resend steps of the public route are not run.
 *
 * Partial failure (intake succeeded, PIN failed) returns HTTP 502 with
 * { partial: true, clientId } so the UI can pre-fill the Existing Client ID
 * field and retry just the PIN step — never creating a duplicate client.
 */

import { NextRequest } from 'next/server';
import {
  buildR4iIntakePayload,
  buildR4iPinPayload,
  injectR4iRecord,
  PinAfterIntakeError,
} from '@/lib/r4i-neoserra';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const data = body.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return Response.json(
      { success: false, error: 'Missing "data" object with the R4I form fields' },
      { status: 400 },
    );
  }

  const r4iData = data as Record<string, unknown>;
  const dryRun = body.dryRun === true;
  const clientId = typeof body.clientId === 'string' ? body.clientId.trim() : '';

  if (dryRun) {
    return Response.json({
      success: true,
      dryRun: true,
      pinOnly: Boolean(clientId),
      intakePayload: clientId ? null : buildR4iIntakePayload(r4iData),
      pinPayload: buildR4iPinPayload(r4iData, clientId || 'PENDING'),
    });
  }

  try {
    const result = await injectR4iRecord(r4iData, { existingClientId: clientId });
    return Response.json({
      success: true,
      clientId: result.clientId,
      pinOnly: result.pinOnly,
      intakeResult: result.intakeResult,
      pinResult: result.pinResult,
    });
  } catch (err) {
    if (err instanceof PinAfterIntakeError) {
      console.warn(`[inject-r4i] Partial: client ${err.clientId} created, PIN failed: ${err.message}`);
      return Response.json(
        {
          success: false,
          partial: true,
          clientId: err.clientId,
          error: `Client ${err.clientId} was created, but the R4I PIN step failed: ${err.message}`,
          intakeResult: err.intakeResult,
          pinResponse: err.pinResponse,
        },
        { status: 502 },
      );
    }

    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[inject-r4i] Failed: ${reason}`);
    return Response.json(
      { success: false, error: reason },
      { status: 502 },
    );
  }
}
