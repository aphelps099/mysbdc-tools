/**
 * Read-only Gravity Forms access for the API Troubleshooter.
 *
 * HARD CONSTRAINT: every request in this file is a GET. This module reads
 * the GF Entries ledger (the definitive record of what the milestone form
 * captured) and never creates, edits, or deletes entries, forms, or
 * settings.
 *
 * Setup (one-time, in WordPress): Forms → Settings → REST API → enable,
 * then add an API key with READ permission. Configure here via env:
 *   GRAVITY_FORMS_BASE_URL   e.g. https://www.norcalsbdc.org
 *   GRAVITY_FORMS_KEY        consumer key (ck_…)
 *   GRAVITY_FORMS_SECRET     consumer secret (cs_…)
 *   GRAVITY_FORMS_STEP2_ID   Step 2 form ID (default 39)
 */

import type { ProbeAttempt } from './types';

const TIMEOUT_MS = 15_000;

export interface GfEntrySummary {
  entryId: string;
  /** date_created as reported by WordPress (site-local time). */
  dateCreated: string;
  contactId: string | null;
  contactEmail: string | null;
  businessId: string | null;
  milestoneTypes: string[];
  fields: { label: string; value: string }[];
  /** True when another entry for the same contact/business landed within 10 minutes. */
  likelyDuplicate: boolean;
}

export interface GfFindings {
  configured: boolean;
  attempts: ProbeAttempt[];
  entries: GfEntrySummary[];
  /** Total matching entries reported by GF (may exceed entries returned). */
  totalCount: number | null;
}

function baseUrl(): string {
  return (process.env.GRAVITY_FORMS_BASE_URL || '').replace(/\/+$/, '');
}

function step2FormId(): string {
  return process.env.GRAVITY_FORMS_STEP2_ID || '39';
}

export function gfConfigured(): boolean {
  return Boolean(baseUrl() && process.env.GRAVITY_FORMS_KEY && process.env.GRAVITY_FORMS_SECRET);
}

