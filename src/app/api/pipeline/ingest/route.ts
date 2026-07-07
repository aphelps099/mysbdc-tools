import { NextRequest } from 'next/server';
import { requirePipelineAuth } from '@/lib/pipeline/auth';
import { isValidNormalizedEvent } from '@/lib/pipeline/types';

/**
 * Phase 0 stub — a target for future push-based event sources
 * (e.g. a lead-site webhook after the redesign). Validates the
 * payload and acknowledges; processing arrives with that source.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const denied = requirePipelineAuth(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!isValidNormalizedEvent(body)) {
    return Response.json(
      { error: 'Payload is not a valid NormalizedEvent (need slug, title, detailUrl, center, startDate)' },
      { status: 422 },
    );
  }

  return Response.json({ accepted: true, slug: body.slug }, { status: 202 });
}
