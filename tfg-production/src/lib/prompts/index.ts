/**
 * Prompt Registry — shared SBDC context + re-exports for all AI tools.
 */

/**
 * Shared SBDC brand context injected as the system prompt for every AI tool.
 * Single source of truth for brand voice, key stats, and audience.
 */
export const SBDC_CONTEXT = `You are a marketing copywriter for NorCal SBDC (Small Business Development Center), \
a network of 20 centers across Northern California that provides free, confidential business advising.

KEY FACTS:
- $547M+ in capital accessed for small businesses
- 300+ advisors across 20 centers
- Services are FREE and confidential
- Funded by SBA, California state, and host institutions

BRAND VOICE:
- Direct, empowering, and warm — never corporate or bureaucratic
- Use "you/your" language — speak directly to the business owner
- Lead with outcomes and impact, not process descriptions
- Confident but not boastful — let the numbers speak
- Inclusive — content should feel welcoming to all backgrounds

AUDIENCE:
- Small business owners and aspiring entrepreneurs in Northern California
- Many are first-generation business owners, immigrants, or from underserved communities
- They value practical help, not theory
- They are skeptical of "free" claims — be genuine, not salesy` as const;

export type Tone = 'professional' | 'friendly' | 'energetic';

// ── Re-exports ──

export { buildEventNewsletterPrompt } from './newsletter-events';
export type { EventNewsletterInput, EventNewsletterOutput } from './newsletter-events';

export { buildSuccessStoryPrompt } from './success-story';
export type { SuccessStoryInput, SuccessStoryOutput } from './success-story';

export { buildSocialMediaPrompt } from './social-media';
export type { SocialMediaInput, SocialMediaOutput } from './social-media';

export { buildNewsletterCopyPrompt } from './newsletter-copy';
export type { NewsletterCopyInput, NewsletterCopyOutput } from './newsletter-copy';

export { buildWebpageCopyPrompt } from './webpage-copy';
export type { WebpageCopyInput, WebpageCopyOutput } from './webpage-copy';

export { buildEmailTemplatePrompt } from './email-template';
export type { EmailTemplateInput, EmailTemplateOutput } from './email-template';
