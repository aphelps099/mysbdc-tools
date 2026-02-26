/**
 * Social Media Engine — prompt builder.
 * Generates platform-specific posts from impact data, success stories, or events.
 */

import { SBDC_CONTEXT, type Tone } from './index';
import type { ClaudeRequestOptions } from '../claude';

// ── Types ──

export interface SocialMediaInput {
  source: 'success-story' | 'event' | 'impact-stat' | 'announcement';
  content: string;
  platform: 'linkedin' | 'facebook' | 'twitter';
  tone?: Tone;
  includeHashtags?: boolean;
  variations?: number;
}

export interface SocialMediaPost {
  text: string;
  hashtags: string[];
  characterCount: number;
}

export interface SocialMediaOutput {
  posts: SocialMediaPost[];
}

// ── Prompt builder ──

const CHAR_LIMITS: Record<string, number> = {
  linkedin: 3000,
  facebook: 2000,
  twitter: 280,
};

export function buildSocialMediaPrompt(
  input: SocialMediaInput,
): Pick<ClaudeRequestOptions, 'system' | 'prompt' | 'maxTokens' | 'temperature'> {
  const {
    source,
    content,
    platform,
    tone = 'professional',
    includeHashtags = true,
    variations = 3,
  } = input;

  const charLimit = CHAR_LIMITS[platform] || 3000;

  return {
    system: SBDC_CONTEXT,
    prompt: `Generate ${variations} social media post variations for ${platform}.

SOURCE TYPE: ${source}
CONTENT TO WORK FROM:
${content}

TONE: ${tone}
CHARACTER LIMIT: ${charLimit}
INCLUDE HASHTAGS: ${includeHashtags ? 'yes' : 'no'}

Respond with JSON only (no markdown fencing):
{
  "posts": [
    {
      "text": "The full post text (without hashtags appended)",
      "hashtags": ["#SmallBusiness", "#SBDC"],
      "characterCount": 150
    }
  ]
}

Guidelines:
- Each variation should take a different angle or hook
- ${platform === 'linkedin' ? 'Use line breaks for readability. Lead with a bold opening line. Professional but human.' : ''}
- ${platform === 'twitter' ? 'Be punchy and concise. Every word counts.' : ''}
- ${platform === 'facebook' ? 'Conversational and community-oriented. Can be longer-form.' : ''}
- Include real numbers and outcomes when available
- End with a clear call to action when appropriate
- Hashtags should be relevant to small business, SBDC, and the specific topic`,
    maxTokens: 1500,
    temperature: 0.8,
  };
}
