/**
 * Shared Neoserra API client + backend proxy helpers.
 *
 * Neoserra direct: Uses NEOSERRA_BASE_URL and NEOSERRA_API_KEY env vars (Bearer auth).
 * Backend proxy:   Uses BACKEND_URL for milestone log and Atlas impact data.
 */

// ── Config helpers ──

export function neoserraUrl(): string {
  return (process.env.NEOSERRA_BASE_URL || '').replace(/\/+$/, '');
}

export function neoserraKey(): string {
  return process.env.NEOSERRA_API_KEY || '';
}

// ── Center name → ID resolution ──

/**
 * Map of natural-language center names/aliases to Neoserra center IDs.
 * Aliases are lowercase. Multiple aliases can point to the same ID.
 *
 * To find IDs: GET /api/v1/centers/{centerReference}
 */
const CENTER_MAP: Record<string, string> = {
  // LEAD / Regional / NorCal (the network-level center)
  'norcal': '1',
  'regional': '1',
  'lead': '1',
  'network': '1',
  'norcal sbdc': '1',
  // Butte College SBDC
  'butte': '39',
  'butte college': '39',
  // Capital Region SBDC
  'capital region': '10',
  'capital': '10',
  // Central Coast SBDC
  'central coast': '12',
  // Contra Costa SBDC
  'contra costa': '14',
  // Gavilan SBDC
  'gavilan': '16',
  // Greater Sacramento SBDC
  'sacramento': '18',
  'sac': '18',
  'greater sacramento': '18',
  // Humboldt SBDC
  'humboldt': '20',
  // Lake County SBDC
  'lake': '22',
  'lake county': '22',
  // Marin SBDC
  'marin': '24',
  // Mendocino WBC
  'mendocino': '26',
  'mendocino wbc': '26',
  // Napa-Sonoma SBDC
  'napa': '28',
  'sonoma': '28',
  'napa-sonoma': '28',
  'napa sonoma': '28',
  // North Coast SBDC
  'north coast': '30',
  // San Joaquin SBDC
  'san joaquin': '32',
  'stockton': '32',
  // San Mateo SBDC
  'san mateo': '34',
  // Santa Cruz SBDC
  'santa cruz': '36',
  // Shasta SBDC
  'shasta': '38',
  // Silicon Valley SBDC
  'silicon valley': '40',
  'sv': '40',
  // Solano SBDC
  'solano': '42',
  // Yolo SBDC
  'yolo': '44',
};

/**
 * Resolve a natural-language center name to a Neoserra center ID.
 * Returns undefined if no match found.
 */
export function resolveCenterId(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  // Direct match
  if (CENTER_MAP[key]) return CENTER_MAP[key];
  // Partial match — find first alias that contains the input or vice versa
  for (const [alias, id] of Object.entries(CENTER_MAP)) {
    if (alias.includes(key) || key.includes(alias)) return id;
  }
  return undefined;
}

/** List all known center names (for system prompt). */
export function getCenterNames(): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const [alias, id] of Object.entries(CENTER_MAP)) {
    if (!seen.has(id)) {
      seen.add(id);
      names.push(alias);
    }
  }
  return names;
}

/** Reverse lookup: center ID → human-readable name. */
export function centerIdToName(centerId: string): string {
  // Build reverse map: pick the longest alias per ID (most descriptive)
  const reverseMap: Record<string, string> = {};
  for (const [alias, id] of Object.entries(CENTER_MAP)) {
    if (!reverseMap[id] || alias.length > reverseMap[id].length) {
      reverseMap[id] = alias;
    }
  }
  const name = reverseMap[centerId];
  if (name) {
    // Title case
    return name.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return `Center ${centerId}`;
}

// ── Types ──

export interface NeoserraEvent {
  conference: string;
  title: string;
  startDate: string;
  endDate?: string;
  date?: string;
  hours?: string;
  nbrsessions?: number;
  topics?: string;
  topic?: string;
  format?: string;
  centerId?: string;
  centerName?: string;
  attTot?: number;
  noshowTot?: number;
  confstatus?: string;
  location?: string;
  locCity?: string;
  [key: string]: unknown;
}

export interface NeoserraAttendee {
  contactId?: string;
  first?: string;
  last?: string;
  email?: string;
  status?: string;
  presence?: string;
  entry?: string;
  shouldPay?: number;
  feeLevel?: number;
  [key: string]: unknown;
}

export interface NeoserraTrainer {
  counselorId?: string;
  first?: string;
  last?: string;
  role?: string;
  [key: string]: unknown;
}

// ── Fetch helpers ──

const TIMEOUT_MS = 15_000;

async function neoserraGet<T>(path: string): Promise<T> {
  const base = neoserraUrl();
  const key = neoserraKey();
  if (!base || !key) throw new Error('Neoserra API not configured (missing NEOSERRA_BASE_URL or NEOSERRA_API_KEY)');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${base}${path}`;
    console.log(`[neoserra] GET ${url}`);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Neoserra returned ${res.status}: ${text}`);
    }

    return await res.json() as T;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Neoserra request timed out after 15s');
    }
    throw err;
  }
}

// ── Training API functions ──

/**
 * Fetch recent training events, optionally filtered by center.
 * @param centerId - Neoserra center ID (optional)
 * @param days - Number of days to look back (default 30)
 */
