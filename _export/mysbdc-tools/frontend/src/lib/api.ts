/**
 * Backend API client for mysbdc-tools.
 *
 * All requests use relative URLs (e.g. "/api/neoserra/status") so they go
 * through the Next.js rewrite proxy defined in src/app/api/[...path]/route.ts.
 *
 * The backend URL is configured via BACKEND_URL env var on the server.
 * This frontend shares the same FastAPI backend as sbdc-advisor.
 */

// ─── Token management ───

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sbdc_token');
}

export function setToken(token: string) {
  localStorage.setItem('sbdc_token', token);
}

export function clearToken() {
  localStorage.removeItem('sbdc_token');
}

/**
 * Decode the custom HMAC-signed token and check whether it has expired.
 * Returns true if the token exists AND has not expired (with a 60s buffer).
 */
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    // Pad base64url → base64
    let body = parts[1];
    body += '='.repeat((4 - (body.length % 4)) % 4);
    const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
    // 60-second buffer so we don't fire a request that will immediately 401
    return typeof payload.exp === 'number' && payload.exp > Date.now() / 1000 + 60;
  } catch {
    return false;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Auth ───

export async function login(password: string): Promise<{ token: string; expires_at: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Invalid access code');
  }

  return res.json();
}

// ─── Health ───

export interface HealthData {
  status: string;
  model: string;
  provider: string;
  model_display: string;
  documents_indexed: number;
}

export async function fetchHealth(): Promise<HealthData> {
  const res = await fetch('/api/health', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

// ─── Neoserra CRM ───

export interface NeoserraSearchResult {
  contacts: Record<string, unknown>[];
  clients: Record<string, unknown>[];
}

export interface NeoserraRecord {
  data: Record<string, unknown> | null;
  error?: string;
}

export interface NeoserraList {
  data: Record<string, unknown>[];
  count: number;
}

export interface NeoserraWriteResult {
  success: boolean;
  data?: Record<string, unknown> | null;
  error?: string;
}

export async function fetchNeoserraStatus(): Promise<{ configured: boolean; base_url: string }> {
  const res = await fetch('/api/neoserra/status', { headers: authHeaders() });
  if (!res.ok) throw new Error('Neoserra status check failed');
  return res.json();
}

export async function searchNeoserra(email: string): Promise<NeoserraSearchResult> {
  const res = await fetch(`/api/neoserra/search?email=${encodeURIComponent(email)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Neoserra search failed');
  return res.json();
}

export async function fetchNeoserraRecord(
  entityType: string,
  entityId: string,
): Promise<NeoserraRecord> {
  const res = await fetch(`/api/neoserra/${entityType}/${entityId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch ${entityType} ${entityId}`);
  return res.json();
}

export async function fetchNeoserraList(path: string): Promise<NeoserraList> {
  const res = await fetch(`/api/neoserra/${path}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

export interface NeoserraClientProfile {
  client: Record<string, unknown>;
  contacts: Record<string, unknown>[];
  counselorName: string | null;
}

export async function fetchNeoserraClientProfile(clientId: string): Promise<NeoserraClientProfile> {
  const res = await fetch(`/api/neoserra/clients/${clientId}/profile`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch client profile ${clientId}`);
  return res.json();
}

// ─── Milestones ───

export interface MilestoneSubmission {
  contact_id: string;
  contact_email: string;
  client_id: string;
  entry_id: string;
  entry_date: string;
  categories: string[];
  employees?: {
    initial_ft: string;
    total_ft: string;
    delta_ft: string;
    initial_pt: string;
    total_pt: string;
    delta_pt: string;
  };
  sales?: {
    initial_sales: string;
    gross_revenue: string;
    delta_revenue: string;
  };
  new_business?: {
    verified: string;
    legal_structure: string;
    start_date: string;
  };
  funding?: {
    type: string;
    institution: string;
    amount: string;
    date: string;
  };
  testimonial?: string;
  signature?: string;
}

export interface MilestoneHistoryResponse {
  configured: boolean;
  milestones: MilestoneSubmission[];
  count: number;
  message?: string;
}

export async function fetchClientMilestones(clientId: string): Promise<MilestoneHistoryResponse> {
  const res = await fetch(`/api/neoserra/clients/${clientId}/milestones`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch milestones for client ${clientId}`);
  return res.json();
}

// ─── Dashboard ───

export interface DashboardOverview {
  total_active_clients: number;
  new_clients_30d: number;
  new_clients_90d: number;
  new_clients_12mo: number;
  total_centers: number;
  active_counselors: number;
  upcoming_events: number;
  total_capital_funded: number;
  total_investments: number;
}

export interface CenterStat {
  id: number;
  name: string;
  new_clients_30d: number;
  new_clients_90d: number;
  new_clients_12mo: number;
}

export interface TrainingEntry {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  center_id: string;
  status: string;
  format: string;
  topic: string;
  attended: number;
  max_attendees: string;
  att_women: number;
  att_minorities: number;
  att_veterans: number;
  att_startups: number;
  att_in_business: number;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  startDate: string;
  center_id: string;
  format: string;
  status: string;
}

export interface FundingBreakdown {
  type: string;
  amount: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  center_stats: CenterStat[];
  training_leaderboard: TrainingEntry[];
  upcoming_events: UpcomingEvent[];
  capital: {
    total_funded: number;
    investment_count: number;
    by_type: FundingBreakdown[];
  };
}

export async function fetchNeoserraDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/neoserra/dashboard', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function writeNeoserra(
  path: string,
  fields: Record<string, unknown>,
): Promise<NeoserraWriteResult> {
  const res = await fetch(`/api/neoserra/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`Neoserra write failed: ${path}`);
  return res.json();
}
