/**
 * Newsletter Copy — prompt builder.
 * Generates full newsletter body copy (not just event descriptions).
 */

import { SBDC_CONTEXT, type Tone } from './index';
import type { ClaudeRequestOptions } from '../claude';

// ── Types ──

export interface NewsletterCopyInput {
  theme: string;
  highlights: string[];
  cta: string;
  tone?: Tone;
  audienceSegment?: string;
}

export interface NewsletterCopySection {
  heading: string;
  body: string;
}

export interface NewsletterCopyOutput {
  subject: string;
  preheader: string;
  opening: string;
  sections: NewsletterCopySection[];
  closing: string;
}

// ── Prompt builder ──

export function buildNewsletterCopyPrompt(
  input: NewsletterCopyInput,
): Pick<ClaudeRequestOptions, 'system' | 'prompt' | 'maxTokens'> {
  const {
    theme,
    highlights,
    cta,
    tone = 'professional',
    audienceSegment,
  } = input;

  return {
    system: SBDC_CONTEXT,
    prompt: `Write a complete newsletter for NorCal SBDC.

THEME: ${theme}
TONE: ${tone}
${audienceSegment ? `AUDIENCE SEGMENT: ${audienceSegment}` : ''}

KEY HIGHLIGHTS TO COVER:
${highlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

PRIMARY CTA: ${cta}

Respond with JSON only (no markdown fencing):
{
  "subject": "Email subject line (max 60 chars, compelling)",
  "preheader": "Preview text after subject in inbox (max 100 chars)",
  "opening": "1-2 sentence opening paragraph that hooks the reader",
  "sections": [
    {
      "heading": "Section heading (short, active)",
      "body": "1-2 paragraph section body"
    }
  ],
  "closing": "Warm closing paragraph with CTA woven in (2-3 sentences)"
}

Guidelines:
- Create 2-4 sections based on the highlights provided
- Each section should be concise — newsletter readers scan, not read
- The opening should feel personal and timely, not templated
- Weave the CTA naturally into the closing — don't just say "click here"
- Keep total word count under 500`,
    maxTokens: 2048,
  };
}
