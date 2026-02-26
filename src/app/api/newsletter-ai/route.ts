/**
 * Newsletter AI — Generates teaser text, subject lines, and layout suggestions
 * for SBDC event newsletters using the Anthropic Claude API.
 *
 * Requires ANTHROPIC_API_KEY env var.
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

interface EventInput {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  registrationUrl: string;
}

interface GenerateRequest {
  events: EventInput[];
  tone?: 'professional' | 'friendly' | 'energetic';
  focusEventIndex?: number;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY not configured. AI features are unavailable — you can still build newsletters manually.' },
      { status: 503 },
    );
  }

  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { events, tone = 'professional', focusEventIndex = 0 } = body;

  if (!events || events.length === 0) {
    return Response.json({ error: 'At least one event is required' }, { status: 400 });
  }

  const eventsDescription = events
    .map((e, i) => `${i + 1}. "${e.title}" — ${e.date} at ${e.time}, ${e.location}. ${e.description}`)
    .join('\n');

  const focusEvent = events[focusEventIndex] || events[0];

  const prompt = `You are a marketing copywriter for NorCal SBDC (Small Business Development Center). Write newsletter content for upcoming events.

EVENTS:
${eventsDescription}

PRIMARY FOCUS EVENT: "${focusEvent.title}"

TONE: ${tone}

Generate the following as JSON (no markdown fencing):
{
  "subjectLine": "Email subject line (max 60 chars, compelling, action-oriented)",
  "preheaderText": "Preview text that appears after subject in inbox (max 100 chars)",
  "heroTeaser": "2-3 sentence compelling teaser for the primary focus event. Should make readers want to register immediately. Address small business owners directly.",
  "eventDescriptions": [
    {
      "title": "event title",
      "teaser": "One compelling sentence about this event (max 120 chars)"
    }
  ],
  "ctaText": "Call-to-action button text (max 25 chars)",
  "closingLine": "Brief closing line encouraging engagement (max 80 chars)"
}

Important guidelines:
- Write for small business owners in Northern California
- Emphasize that events are FREE and virtual (via Zoom) unless stated otherwise
- Reference NorCal SBDC's track record ($547M in capital accessed, 300+ advisors)
- Keep language clear, direct, and empowering — not corporate jargon
- Use "you/your" language, speak directly to the business owner`;

  try {
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[newsletter-ai] Anthropic API error: ${res.status} ${errText}`);
      return Response.json(
        { error: `AI service returned ${res.status}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';

    // Parse the JSON response from Claude
    let parsed;
    try {
      // Try to extract JSON from the response (Claude sometimes wraps in markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    } catch {
      return Response.json(
        { error: 'Failed to parse AI response', raw: text },
        { status: 500 },
      );
    }

    return Response.json({ suggestions: parsed });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[newsletter-ai] Request failed: ${reason}`);
    return Response.json(
      { error: `AI service unavailable: ${reason}` },
      { status: 502 },
    );
  }
}
