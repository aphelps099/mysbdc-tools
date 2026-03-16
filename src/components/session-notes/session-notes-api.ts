/** Session Notes API calls — client lookup, AI formatting, and submission. */

import type { LookupResult, NoteSections, SessionNoteResult } from './types';

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

/** Use Claude AI to format raw notes into the 4-section structure. */
export async function formatNotesWithAi(rawText: string): Promise<NoteSections> {
  const res = await fetch(`${API_BASE}/api/session-notes/ai-format`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`AI formatting failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.sections;
}

/** Submit session note to NeoSerra counseling API. */
export async function submitSessionNote(payload: {
  clientId: string;
  contactId?: string;
  counselorId?: string;
  centerId?: string;
  subject: string;
  memo: string;
  sessionDate: string;
  contactDuration: number;
  sessionType: string;
  contactType: string;
  counselingArea: string;
  fundingSource: string;
  nbrPeople: number;
  prepTimeMinutes?: number;
  language?: string;
}): Promise<SessionNoteResult> {
  const res = await fetch(`${API_BASE}/api/session-notes/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Submission failed (${res.status}): ${text}`);
  }
  return res.json();
}
