import { NextRequest } from 'next/server';
import { callClaude } from '@/lib/claude';
import {
  buildEmailTemplatePrompt,
  type EmailTemplateInput,
  type EmailTemplateOutput,
} from '@/lib/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: EmailTemplateInput;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.purpose || !body.recipientContext) {
    return Response.json(
      { error: 'purpose and recipientContext are required' },
      { status: 400 },
    );
  }

  const promptOptions = buildEmailTemplatePrompt(body);
  const result = await callClaude<EmailTemplateOutput>({
    ...promptOptions,
    tag: 'email-template',
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ email: result.data });
}
