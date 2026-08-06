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
  probeClientsForContact,
  extractClientIds,
  extractContactIds,
} from '@/lib/api-troubleshooter/neoserra-read';
import { diagnoseSubmission, diagnoseLookup } from '@/lib/api-troubleshooter/diagnose';
import { fetchStep2Entries, gfConfigured } from '@/lib/api-troubleshooter/gravity-forms';
import type { GfFindings } from '@/lib/api-troubleshooter/gravity-forms';
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

    let wordpress: GfFindings | null = null;
    const tasks: Promise<void>[] = [];
    if (configured && parsed.businessId) {
      tasks.push(probeClientById(parsed.businessId).then((r) => void (neo.client = r)));
      tasks.push(probeMilestonesForClient(parsed.businessId).then((r) => void (neo.milestones = r)));
    }
    if (configured && parsed.contactEmail) {
      tasks.push(probeContactByEmail(parsed.contactEmail).then((r) => void (neo.contact = r)));
    }
    if (gfConfigured() && (parsed.businessId || parsed.contactEmail)) {
      tasks.push(
        fetchStep2Entries({
          businessId: parsed.businessId ?? undefined,
          email: parsed.businessId ? undefined : parsed.contactEmail ?? undefined,
          pageSize: 5,
        }).then((r) => void (wordpress = r)),
      );
    }
    await Promise.all(tasks);

    const response: InvestigateResponse = {
      parsed,
      neoserra: neo,
      wordpress,
      diagnosis: diagnoseSubmission(parsed, neo, wordpress ?? undefined),
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

  let wordpress: GfFindings | null = null;
  const tasks: Promise<void>[] = [];
  if (configured) {
    if (email) tasks.push(probeContactByEmail(email).then((r) => void (neo.contact = r)));
    if (contactId) tasks.push(probeContactById(contactId).then((r) => void (neo.contact = r)));
    if (businessId) {
      tasks.push(probeClientById(businessId).then((r) => void (neo.client = r)));
      tasks.push(probeMilestonesForClient(businessId).then((r) => void (neo.milestones = r)));
    }
  }
  if (gfConfigured() && (email || businessId)) {
    tasks.push(
      fetchStep2Entries({ email, businessId, pageSize: 10 }).then((r) => void (wordpress = r)),
    );
  }
  await Promise.all(tasks);

  // Chain: an email/contact lookup that found a contact but was given no
  // business ID continues to that contact's linked client(s) + milestones.
  if (configured && !businessId && neo.contact?.found) {
    let clientIds = extractClientIds(neo.contact.data);
    // The contact SEARCH returns bare rows (indivId/first/last/fkey) with no
    // client links — fetch the full contact/relationships to find them.
    if (!clientIds.length) {
      const cid = contactId || extractContactIds(neo.contact.data)[0];
      if (cid) {
        const full = await probeClientsForContact(cid);
        neo.contact = {
          ...neo.contact,
          attempts: [...neo.contact.attempts, ...full.attempts],
          data: full.found ? full.data : neo.contact.data,
        };
        if (full.found) clientIds = extractClientIds(full.data);
      }
    }
    neo.linkedClientIds = clientIds;
    for (const id of clientIds.slice(0, 3)) {
      const milestones = await probeMilestonesForClient(id);
      if (!neo.milestones || (!neo.milestones.found && milestones.found)) {
        neo.milestones = milestones;
      }
      if (milestones.found) {
        neo.client = await probeClientById(id);
        break;
      }
    }
  }

  // A matched GF entry carries the Neoserra client ID the client submitted
  // under — use it when the contact record didn't yield one.
  // (assertion: TS can't see the Promise.all closure assignment above)
  const wpFound = wordpress as GfFindings | null;
  if (configured && !businessId && !(neo.linkedClientIds?.length)) {
    const gfBiz = wpFound?.entries.map((e) => e.businessId).find(Boolean);
    if (gfBiz) {
      neo.linkedClientIds = [gfBiz];
      const milestones = await probeMilestonesForClient(gfBiz);
      if (!neo.milestones || (!neo.milestones.found && milestones.found)) {
        neo.milestones = milestones;
      }
      if (!neo.client) neo.client = await probeClientById(gfBiz);
    }
  }

  const response: InvestigateResponse = {
    parsed: null,
    neoserra: neo,
    wordpress,
    diagnosis: diagnoseLookup({ email, businessId, contactId }, neo, wordpress ?? undefined),
  };
  return NextResponse.json(response);
}
