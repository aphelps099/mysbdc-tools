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
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return {
      path,
      status: res.status,
      note: res.ok ? 'OK' : `Neoserra returned HTTP ${res.status}`,
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
