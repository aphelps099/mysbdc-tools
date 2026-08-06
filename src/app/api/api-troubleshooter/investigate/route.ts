/**
 * API Troubleshooter — investigate endpoint.
 *
 * OBSERVE-ONLY: this route performs GET requests against Neoserra and
 * nothing else. It never writes to Neoserra, WordPress, Gravity Forms,
 * or any shared store, and it persists nothing.
 *
 * POST body — one of:
 *   { notificationText: string }                       → parse + verify
 *   { email?, businessId?, contactId? }                → live lookup
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseNotification, looksLikeNotification } from '@/lib/api-troubleshooter/parse-notification';
import {
  neoserraConfigured,
  probeContactByEmail,
  probeContactById,
  probeClientById,
  probeMilestonesForClient,
} from '@/lib/api-troubleshooter/neoserra-read';
import { diagnoseSubmission, diagnoseLookup } from '@/lib/api-troubleshooter/diagnose';
import type { InvestigateResponse, NeoserraFindings } from '@/lib/api-troubleshooter/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: {
    notificationText?: string;
    email?: string;
    businessId?: string;
    contactId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const configured = neoserraConfigured();
  const neo: NeoserraFindings = { configured, contact: null, client: null, milestones: null };

  // ── Mode 1: pasted notification email ──
  if (body.notificationText?.trim()) {
    if (!looksLikeNotification(body.notificationText)) {
      return NextResponse.json(
        { error: 'That text doesn’t look like a milestone notification email. Paste the full body of a "New milestone submission … Step 2" email (HTML source or copied text).' },
        { status: 422 },
      );
    }
    const parsed = parseNotification(body.notificationText);

    if (configured) {
      if (parsed.businessId) {
        [neo.client, neo.milestones] = await Promise.all([
          probeClientById(parsed.businessId),
          probeMilestonesForClient(parsed.businessId),
        ]);
      }
      if (parsed.contactEmail) {
        neo.contact = await probeContactByEmail(parsed.contactEmail);
      }
    }

    const response: InvestigateResponse = {
      parsed,
      neoserra: neo,
      diagnosis: diagnoseSubmission(parsed, neo),
    };
    return NextResponse.json(response);
  }

  // ── Mode 2: live lookup ──
  const email = body.email?.trim();
  const businessId = body.businessId?.trim();
  const contactId = body.contactId?.trim();
  if (!email && !businessId && !contactId) {
    return NextResponse.json(
      { error: 'Provide an email, business ID, or contact ID — or paste a notification email.' },
      { status: 400 },
    );
  }

  if (configured) {
    const tasks: Promise<void>[] = [];
    if (email) tasks.push(probeContactByEmail(email).then((r) => void (neo.contact = r)));
    if (contactId) tasks.push(probeContactById(contactId).then((r) => void (neo.contact = r)));
    if (businessId) {
      tasks.push(probeClientById(businessId).then((r) => void (neo.client = r)));
      tasks.push(probeMilestonesForClient(businessId).then((r) => void (neo.milestones = r)));
    }
    await Promise.all(tasks);
  }

  const response: InvestigateResponse = {
    parsed: null,
    neoserra: neo,
    diagnosis: diagnoseLookup({ email, businessId, contactId }, neo),
  };
  return NextResponse.json(response);
}
