import { NextRequest } from 'next/server';
import { callClaude } from '@/lib/claude';
import {
  buildMotionScenesPrompt,
  type MotionScenesInput,
  type MotionScenesOutput,
  type GeneratedScene,
} from '@/lib/prompts';

export const dynamic = 'force-dynamic';

const TEMPLATES = new Set(['title', 'statement', 'stat', 'list', 'quote', 'image', 'endcard']);
const ANIMS = new Set(['rise', 'word-stagger', 'letter-cascade', 'typewriter', 'wipe', 'blur-in', 'scale-in', 'mask-reveal']);
const SCHEMES = new Set(['navy', 'cream', 'royal', 'dark', 'white']);
const ALIGNS = new Set(['center', 'lower-left', 'lower-center']);

/** Drop anything malformed so the editor only ever receives loadable scenes. */
function sanitize(scenes: GeneratedScene[]): GeneratedScene[] {
  return scenes
    .filter((s) => s && typeof s === 'object' && TEMPLATES.has(s.template))
    .slice(0, 16)
    .map((s) => ({
      template: s.template,
      kicker: typeof s.kicker === 'string' ? s.kicker.slice(0, 80) : undefined,
      title: typeof s.title === 'string' ? s.title.slice(0, 200) : undefined,
      subtitle: typeof s.subtitle === 'string' ? s.subtitle.slice(0, 200) : undefined,
      body: typeof s.body === 'string' ? s.body.slice(0, 400) : undefined,
      attribution: typeof s.attribution === 'string' ? s.attribution.slice(0, 120) : undefined,
      statPrefix: typeof s.statPrefix === 'string' ? s.statPrefix.slice(0, 8) : undefined,
      statValue: typeof s.statValue === 'number' && Number.isFinite(s.statValue) ? s.statValue : undefined,
      statSuffix: typeof s.statSuffix === 'string' ? s.statSuffix.slice(0, 8) : undefined,
      anim: typeof s.anim === 'string' && ANIMS.has(s.anim) ? s.anim : undefined,
      align: typeof s.align === 'string' && ALIGNS.has(s.align) ? s.align : undefined,
      scheme: typeof s.scheme === 'string' && SCHEMES.has(s.scheme) ? s.scheme : undefined,
      serifTitle: typeof s.serifTitle === 'boolean' ? s.serifTitle : undefined,
      durationMs: typeof s.durationMs === 'number' && Number.isFinite(s.durationMs)
        ? Math.round(Math.min(10000, Math.max(1500, s.durationMs)))
        : undefined,
    }));
}

export async function POST(req: NextRequest) {
  let body: MotionScenesInput;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.script || typeof body.script !== 'string' || !body.script.trim()) {
    return Response.json({ error: 'script is required' }, { status: 400 });
  }
  if (body.script.length > 40000) {
    return Response.json({ error: 'Script is too long (40k character max)' }, { status: 400 });
  }

  const promptOptions = buildMotionScenesPrompt(body);
  const result = await callClaude<MotionScenesOutput>({
    ...promptOptions,
    tag: 'motion-scenes',
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const scenes = sanitize(Array.isArray(result.data.scenes) ? result.data.scenes : []);
  if (scenes.length === 0) {
    return Response.json({ error: 'The AI returned no usable scenes — try a shorter or clearer script.' }, { status: 500 });
  }

  return Response.json({ scenes });
}
