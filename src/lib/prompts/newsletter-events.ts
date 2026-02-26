/**
 * Event Newsletter — prompt builder.
 * Extracted from /src/app/api/newsletter-ai/route.ts
 */

import { SBDC_CONTEXT, type Tone } from './index';
import type { ClaudeRequestOptions } from '../claude';

// ── Types ──

export interface EventNewsletterInput {
  events: {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    registrationUrl: string;
  }[];
  tone?: Tone;
  focusEventIndex?: number;
}

export interface EventNewsletterOutput {
  subjectLine: string;
  preheaderText: string;
  heroTeaser: string;
  eventDescriptions: { title: string; teaser: string }[];
  ctaText: string;
  closingLine: string;
}

// ── Prompt builder ──

export function buildEventNewsletterPrompt(
  input: EventNewsletterInput,
): Pick<ClaudeRequestOptions, 'system' | 'prompt' | 'maxTokens'> {
  const { events, tone = 'professional', focusEventIndex = 0 } = input;
  const focusEvent = events[focusEventIndex] || events[0];

  const eventsDescription = events
    .map(
      (e, i) =>
        `${i + 1}. "${e.title}" — ${e.date} at ${e.time}, ${e.location}. ${e.description}`,
    )
    .join('\n');

  return {
    system: SBDC_CONTEXT,
    prompt: `Write newsletter content for upcoming SBDC events.

EVENTS:
${eventsDescription}

PRIMARY FOCUS EVENT: "${focusEvent.title}"
TONE: ${tone}

Respond with JSON only (no markdown fencing):
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

Guidelines:
- Emphasize that events are FREE and virtual (via Zoom) unless stated otherwise
- Keep language clear, direct, and empowering — not corporate jargon`,
    maxTokens: 1024,
  };
}
