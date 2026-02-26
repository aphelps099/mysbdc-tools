/**
 * Success Story Formatter — prompt builder.
 * Turns milestone data into polished narratives.
 */

import { SBDC_CONTEXT, type Tone } from './index';
import type { ClaudeRequestOptions } from '../claude';

// ── Types ──

export interface SuccessStoryInput {
  businessName: string;
  ownerName: string;
  milestones: {
    jobsCreated?: { fullTime: number; partTime: number };
    capitalAccessed?: { amount: number; sources: string[] };
    revenueGrowth?: { initial: number; current: number };
    businessStarted?: boolean;
  };
  testimonial?: string;
  tone?: Tone;
  format: 'narrative' | 'bullet-summary' | 'press-release';
}

export interface SuccessStoryOutput {
  headline: string;
  summary: string;
  body: string;
  pullQuote: string | null;
  impactStats: string[];
  suggestedTags: string[];
}

// ── Prompt builder ──

export function buildSuccessStoryPrompt(
  input: SuccessStoryInput,
): Pick<ClaudeRequestOptions, 'system' | 'prompt' | 'maxTokens' | 'temperature'> {
  const {
    businessName,
    ownerName,
    milestones,
    testimonial,
    tone = 'professional',
    format,
  } = input;

  const bullets: string[] = [];
  if (milestones.jobsCreated) {
    bullets.push(
      `Jobs created: ${milestones.jobsCreated.fullTime} full-time, ${milestones.jobsCreated.partTime} part-time`,
    );
  }
  if (milestones.capitalAccessed) {
    bullets.push(
      `Capital accessed: $${milestones.capitalAccessed.amount.toLocaleString()} from ${milestones.capitalAccessed.sources.join(', ')}`,
    );
  }
  if (milestones.revenueGrowth) {
    const pct = Math.round(
      ((milestones.revenueGrowth.current - milestones.revenueGrowth.initial) /
        milestones.revenueGrowth.initial) *
        100,
    );
    bullets.push(
      `Revenue growth: $${milestones.revenueGrowth.initial.toLocaleString()} → $${milestones.revenueGrowth.current.toLocaleString()} (${pct}% increase)`,
    );
  }
  if (milestones.businessStarted) {
    bullets.push('New business started with SBDC guidance');
  }

  return {
    system: SBDC_CONTEXT,
    prompt: `Write a ${format} success story for an SBDC client.

BUSINESS: ${businessName}
OWNER: ${ownerName}
TONE: ${tone}

MILESTONES:
${bullets.map((b) => `- ${b}`).join('\n')}

${testimonial ? `CLIENT TESTIMONIAL: "${testimonial}"` : ''}

Respond with JSON only (no markdown fencing):
{
  "headline": "Compelling headline (max 80 chars)",
  "summary": "1-2 sentence summary of the impact",
  "body": "2-3 paragraph narrative telling the story",
  "pullQuote": "Key quote from testimonial if provided, otherwise null",
  "impactStats": ["Formatted stat bullet 1", "Stat bullet 2"],
  "suggestedTags": ["#tag1", "#tag2"]
}

Guidelines:
- Lead with the outcome and the human story, not the process
- Use specific numbers — "$250K loan" is better than "significant funding"
- If a testimonial is provided, weave it naturally into the narrative
- Keep the tone genuine — these are real people, real businesses`,
    maxTokens: 1500,
    temperature: 0.7,
  };
}
