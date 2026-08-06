/**
 * Read-only Neoserra access for the API Troubleshooter.
 *
 * HARD CONSTRAINT: every request in this file is a GET. This module must
 * never create, update, or delete anything in Neoserra. The exact milestone
 * read endpoints aren't documented, so lookups probe a short list of
 * candidate paths and report every attempt — the attempt log is itself
 * diagnostic output ("your key can read clients but not milestones").
 */

import { neoserraUrl, neoserraKey } from '@/lib/neoserra';
import type { ProbeAttempt, ProbeResult } from './types';

const TIMEOUT_MS = 15_000;

export function neoserraConfigured(): boolean {
  return Boolean(neoserraUrl() && neoserraKey());
}

async function neoGet(path: string): Promise<ProbeAttempt & { body: unknown }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${neoserraUrl()}${path}`, {
      method: 'GET', // read-only by design — never change this
      headers: { Authorization: `Bearer ${neoserraKey()}` },
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
    // Surface Neoserra's own words on failures — a 404 "unknown endpoint"
    // and a 403 "not authorized" point at completely different fixes.
    const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 160);
    return {
      path,
      status: res.status,
      note: res.ok ? 'OK' : `HTTP ${res.status}${snippet ? ` — ${snippet}` : ''}`,
      body,
    };
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = err instanceof DOMException && err.name === 'AbortError';
    return {
      path,
      status: isTimeout ? 'timeout' : 'network-error',
      note: isTimeout
        ? `No response after ${TIMEOUT_MS / 1000}s (Neoserra can hang silently on some requests)`
        : 'Could not reach Neoserra',
      body: null,
    };
  }
}

/** True when a 200 body actually contains at least one record. */
function hasRecords(body: unknown): boolean {
  if (body == null) return false;
  if (Array.isArray(body)) return body.length > 0;
  if (typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data.length > 0;
    // A single-record object (e.g. GET /clients/{id}) counts as found.
    return Object.keys(obj).length > 0;
  }
  return false;
}

/** Try candidate paths in order; first response with records wins. */
async function probe(paths: string[]): Promise<ProbeResult> {
  const attempts: ProbeAttempt[] = [];
  let emptyOk: unknown = undefined;
  for (const path of paths) {
    const res = await neoGet(path);
    attempts.push({ path: res.path, status: res.status, note: res.note });
    if (res.status === 200) {
      if (hasRecords(res.body)) return { found: true, data: res.body, attempts };
      // A valid-but-empty answer is meaningful ("endpoint works, no records"),
      // but keep probing in case another path shape returns data.
      if (emptyOk === undefined) emptyOk = res.body;
    }
  }
  return { found: false, data: emptyOk === undefined ? null : (emptyOk as object), attempts };
}

/** Did any probe path answer 200 (even with no records)? */
export function endpointReadable(result: ProbeResult): boolean {
  return result.attempts.some((a) => a.status === 200);
}

export async function probeContactByEmail(email: string): Promise<ProbeResult> {
  const e = encodeURIComponent(email.trim());
  return probe([
    `/api/v1/contacts?email=${e}`,
    `/api/v1/contacts/search?email=${e}`,
  ]);
}

export async function probeContactById(contactId: string): Promise<ProbeResult> {
  return probe([`/api/v1/contacts/${encodeURIComponent(contactId.trim())}`]);
}

export async function probeClientById(clientId: string): Promise<ProbeResult> {
  return probe([`/api/v1/clients/${encodeURIComponent(clientId.trim())}`]);
}

/**
 * Heuristically pull client (business) IDs out of a contact record so an
 * email lookup can chain onward to client + milestone checks. Neoserra's
 * contact response shape is undocumented, so this walks the JSON looking
 * for client-ish keys with numeric-ID values. The raw record is shown in
 * the UI's technical details, so misses are visible and correctable.
 */
export function extractClientIds(data: unknown): string[] {
  const ids = new Set<string>();
  const addIfId = (v: unknown) => {
    const s = String(v).trim();
    if (/^\d{4,9}$/.test(s)) ids.add(s);
  };
  const visit = (node: unknown, underClientKey: boolean): void => {
    if (ids.size >= 8 || node == null) return;
    if (Array.isArray(node)) {
      for (const item of node) {
        if (underClientKey && (typeof item === 'string' || typeof item === 'number')) addIfId(item);
        else visit(item, underClientKey);
      }
      return;
    }
    if (typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        // 'fkey' observed in Neoserra contact rows as a client foreign key
        const isClientKey = (/client/i.test(key) || /^fkey$/i.test(key)) && !/email|name|public|count/i.test(key);
        if (isClientKey && (typeof value === 'string' || typeof value === 'number')) {
          addIfId(value);
        } else if (typeof value === 'object' && value !== null) {
          visit(value, underClientKey || isClientKey);
        } else if (underClientKey && /^(id|clientId)$/i.test(key)) {
          addIfId(value);
        }
      }
    }
  };
  visit(data, false);
  return [...ids].slice(0, 5);
}

/**
 * Pull contact IDs (Neoserra `indivId`) out of a contact-search response so
 * the lookup can fetch the full contact record / relationships next.
 */
export function extractContactIds(data: unknown): string[] {
  const ids = new Set<string>();
  const visit = (node: unknown): void => {
    if (ids.size >= 5 || node == null) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (/^(indivId|contactId)$/i.test(key) && (typeof value === 'string' || typeof value === 'number')) {
          const s = String(value).trim();
          if (/^\d{4,9}$/.test(s)) ids.add(s);
        } else if (typeof value === 'object' && value !== null) {
          visit(value);
        }
      }
    }
  };
  visit(data);
  return [...ids];
}

/**
 * Client records linked to a contact — the contact search returns bare rows
 * (indivId/first/last/fkey), so client links live behind other endpoints.
 * Probe the plausible ones; extractClientIds() digests whichever answers.
 */
export async function probeClientsForContact(contactId: string): Promise<ProbeResult> {
  const id = encodeURIComponent(contactId.trim());
  return probe([
    `/api/v1/contacts/${id}`,
    `/api/v1/relationships/${id}`,
    `/api/v1/clients?contactId=${id}`,
  ]);
}

/** Milestone/EI records for a client — endpoint shape undocumented, so probe. */
export async function probeMilestonesForClient(clientId: string): Promise<ProbeResult> {
  const id = encodeURIComponent(clientId.trim());
  return probe([
    `/api/v1/milestones?clientId=${id}`,
    `/api/v1/milestones?clients=${id}`,
    `/api/v1/clients/${id}/milestones`,
    `/api/v1/milestones/${id}`,
  ]);
}
