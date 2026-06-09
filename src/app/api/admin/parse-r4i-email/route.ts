/**
 * POST /api/admin/parse-r4i-email — AI-parse a pasted application email
 * into the R4I form schema.
 *
 * Body: { text: string }
 * Response: { success: true, data: { ...form fields }, usage } | { success: false, error }
 */

import { NextRequest } from 'next/server';
import { callClaude } from '@/lib/claude';
import { R4I_PARSE_SYSTEM, buildR4iParsePrompt } from '@/lib/prompts/r4i-email-parse';

export const dynamic = 'force-dynamic';

const MAX_TEXT_LENGTH = 30_000;

export async function POST(req: NextRequest): Promise<Response> {
  let body: { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) {
    return Response.json(
      { success: false, error: 'Paste the email text first' },
      { status: 400 },
    );
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return Response.json(
      { success: false, error: `Text too long (${text.length} chars, max ${MAX_TEXT_LENGTH})` },
      { status: 413 },
    );
  }

  const result = await callClaude<Record<string, unknown>>({
    system: R4I_PARSE_SYSTEM,
    prompt: buildR4iParsePrompt(text),
    temperature: 0,
    maxTokens: 2048,
    tag: 'parse-r4i-email',
  });

  if (!result.ok) {
    return Response.json(
      { success: false, error: result.error },
      { status: result.status },
    );
  }

  if (!result.data || typeof result.data !== 'object' || Array.isArray(result.data)) {
    return Response.json(
      { success: false, error: 'AI did not return a JSON object' },
      { status: 500 },
    );
  }

  return Response.json({
    success: true,
    data: result.data,
    usage: result.usage,
  });
}
