import { NextRequest } from 'next/server';
import { callClaude } from '@/lib/claude';
import {
  buildEventNewsletterPrompt,
  type EventNewsletterInput,
  type EventNewsletterOutput,
} from '@/lib/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: EventNewsletterInput;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.events || body.events.length === 0) {
    return Response.json({ error: 'At least one event is required' }, { status: 400 });
  }

  const promptOptions = buildEventNewsletterPrompt(body);
  const result = await callClaude<EventNewsletterOutput>({
    ...promptOptions,
    tag: 'newsletter-events',
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ suggestions: result.data });
}
