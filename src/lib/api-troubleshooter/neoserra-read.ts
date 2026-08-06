/**
 * Read-only Neoserra access for the API Troubleshooter.
 *
 * HARD CONSTRAINT: every request in this file is a GET. This module must
 * never create, update, or delete anything in Neoserra. The exact milestone
 * read endpoints aren't documented, so lookups probe a short list of
 * candidate paths and report every attempt — the attempt log is itself
 * diagnostic output ("your key can read clients but not milestones").
 */

import { neoserraUrl, neoserraKey, centerIdToName } from '@/lib/neoserra';
import type { LinkedClientSummary, ProbeAttempt, ProbeResult } from './types';

// Short leash: Neoserra can hang silently, and a lookup fans out over many
// candidate paths — long timeouts stack up and 502 the whole request.
const TIMEOUT_MS = 8_000;

export function neoserraConfigured(): boolean {
  return Boolean(neoserraUrl() && neoserraKey());
}

/** 10-minute cache of successful reads — repeat lookups on the same client
 *  during a troubleshooting session shouldn't re-hit Neoserra every time
 *  (observed: bursts of parallel probes appear to trip its rate limiting). */
const CACHE_TTL_MS = 10 * 60_000;
const readCache = new Map<string, { at: number; res: ProbeAttempt & { body: unknown } }>();

async function neoGet(path: string): Promise<ProbeAttempt & { body: unknown }> {
  const cached = readCache.get(path);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return { ...cached.res, note: `${cached.res.note} (cached)` };
  }
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
    const result = {
      path,
      status: res.status,
      note: res.ok ? 'OK' : `HTTP ${res.status}${snippet ? ` — ${snippet}` : ''}`,
      body,
    };
    if (res.status === 200) {
      if (readCache.size > 200) readCache.clear();
      readCache.set(path, { at: Date.now(), res: result });
    }
    return result;
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

/** Try candidate paths in small concurrent chunks; earliest path with
 *  records wins. Chunking (not full fan-out) keeps wall time bounded while
 *  staying under Neoserra's apparent rate limiting. */
const PROBE_CHUNK = 3;

async function probe(paths: string[]): Promise<ProbeResult> {
  const attempts: ProbeAttempt[] = [];
  let emptyOk: unknown = undefined;
  for (let i = 0; i < paths.length; i += PROBE_CHUNK) {
    const results = await Promise.all(paths.slice(i, i + PROBE_CHUNK).map((p) => neoGet(p)));
    for (const r of results) attempts.push({ path: r.path, status: r.status, note: r.note });
    for (const res of results) {
      if (res.status === 200 && hasRecords(res.body)) {
        return { found: true, data: res.body, attempts };
      }
      if (res.status === 200 && emptyOk === undefined) emptyOk = res.body;
    }
  }
  // A valid-but-empty answer is meaningful ("endpoint works, no records").
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
 * Client records linked to a contact. Verified live: neither the contact
 * search rows nor the full contact record carry client links, so the
 * linkage must come from a relationship-style endpoint. Unlike probe(),
 * this keeps going past a 200 until a response actually yields client IDs.
 */
export async function probeClientsForContact(
  contactId: string,
): Promise<ProbeResult & { clientIds: string[] }> {
  const id = encodeURIComponent(contactId.trim());
  const paths = [
    `/api/v1/relationships/${id}`,
    `/api/v1/clients?contactId=${id}`,
    `/api/v1/clients?contacts=${id}`,
    `/api/v1/contacts/${id}/clients`,
    `/api/v1/contacts/${id}`,
  ];
  const attempts: ProbeAttempt[] = [];
  let lastData: unknown = null;
  for (let i = 0; i < paths.length; i += PROBE_CHUNK) {
    const results = await Promise.all(paths.slice(i, i + PROBE_CHUNK).map((p) => neoGet(p)));
    for (const r of results) attempts.push({ path: r.path, status: r.status, note: r.note });
    for (const res of results) {
      if (res.status === 200 && hasRecords(res.body)) {
        const clientIds = extractClientIds(res.body);
        if (clientIds.length) return { found: true, data: res.body, attempts, clientIds };
        if (lastData == null) lastData = res.body;
      }
    }
  }
  return { found: lastData != null, data: lastData, attempts, clientIds: [] };
}

/** Fetch a linked client's record and summarize it for display. */
export async function fetchLinkedClient(clientId: string): Promise<LinkedClientSummary> {
  const probe = await probeClientById(clientId);
  const rec = (probe.data ?? {}) as Record<string, unknown>;
  const str = (key: string): string | null => {
    const v = rec[key];
    return typeof v === 'string' && v.trim() ? v.trim() : null;
  };
  const centerId = str('centerId');
  return {
    clientId,
    publicId: str('client'),
    company: str('company'),
    dba: str('dba'),
    status: str('status'),
    centerId,
    centerName: centerId ? centerIdToName(centerId) : null,
    found: probe.found,
    attempts: probe.attempts,
    data: probe.data,
  };
}

/** Milestone/EI records for a client — endpoint shape undocumented, so probe.
 *  The bare ?clientId= form hangs (classic Neoserra missing-required-param
 *  behavior); the events endpoint needs startDate, so try dated combos too. */
export async function probeMilestonesForClient(clientId: string): Promise<ProbeResult> {
  const id = encodeURIComponent(clientId.trim());
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const since = yearAgo.toISOString().slice(0, 10);
  return probe([
    `/api/v1/milestones?clientId=${id}&startDate=${since}`,
    `/api/v1/milestones?clients=${id}&startDate=${since}`,
    `/api/v1/milestones?client=${id}`,
    `/api/v1/milestones?clientId=${id}`,
    `/api/v1/milestones?clients=${id}`,
    `/api/v1/clients/${id}/milestones`,
    `/api/v1/milestones/${id}`,
  ]);
}

/**
 * Raw read-only probe for the endpoint-explorer route: GET one Neoserra
 * /api/v1/* path and report status + body. Same hard constraint as
 * everything else in this file — GET only.
 */
export async function rawNeoserraGet(path: string): Promise<ProbeAttempt & { body: unknown }> {
  return neoGet(path);
}
