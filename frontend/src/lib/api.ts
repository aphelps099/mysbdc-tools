import type { PromptBodyElement, MessageAction } from './types';

/**
 * Backend API client with SSE streaming support.
 *
 * All requests use relative URLs (e.g. "/api/chat") so they go through
 * the Next.js rewrite proxy defined in next.config.js.  This means:
 *   - No CORS issues (browser sees same-origin)
 *   - No NEXT_PUBLIC_API_URL needed at build time
 *   - The backend URL is configured via BACKEND_URL env var on the server
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

// ─── Prompts ───

export interface PromptCategory {
  id: string;
  label: string;
  count: number;
}

export interface PromptItem {
  id: number;
  title: string;
  category: string;
  categoryLabel: string;
  description: string;
  tags: string[];
  prompt: string;
  isWorkflow: boolean;
  workflowId?: string;
  body?: PromptBodyElement[];
}

export interface PromptLibraryData {
  prompts: PromptItem[];
  categories: PromptCategory[];
}

export async function fetchPrompts(): Promise<PromptLibraryData> {
  const res = await fetch('/api/prompts', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch prompts');
  return res.json();
}

// ─── Workflows ───

export interface WorkflowMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export async function fetchWorkflows(): Promise<{ workflows: WorkflowMeta[] }> {
  const res = await fetch('/api/workflows/', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch workflows');
  return res.json();
}

// ─── Documents ───

export interface DocumentInfo {
  filename: string;
  chunk_count: number;
}

export async function fetchDocuments(): Promise<{
  documents: DocumentInfo[];
  total_chunks: number;
}> {
  const res = await fetch('/api/documents/', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export interface UploadResult {
  filename: string;
  chunks_created: number;
  total_chunks: number;
  ingestion_error?: string | null;
}

export async function uploadDocument(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/documents/upload', {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Upload failed (${res.status})`);
  }

  return res.json();
}

// ─── Events ───

export interface EventItem {
  title: string;
  center: string;
  date: string;
  time: string;
  summary: string;
  cost: string;
  event_url: string;
  registration_url: string;
  image_url: string;
}

export interface EventsData {
  events: EventItem[];
  total: number;
  page: number;
  total_pages: number;
}

export async function fetchEvents(page = 1, perPage = 5): Promise<EventsData> {
  const res = await fetch(`/api/events?page=${page}&per_page=${perPage}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch events');
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

// ─── Conversations ───

export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SavedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  has_compliance: boolean;
  created_at: string;
  metadata?: { actions?: MessageAction[] } | null;
}

export interface ConversationDetail {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: SavedMessage[];
}

export async function fetchConversations(limit = 50): Promise<{ conversations: ConversationSummary[] }> {
  const res = await fetch(`/api/conversations/?limit=${limit}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function createConversation(): Promise<{ id: string; title: string }> {
  const res = await fetch('/api/conversations/', {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to create conversation (${res.status})`);
  return res.json();
}

export async function fetchConversation(id: string): Promise<ConversationDetail> {
  const res = await fetch(`/api/conversations/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch conversation');
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`/api/conversations/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
}


// ─── Transcription ───

export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string }> {
  // Derive filename extension from the blob's MIME type.
  // The backend also does magic-byte detection, but a correct extension
  // here helps with content-type negotiation in the multipart upload.
  const extMap: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/mp4': 'mp4',
    'audio/m4a': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/aac': 'mp4',
    'audio/x-caf': 'mp4',
  };
  const baseMime = audioBlob.type.split(';')[0];
  // Default to 'dat' for unknown types — the backend's magic-byte
  // detection will determine the real format.
  const ext = extMap[baseMime] || 'dat';

  console.log('[audio] Uploading:', audioBlob.size, 'bytes, blobType:', audioBlob.type, '→ ext:', ext);

  const formData = new FormData();
  formData.append('file', audioBlob, `recording.${ext}`);

  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Transcription failed (${res.status})`);
  }

  return res.json();
}

// ─── Chat (SSE Streaming) ───

export interface ChatStreamCallbacks {
  onToken: (text: string) => void;
  onDone: (usage: { input_tokens: number; output_tokens: number }, model?: string) => void;
  onCompliance: () => void;
  onError: (message: string) => void;
  onActions?: (actions: MessageAction[]) => void;
}

export async function streamChat(
  message: string,
  conversationHistory: { role: string; content: string }[],
  callbacks: ChatStreamCallbacks,
  options?: { useRag?: boolean; model?: string; workflowId?: string; conversationId?: string },
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory,
        use_rag: options?.useRag ?? true,
        model: options?.model,
        workflow_id: options?.workflowId,
        conversation_id: options?.conversationId,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    console.error('[SBDC] Chat fetch failed:', err);
    if (err instanceof DOMException && err.name === 'AbortError') {
      callbacks.onError('Request timed out. The backend may be unavailable.');
    } else {
      callbacks.onError('Cannot reach backend. Check that BACKEND_URL is set on the frontend service.');
    }
    return;
  }
  clearTimeout(timeout);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    callbacks.onError(data.detail || `Server error (${res.status})`);
    return;
  }

  // Stream SSE tokens in real-time using ReadableStream
  const reader = res.body?.getReader();
  if (!reader) {
    callbacks.onError('Response body is not readable.');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let terminated = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE lines from the buffer
      const lines = buffer.split('\n');
      // Keep the last (possibly incomplete) line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const jsonStr = trimmed.slice(6);
        try {
          const event = JSON.parse(jsonStr);

          switch (event.type) {
            case 'keepalive':
              break;
            case 'token':
              callbacks.onToken(event.content);
              break;
            case 'done':
              terminated = true;
              callbacks.onDone(event.usage || { input_tokens: 0, output_tokens: 0 }, event.model);
              break;
            case 'compliance':
              callbacks.onCompliance();
              break;
            case 'actions':
              callbacks.onActions?.(event.actions);
              break;
            case 'error':
              terminated = true;
              callbacks.onError(event.message);
              break;
          }
        } catch {
          console.warn('[SBDC] Failed to parse SSE line:', jsonStr);
        }
      }
    }
  } catch (err) {
    console.error('[SBDC] Stream reading error:', err);
    if (!terminated) {
      callbacks.onError('Connection lost while streaming response.');
    }
    return;
  }

  if (!terminated) {
    console.error('[SBDC] Stream ended without done/error event.');
    callbacks.onError(
      'The response ended unexpectedly. This usually means the OpenAI API key '
      + 'is not configured. Check your OPENAI_API_KEY environment variable.'
    );
  }
}
