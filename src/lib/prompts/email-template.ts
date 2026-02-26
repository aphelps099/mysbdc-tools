/**
 * Email Template — prompt builder.
 * Generates personalized email body copy for different purposes.
 */

import { SBDC_CONTEXT, type Tone } from './index';
import type { ClaudeRequestOptions } from '../claude';

// ── Types ──

export interface EmailTemplateInput {
  purpose: 'welcome' | 'follow-up' | 'milestone' | 'invitation' | 'reengagement';
  recipientContext: string;
  personalData?: Record<string, string>;
  tone?: Tone;
}

export interface EmailTemplateOutput {
  subject: string;
  preheader: string;
  greeting: string;
  body: string;
  cta: string;
  closing: string;
}

// ── Prompt builder ──

export function buildEmailTemplatePrompt(
  input: EmailTemplateInput,
): Pick<ClaudeRequestOptions, 'system' | 'prompt' | 'maxTokens'> {
  const {
    purpose,
    recipientContext,
    personalData = {},
    tone = 'friendly',
  } = input;

  const personalFields = Object.entries(personalData)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  return {
    system: SBDC_CONTEXT,
    prompt: `Write a ${purpose} email for an SBDC client.

PURPOSE: ${purpose}
RECIPIENT CONTEXT: ${recipientContext}
TONE: ${tone}

${personalFields ? `PERSONALIZATION DATA:\n${personalFields}` : ''}

Respond with JSON only (no markdown fencing):
{
  "subject": "Email subject line (max 60 chars)",
  "preheader": "Preview text (max 100 chars)",
  "greeting": "Personal greeting line",
  "body": "2-3 paragraph email body. Use \\n\\n for paragraph breaks.",
  "cta": "Call-to-action text with clear next step",
  "closing": "Warm sign-off (1-2 sentences)"
}

Guidelines:
- ${purpose === 'welcome' ? 'Emphasize the value they just unlocked — free advising, 300+ advisors, confidential support' : ''}
- ${purpose === 'follow-up' ? 'Reference their specific situation. Be helpful, not pushy.' : ''}
- ${purpose === 'milestone' ? 'Celebrate their achievement! Use their numbers to show impact.' : ''}
- ${purpose === 'invitation' ? 'Make the event feel valuable and relevant to their business stage.' : ''}
- ${purpose === 'reengagement' ? 'Acknowledge the gap warmly. Lead with what is new or available.' : ''}
- Use personalization data naturally — do not just template-insert names mechanically
- Keep total body under 200 words — respect their inbox
- The CTA should be a single clear action, not multiple asks`,
    maxTokens: 1024,
  };
}
