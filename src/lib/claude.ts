/**
 * Shared Claude AI client for mysbdc-tools.
 *
 * Wraps the Anthropic Messages API with auth, retries, and JSON extraction.
 * Used by all AI-powered content tools (newsletters, success stories, social, etc.).
 *
 * Requires ANTHROPIC_API_KEY env var.
 */

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const DEFAULT_MAX_TOKENS = 1024;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// ── Types ──

export interface ClaudeRequestOptions {
  /** System prompt (sent as top-level `system` param, not in messages) */
  system?: string;
  /** User message content */
  prompt: string;
  /** Model ID override. Default: claude-haiku-4-5-20251001 */
  model?: string;
  /** Max tokens override. Default: 1024 */
  maxTokens?: number;
  /** Temperature 0–1. Default: API default */
  temperature?: number;
  /** Tag for console log messages, e.g. "newsletter-events" */
  tag?: string;
}

export interface ClaudeSuccess<T = unknown> {
  ok: true;
  data: T;
  raw: string;
  usage: { input_tokens: number; output_tokens: number };
}

export interface ClaudeError {
  ok: false;
  error: string;
  status: number;
}

export type ClaudeResult<T = unknown> = ClaudeSuccess<T> | ClaudeError;

// ── Main function ──

export async function callClaude<T = unknown>(
  options: ClaudeRequestOptions,
): Promise<ClaudeResult<T>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: 'ANTHROPIC_API_KEY not configured. AI features are unavailable.',
      status: 503,
    };
  }

  const {
    system,
    prompt,
    model = DEFAULT_MODEL,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature,
    tag = 'claude',
  } = options;

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  };
  if (system) body.system = system;
  if (temperature !== undefined) body.temperature = temperature;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });

      // Retryable status codes
      if (
        (res.status === 429 || res.status === 500 || res.status === 529) &&
        attempt < MAX_RETRIES
      ) {
        const retryAfter = res.headers.get('retry-after');
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : RETRY_DELAY_MS * (attempt + 1);
        console.warn(`[${tag}] ${res.status} — retrying in ${delay}ms (attempt ${attempt + 1})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[${tag}] Anthropic API error: ${res.status} ${errText}`);
        return { ok: false, error: `AI service returned ${res.status}`, status: 502 };
      }

      const data = await res.json();
      const text: string = data.content?.[0]?.text || '';
      const usage = data.usage || { input_tokens: 0, output_tokens: 0 };

      const parsed = extractJson<T>(text);
      if (parsed === null) {
        console.warn(`[${tag}] Failed to parse JSON from response`);
        return { ok: false, error: 'Failed to parse AI response', status: 500 };
      }

      return { ok: true, data: parsed, raw: text, usage };
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.warn(`[${tag}] Request failed, retrying...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(`[${tag}] Request failed: ${reason}`);
      return { ok: false, error: `AI service unavailable: ${reason}`, status: 502 };
    }
  }

  return { ok: false, error: 'Max retries exceeded', status: 502 };
}

// ── JSON extraction ──

function extractJson<T>(text: string): T | null {
  // 1. Direct parse
  try {
    return JSON.parse(text);
  } catch {}

  // 2. Markdown code fence
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {}
  }

  // 3. Bare JSON object
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch {}
  }

  // 4. Bare JSON array
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[0]);
    } catch {}
  }

  return null;
}
