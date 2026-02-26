import { NextRequest } from 'next/server';
import { callClaude } from '@/lib/claude';
import {
  buildSuccessStoryPrompt,
  type SuccessStoryInput,
  type SuccessStoryOutput,
} from '@/lib/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: SuccessStoryInput;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.businessName || !body.ownerName || !body.format) {
    return Response.json(
      { error: 'businessName, ownerName, and format are required' },
      { status: 400 },
    );
  }

  const promptOptions = buildSuccessStoryPrompt(body);
  const result = await callClaude<SuccessStoryOutput>({
    ...promptOptions,
    tag: 'success-story',
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ story: result.data });
}
