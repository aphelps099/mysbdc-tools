/** Milestone collection API calls — contact lookup and milestone submission. */

import type { LookupResult, MilestoneData, MilestoneResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/** Look up a contact by email and return their linked client records. */
export async function lookupContact(email: string): Promise<LookupResult> {
  const res = await fetch(`${API_BASE}/api/milestones/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Contact lookup failed (${res.status}): ${text}`);
  }
  return res.json();
}

/** Look up a contact by ID (for deep-link flow). */
export async function lookupContactById(contactId: string): Promise<LookupResult> {
  const res = await fetch(`${API_BASE}/api/milestones/lookup-by-id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contactId }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Contact lookup failed (${res.status}): ${text}`);
  }
  return res.json();
}

/** Submit milestone data and create Neoserra records. */
export async function submitMilestones(data: MilestoneData): Promise<MilestoneResult> {
  const res = await fetch(`${API_BASE}/api/milestones/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Milestone submission failed (${res.status}): ${text}`);
  }
  return res.json();
}
