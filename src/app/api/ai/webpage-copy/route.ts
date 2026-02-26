import { NextRequest } from 'next/server';
import { callClaude } from '@/lib/claude';
import {
  buildWebpageCopyPrompt,
  type WebpageCopyInput,
  type WebpageCopyOutput,
} from '@/lib/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: WebpageCopyInput;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.pageType || !body.context) {
    return Response.json(
      { error: 'pageType and context are required' },
      { status: 400 },
    );
  }

  const promptOptions = buildWebpageCopyPrompt(body);
  const result = await callClaude<WebpageCopyOutput>({
    ...promptOptions,
    tag: 'webpage-copy',
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ copy: result.data });
}
