/**
 * AI-powered session notes formatter.
 *
 * Accepts raw text (meeting notes, transcript, etc.) and uses Claude
 * to structure it into the standard 4-section SBDC session note format.
 *
 * POST /api/session-notes/ai-format
 * Body: { rawText: string }
 * Returns: { sections: { description, analysis, actionsTaken, followUp } }
 */

import { NextRequest } from 'next/server';
import { callClaude } from '@/lib/claude';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are a session notes formatter for SBDC (Small Business Development Center) counselors.

Your job is to take raw meeting notes, transcripts, or bullet points from a counseling session and organize them into four clearly defined sections. Write in third person, past tense, professional tone. Be thorough but concise.

The four sections are:

1. **Description of what occurred in the session** — A narrative summary of the meeting: who was involved, what was discussed, what the client's situation is, and what the client shared or requested.

2. **Analysis of the problem to be solved** — Identify the core business challenge or need the client faces. Explain why it matters and what risks or gaps exist.

3. **Actions taken to solve the problem identified** — Detail the specific advice given, resources shared, steps walked through, and any direct assistance provided during the session.

4. **Follow-up action to be taken before the next session** — List concrete next steps for the client and/or counselor. Include what will be covered in the next session if mentioned.

Return a JSON object with exactly these keys:
{
  "description": "...",
  "analysis": "...",
  "actionsTaken": "...",
  "followUp": "..."
}

Each value should be a complete paragraph (not bullet points). If the raw input doesn't contain enough information for a section, write what you can based on available context and note what's unclear.`;

interface RequestBody {
  rawText: string;
}

interface FormattedSections {
  description: string;
  analysis: string;
  actionsTaken: string;
  followUp: string;
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

  const result = await callClaude<FormattedSections>({
    system: SYSTEM_PROMPT,
    prompt: body.rawText.trim(),
    maxTokens: 2048,
    temperature: 0.3,
    tag: 'session-notes-format',
  });

  if (!result.ok) {
    return Response.json(
      { error: result.error },
      { status: result.status },
    );
  }

  // Validate the response has all four sections
  const sections = result.data;
  if (
    !sections.description ||
    !sections.analysis ||
    !sections.actionsTaken ||
    !sections.followUp
  ) {
    return Response.json(
      { error: 'AI response missing one or more sections' },
      { status: 500 },
    );
  }

  return Response.json({ sections });
}