export async function fetchRecentEvents(centerId?: string, days = 30): Promise<NeoserraEvent[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const dateStr = startDate.toISOString().slice(0, 10); // YYYY-MM-DD

  let path = `/api/v1/events?startDate=${dateStr}`;
  if (centerId) path += `&centerId=${encodeURIComponent(centerId)}`;

  const result = await neoserraGet<NeoserraEvent[] | { data: NeoserraEvent[] }>(path);
  // Neoserra may return array directly or wrapped in { data: [] }
  return Array.isArray(result) ? result : (result.data || []);
}

/**
 * Fetch the attendee roster for a training event.
 * @param conferenceId - Training event conference ID
 */
export async function fetchAttendees(conferenceId: string): Promise<NeoserraAttendee[]> {
  const path = `/api/v1/attendees/${encodeURIComponent(conferenceId)}`;
  const result = await neoserraGet<NeoserraAttendee[] | { data: NeoserraAttendee[] }>(path);
  return Array.isArray(result) ? result : (result.data || []);
}

/**
 * Fetch the trainers/presenters for a training event.
 * @param conferenceId - Training event conference ID
 */
export async function fetchTrainers(conferenceId: string): Promise<NeoserraTrainer[]> {
  const path = `/api/v1/trainers/${encodeURIComponent(conferenceId)}`;
  const result = await neoserraGet<NeoserraTrainer[] | { data: NeoserraTrainer[] }>(path);
  return Array.isArray(result) ? result : (result.data || []);
}

// ══════════════════════════════════════════════════════════════
// Backend proxy helpers (BACKEND_URL — not Neoserra directly)
// ══════════════════════════════════════════════════════════════

function backendUrl(): string {
  return (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
}

async function backendGet<T>(path: string): Promise<T> {
  const base = backendUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${base}${path}`;
    console.log(`[backend] GET ${url}`);
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Backend returned ${res.status}: ${text}`);
    }

    return await res.json() as T;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Backend request timed out after 15s');
    }
    throw err;
  }
}

// ── Milestone Log ──

export interface MilestoneLogEntry {
  id: number;
  timestamp: string;
  name: string;
  email: string;
  clientId: string;
  clientPublicId: string;
  clientName: string;
  centerId: string | null;
  counselorId: string | null;
  program: string | null;
  categories: string[];
  recordsCreated: number;
  errors: string[];
  details: { type: string; status: string }[];
  signature: string;
  emailNotifications: Record<string, string>;
}

interface MilestoneLogResponse {
  count: number;
  days: number;
  submissions: MilestoneLogEntry[];
}

/** PII-safe milestone data for Claude. */
export interface AnonymizedMilestone {
  centerName: string;
  categories: string[];
  timestamp: string;
  details: { type: string; status: string }[];
}

/** Strip all PII from a milestone entry. */
export function anonymizeMilestone(entry: MilestoneLogEntry): AnonymizedMilestone {
  return {
    centerName: entry.centerId ? centerIdToName(entry.centerId) : 'NorCal SBDC',
    categories: entry.categories,
    timestamp: entry.timestamp,
    details: entry.details,
  };
}

/**
 * Fetch recent milestone submissions from the backend.
 * @param days - Number of days to look back (default 7)
 */
export async function fetchMilestoneLog(days = 7): Promise<MilestoneLogEntry[]> {
  const result = await backendGet<MilestoneLogResponse>(`/api/milestones/log?days=${days}`);
  return result.submissions || [];
}

// ── Atlas Impact Data ──

export interface CenterImpact {
  center_id: string;
  center_name?: string;
  capital: number;
  jobs: number;
  businesses: number;
  revenue: number;
  clients: number;
}

export interface ImpactData {
  period: string;
  since: string;
  capital_accessed: number;
  jobs_created: number;
  jobs_ft: number;
  jobs_pt: number;
  businesses_started: number;
  revenue_growth: number;
  by_center: CenterImpact[];
  total_submissions: number;
  recent: { timestamp: string; center_id: string; category: string; delta: number }[];
}

/**
 * Fetch impact data from the Atlas backend.
 * The `recent` array is stripped of client_name before return.
 * @param period - 'this_month' | 'quarter' | 'ytd' | 'all_time'
 */
export async function fetchImpactData(period = 'this_month'): Promise<ImpactData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await backendGet<any>(`/api/atlas/impact?period=${encodeURIComponent(period)}`);

  // Strip PII from recent activity entries
  const recent = (raw.recent || []).map((r: Record<string, unknown>) => ({
    timestamp: r.timestamp,
    center_id: r.center_id,
    category: r.category,
    delta: r.delta,
    // Deliberately omit: client_name, submitter_name, client_public_id
  }));

  return {
    period: raw.period,
    since: raw.since,
    capital_accessed: raw.capital_accessed || 0,
    jobs_created: raw.jobs_created || 0,
    jobs_ft: raw.jobs_ft || 0,
    jobs_pt: raw.jobs_pt || 0,
    businesses_started: raw.businesses_started || 0,
    revenue_growth: raw.revenue_growth || 0,
    by_center: raw.by_center || [],
    total_submissions: raw.total_submissions || 0,
    recent,
  };
}
