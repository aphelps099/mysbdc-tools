import { NextRequest } from 'next/server';
import { callClaude } from '@/lib/claude';
import {
  buildSocialMediaPrompt,
  type SocialMediaInput,
  type SocialMediaOutput,
} from '@/lib/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: SocialMediaInput;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.source || !body.content || !body.platform) {
    return Response.json(
      { error: 'source, content, and platform are required' },
      { status: 400 },
    );
  }

  const promptOptions = buildSocialMediaPrompt(body);
  const result = await callClaude<SocialMediaOutput>({
    ...promptOptions,
    tag: 'social-media',
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ posts: result.data.posts });
}
