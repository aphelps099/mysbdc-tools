/**
 * Webpage Copy — prompt builder.
 * Generates landing page headlines, body copy, CTAs, and meta descriptions.
 */

import { SBDC_CONTEXT, type Tone } from './index';
import type { ClaudeRequestOptions } from '../claude';

// ── Types ──

export interface WebpageCopyInput {
  pageType: 'landing' | 'service' | 'about' | 'program';
  context: string;
  keywords?: string[];
  tone?: Tone;
}

export interface WebpageCopyOutput {
  headline: string;
  subheadline: string;
  bodyParagraphs: string[];
  ctaButton: string;
  metaDescription: string;
}

// ── Prompt builder ──

export function buildWebpageCopyPrompt(
  input: WebpageCopyInput,
): Pick<ClaudeRequestOptions, 'system' | 'prompt' | 'maxTokens' | 'temperature'> {
  const { pageType, context, keywords = [], tone = 'professional' } = input;

  return {
    system: SBDC_CONTEXT,
    prompt: `Write web copy for a ${pageType} page on the NorCal SBDC website.

PAGE CONTEXT:
${context}

TONE: ${tone}
${keywords.length > 0 ? `SEO KEYWORDS TO INCORPORATE: ${keywords.join(', ')}` : ''}

Respond with JSON only (no markdown fencing):
{
  "headline": "Primary headline (max 70 chars, clear value proposition)",
  "subheadline": "Supporting subheadline (max 120 chars)",
  "bodyParagraphs": [
    "Paragraph 1 — the hook / problem statement",
    "Paragraph 2 — the solution / what we offer",
    "Paragraph 3 — proof / social proof or stats"
  ],
  "ctaButton": "CTA button text (max 25 chars, action-oriented)",
  "metaDescription": "SEO meta description (max 155 chars)"
}

Guidelines:
- The headline should pass the "billboard test" — clear in 3 seconds
- Body paragraphs should be 2-3 sentences each, scannable
- Naturally incorporate keywords if provided — never stuff them
- The CTA should be specific ("Get Your Free Advisor" not "Learn More")
- Meta description should include the primary keyword and a value prop`,
    maxTokens: 1024,
    temperature: 0.6,
  };
}
