/**
 * Event Promo Copy — prompt builder for the Marketing Engine.
 * Produces tweet / linkedin / email copy for one event.
 * SBDC_CONTEXT remains the voice authority; this extends it.
 */

import { SBDC_CONTEXT } from './index';
import type { ClaudeRequestOptions } from '../claude';
import type { NormalizedEvent } from '../pipeline/types';

export interface EventPromoOutput {
  tweet: string;
  linkedin: string;
  email: { subject: string; body: string };
}

const PROMO_RULES = `You write event promotion copy for the Northern California SBDC network
("Your Business People"). Voice: plain-spoken, benefit-led, warm but
professional. No hype words (no "amazing", "game-changing", "don't miss out"),
no exclamation-point stacking, no emoji unless the platform norm calls for
exactly one.

Rules that always apply:
- SBDC training is no-cost to the business owner. Say "no-cost", never "free"
  with scare quotes and never "free!" as a hook.
- Lead with what the attendee will be able to DO after the event, not with
  the event's existence.
- Always include: event date, time (with "PT"), and the shortlink provided.
- Never invent details (speakers, credentials, outcomes) not present in the
  source description.
- If the event is in Spanish (language: "es"), write ALL copy in Spanish.
- The shortlink is the only URL that may appear in any copy.`;

export function buildEventPromoPrompt(
  event: NormalizedEvent,
  shortlink: string,
): Pick<ClaudeRequestOptions, 'system' | 'prompt' | 'maxTokens' | 'temperature'> {
  return {
    system: `${SBDC_CONTEXT}\n\n${PROMO_RULES}`,
    maxTokens: 1200,
    temperature: 0.5,
    prompt: `Write promo copy for this event.

EVENT:
- Title: ${event.title}
- Date: ${event.startDate}
- Time: ${event.startTime ?? 'TBD'}${event.endTime ? ` – ${event.endTime}` : ''} PT
- Format: ${event.format ?? 'unknown'}
- Center: ${event.center}
- Language: ${event.language ?? 'en'}
- Shortlink (use exactly this): ${shortlink}
- Description:
${(event.description ?? '(no description available — keep copy generic but accurate)').slice(0, 3000)}

Deliverables (return ONLY a JSON object, no markdown, no preamble):
{
  "tweet":    string — at most 240 characters INCLUDING the shortlink. One clear
              benefit, date/time, shortlink. No hashtag soup — at most one hashtag.
  "linkedin": string — 60-120 words. Structure: hook line (the problem or
              aspiration), 2-3 sentences on what attendees learn, logistics line
              (date, time PT, no-cost), CTA line with the shortlink. Line breaks
              between those blocks. No hashtags in the body; up to three at the
              very end.
  "email":    object { "subject": string, at most 55 characters,
              "body": string — 2-3 sentences plus a one-line CTA with the
              shortlink. Suitable for a Constant Contact block. }
}`,
  };
}

/** Validate + trim the model's output into a safe shape. */
export function sanitizeEventPromo(data: unknown): EventPromoOutput | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const email = d.email as Record<string, unknown> | undefined;
  if (
    typeof d.tweet !== 'string' || !d.tweet.trim() ||
    typeof d.linkedin !== 'string' || !d.linkedin.trim() ||
    !email || typeof email.subject !== 'string' || typeof email.body !== 'string'
  ) {
    return null;
  }
  return {
    tweet: d.tweet.trim().slice(0, 280),
    linkedin: d.linkedin.trim().slice(0, 2000),
    email: {
      subject: email.subject.trim().slice(0, 80),
      body: email.body.trim().slice(0, 1500),
    },
  };
}
