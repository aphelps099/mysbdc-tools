/**
 * AI-powered session notes formatter.
 *
 * Accepts raw text (meeting notes, transcript, etc.) and uses Claude
 * to structure it into the standard 4-section SBDC session note format.
 *
 * Uses a direct Anthropic API call (not callClaude) for more robust
 * handling of long-form text responses that may break JSON extraction.
 *
 * POST /api/session-notes/ai-format
 * Body: { rawText: string }
 * Returns: { sections: { description, analysis, actionsTaken, followUp } }
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

const SYSTEM_PROMPT = `You are a session notes formatter for SBDC (Small Business Development Center) counselors.

Your job is to take raw meeting notes, transcripts, or bullet points from a counseling session and organize them into four clearly defined sections. Write in third person, past tense, professional tone. Be thorough but concise.

The four sections are:

1. description — What occurred during the session: who was involved, what was discussed, the client's situation, and what the client shared or requested.

2. analysis — The core business challenge or need the client faces. Explain why it matters and what risks or gaps exist.

3. actionsTaken — The specific advice given, resources shared, steps walked through, and any direct assistance provided during the session.

4. followUp — Concrete next steps for the client and/or counselor before the next session.

IMPORTANT: Return ONLY a valid JSON object with exactly these four keys. No preamble, no explanation, no markdown fences, no extra text. Each value must be a single string (use spaces, not newlines, within each value).

Example format:
{"description":"Met with client to...","analysis":"The client needs to...","actionsTaken":"Reviewed the steps for...","followUp":"Client will verify..."}`;

interface RequestBody {
  rawText: string;
}

interface FormattedSections {
  description: string;
  analysis: string;
  actionsTaken: string;
  followUp: string;
}

// ── Robust JSON extraction ──

function extractSections(text: string): FormattedSections | null {
  // 1. Direct parse
  try {
    const parsed = JSON.parse(text);
    if (parsed.description && parsed.actionsTaken) return parsed;
  } catch {}

  // 2. Markdown code fence
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      const parsed = JSON.parse(fenced[1].trim());
      if (parsed.description && parsed.actionsTaken) return parsed;
    } catch {}
  }

  // 3. Find outermost { ... } — greedy match
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    // Try to fix common JSON issues: unescaped newlines within string values
    let jsonStr = objMatch[0];
    // Replace actual newlines inside string values with spaces
    jsonStr = jsonStr.replace(/(?<=:\s*"[^"]*)\n/g, ' ');
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.description && parsed.actionsTaken) return parsed;
    } catch {}

    // More aggressive: replace all newlines with spaces, then fix the structure
    jsonStr = objMatch[0].replace(/\n/g, ' ').replace(/\s+/g, ' ');
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.description && parsed.actionsTaken) return parsed;
    } catch {}
  }

  // 4. Fallback: extract sections by key names from the text
  const extract = (key: string): string => {
    // Look for patterns like "description": "..." or **description**: ...
    const patterns = [
      new RegExp(`"${key}"\\s*:\\s*"([^"]*(?:\\\\.[^"]*)*)"`, 's'),
      new RegExp(`\\*\\*${key}\\*\\*[:\\s]*(.+?)(?=\\*\\*\\w|$)`, 'si'),
      new RegExp(`${key}[:\\s]+(.+?)(?=\\n\\n|analysis|actionsTaken|followUp|$)`, 'si'),
    ];
    for (const re of patterns) {
      const m = text.match(re);
      if (m?.[1]?.trim()) return m[1].trim();
    }
    return '';
  };

  const description = extract('description');
  const analysis = extract('analysis');
  const actionsTaken = extract('actionsTaken');
  const followUp = extract('followUp');

  if (description || actionsTaken) {
    return { description, analysis, actionsTaken, followUp };
  }

  return null;
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: RequestBody;

  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  if (!body.rawText?.trim()) {
    return Response.json(
      { error: 'rawText is required' },
      { status: 400 },
    );
  }

  if (body.rawText.length > 50000) {
    return Response.json(
      { error: 'rawText exceeds maximum length (50,000 characters)' },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 503 },
    );
  }

  const requestBody = {
    model: MODEL,
    max_tokens: 2048,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: body.rawText.trim() }],
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });

      if (
        (res.status === 429 || res.status === 500 || res.status === 529) &&
        attempt < MAX_RETRIES
      ) {
        const delay = RETRY_DELAY_MS * (attempt + 1);
        console.warn(`[session-notes-format] ${res.status} — retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[session-notes-format] Anthropic API error: ${res.status} ${errText}`);
        return Response.json(
          { error: `AI service returned ${res.status}` },
          { status: 502 },
        );
      }

      const data = await res.json();
      const rawText: string = data.content?.[0]?.text || '';

      if (!rawText) {
        console.warn('[session-notes-format] Empty response from Claude');
        return Response.json(
          { error: 'AI returned an empty response' },
          { status: 500 },
        );
      }

      const sections = extractSections(rawText);
      if (!sections) {
        console.warn('[session-notes-format] Could not extract sections from:', rawText.substring(0, 500));
        return Response.json(
          { error: 'Could not parse AI response into sections. Try again or write sections manually.' },
          { status: 500 },
        );
      }

      return Response.json({ sections });
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.warn('[session-notes-format] Request failed, retrying...');
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(`[session-notes-format] Request failed: ${reason}`);
      return Response.json(
        { error: `AI service unavailable: ${reason}` },
        { status: 502 },
      );
    }
  }

  return Response.json(
    { error: 'Max retries exceeded' },
    { status: 502 },
  );
}