async function gfGet(path: string): Promise<ProbeAttempt & { body: unknown }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const auth = Buffer.from(
    `${process.env.GRAVITY_FORMS_KEY}:${process.env.GRAVITY_FORMS_SECRET}`,
  ).toString('base64');
  try {
    const res = await fetch(`${baseUrl()}/wp-json/gf/v2${path}`, {
      method: 'GET', // read-only by design — never change this
      headers: { Authorization: `Basic ${auth}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await res.text().catch(() => '');
    let body: unknown = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 160);
    return {
      path: `/wp-json/gf/v2${path}`,
      status: res.status,
      note: res.ok ? 'OK' : `HTTP ${res.status}${snippet ? ` — ${snippet}` : ''}`,
      body,
    };
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = err instanceof DOMException && err.name === 'AbortError';
    return {
      path: `/wp-json/gf/v2${path}`,
      status: isTimeout ? 'timeout' : 'network-error',
      note: isTimeout ? `No response after ${TIMEOUT_MS / 1000}s` : 'Could not reach WordPress',
      body: null,
    };
  }
}

interface GfField {
  id: number | string;
  label?: string;
  inputs?: { id: number | string; label?: string }[] | null;
}

/** Map semantic roles to GF field IDs using the form definition's labels. */
function mapFieldIds(fields: GfField[]): {
  contactId: string | null;
  contactEmail: string | null;
  businessId: string | null;
  labelsById: Map<string, string>;
} {
  let contactId: string | null = null;
  let contactEmail: string | null = null;
  let businessId: string | null = null;
  const labelsById = new Map<string, string>();

  for (const f of fields) {
    const label = (f.label || '').trim();
    const id = String(f.id);
    if (label) labelsById.set(id, label);
    const l = label.toLowerCase();
    if (!contactId && l === 'contact id') contactId = id;
    if (!contactEmail && l.includes('contact email')) contactEmail = id;
    if (!businessId && (l.includes('select business') || l.includes('neoserra client'))) businessId = id;
  }
  return { contactId, contactEmail, businessId, labelsById };
}

const MILESTONE_TYPES = [
  'I Hired New Employees',
  'I Increased My Sales',
  'I Started a New Business',
  'I Got My Business Funded',
];

function entryToSummary(
  entry: Record<string, unknown>,
  map: ReturnType<typeof mapFieldIds>,
): GfEntrySummary {
  const val = (fieldId: string | null): string | null => {
    if (!fieldId) return null;
    // Simple fields live at entry["7"]; multi-input/checkbox values live at
    // entry["7.1"], entry["7.2"], … — gather both.
    const direct = entry[fieldId];
    if (typeof direct === 'string' && direct.trim()) return direct.trim();
    const parts = Object.entries(entry)
      .filter(([k, v]) => k.startsWith(`${fieldId}.`) && typeof v === 'string' && (v as string).trim())
      .map(([, v]) => (v as string).trim());
    return parts.length ? parts.join('; ') : null;
  };

  const fields: { label: string; value: string }[] = [];
  for (const [id, label] of map.labelsById) {
    const v = val(id);
    if (v) fields.push({ label, value: v });
  }

  const allValues = Object.values(entry)
    .filter((v): v is string => typeof v === 'string')
    .join('\n');

  return {
    entryId: String(entry.id ?? ''),
    dateCreated: String(entry.date_created ?? ''),
    contactId: val(map.contactId),
    contactEmail: val(map.contactEmail),
    businessId: val(map.businessId),
    milestoneTypes: MILESTONE_TYPES.filter((t) => allValues.includes(t)),
    fields,
    likelyDuplicate: false,
  };
}

/** Mark entries that repeat the same contact/business within 10 minutes. */
function flagDuplicates(entries: GfEntrySummary[]): void {
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      const sameTarget =
        (a.businessId && a.businessId === b.businessId) ||
        (a.contactEmail && a.contactEmail === b.contactEmail);
      if (!sameTarget) continue;
      const dt = Math.abs(new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());
      if (Number.isFinite(dt) && dt <= 10 * 60_000) {
        a.likelyDuplicate = true;
        b.likelyDuplicate = true;
      }
    }
  }
}

/**
 * Fetch recent Step 2 entries, optionally filtered to one client by email
 * and/or business ID. Read-only.
 */
export async function fetchStep2Entries(filter: {
  email?: string;
  businessId?: string;
  pageSize?: number;
}): Promise<GfFindings> {
  if (!gfConfigured()) {
    return { configured: false, attempts: [], entries: [], totalCount: null };
  }
  const attempts: ProbeAttempt[] = [];
  const formId = step2FormId();

  // Form definition → field-ID map (labels are the stable interface).
  const formRes = await gfGet(`/forms/${formId}`);
  attempts.push({ path: formRes.path, status: formRes.status, note: formRes.note });
  const formBody = formRes.body as { fields?: GfField[] } | null;
  if (formRes.status !== 200 || !formBody?.fields) {
    return { configured: true, attempts, entries: [], totalCount: null };
  }
  const map = mapFieldIds(formBody.fields);

  const filters: { key: string; value: string }[] = [];
  if (filter.email && map.contactEmail) filters.push({ key: map.contactEmail, value: filter.email });
  if (filter.businessId && map.businessId) filters.push({ key: map.businessId, value: filter.businessId });

  const params = new URLSearchParams();
  params.set('paging[page_size]', String(filter.pageSize ?? 10));
  params.set('sorting[key]', 'date_created');
  params.set('sorting[direction]', 'DESC');
  if (filters.length) {
    params.set('search', JSON.stringify({ field_filters: filters }));
  }

  const entriesRes = await gfGet(`/forms/${formId}/entries?${params.toString()}`);
  attempts.push({ path: entriesRes.path, status: entriesRes.status, note: entriesRes.note });
  const body = entriesRes.body as { total_count?: number; entries?: Record<string, unknown>[] } | null;
  if (entriesRes.status !== 200 || !body?.entries) {
    return { configured: true, attempts, entries: [], totalCount: null };
  }

  let entries = body.entries.map((e) => entryToSummary(e, map));
  let totalCount = body.total_count ?? null;

  // Fallback: GF's keyed field search is exact-match against one field ID
  // and misses when the label→ID mapping is off. If it returned nothing,
  // pull the latest entries and match client-side across every value.
  if (filters.length && entries.length === 0) {
    const wide = new URLSearchParams();
    wide.set('paging[page_size]', '50');
    wide.set('sorting[key]', 'date_created');
    wide.set('sorting[direction]', 'DESC');
    const wideRes = await gfGet(`/forms/${formId}/entries?${wide.toString()}`);
    attempts.push({ path: wideRes.path, status: wideRes.status, note: wideRes.note });
    const wideBody = wideRes.body as { total_count?: number; entries?: Record<string, unknown>[] } | null;
    if (wideRes.status === 200 && wideBody?.entries) {
      const email = filter.email?.trim().toLowerCase();
      const biz = filter.businessId?.trim();
      const all = wideBody.entries.map((e) => entryToSummary(e, map));
      entries = all.filter((s) => {
        const emailHit =
          !!email &&
          (s.contactEmail?.toLowerCase() === email ||
            s.fields.some((f) => f.value.toLowerCase().includes(email)));
        const bizHit = !!biz && (s.businessId === biz || s.fields.some((f) => f.value === biz));
        return emailHit || bizHit;
      });
      totalCount = entries.length;
      attempts.push({
        path: '(client-side scan of the latest 50 entries)',
        status: 200,
        note: `keyed search matched 0 — scan matched ${entries.length}`,
      });
    }
  }

  flagDuplicates(entries);
  return { configured: true, attempts, entries, totalCount };
}
