import { NextRequest } from 'next/server';
import { callClaude } from '@/lib/claude';
import {
  buildNewsletterCopyPrompt,
  type NewsletterCopyInput,
  type NewsletterCopyOutput,
} from '@/lib/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: NewsletterCopyInput;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.theme || !body.highlights?.length || !body.cta) {
    return Response.json(
      { error: 'theme, highlights (non-empty), and cta are required' },
      { status: 400 },
    );
  }

  const promptOptions = buildNewsletterCopyPrompt(body);
  const result = await callClaude<NewsletterCopyOutput>({
    ...promptOptions,
    tag: 'newsletter-copy',
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ copy: result.data });
}
