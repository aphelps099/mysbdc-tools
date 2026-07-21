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
const BACKDROPS = new Set([
  'none', 'grid', 'starburst', 'ring', 'arc',
  'hero-ring', 'star', 'hero',
  'spirograph', 'escher', 'dot-wave', 'wave-field', 'growth-bars', 'rounds', 'tfg-type',
]);

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
      backdrop: typeof s.backdrop === 'string' && BACKDROPS.has(s.backdrop) ? s.backdrop : undefined,
      serifTitle: typeof s.serifTitle === 'boolean' ? s.serifTitle : undefined,
      durationMs: typeof s.durationMs === 'number' && Number.isFinite(s.durationMs)
        ? Math.round(Math.min(10000, Math.max(1500, s.durationMs)))
        : undefined,
    }));
}

// ── URL mode: fetch a training/event page server-side ──

const BLOCKED_HOSTS = /^(localhost|127\.|0\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|\[::1\])/i;

function extractPageText(html: string): { title: string; text: string } {
  const title =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1] ??
    html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '';
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)?.[1] ??
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i)?.[1] ?? '';

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(nav|footer|header|aside)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*/g, '\n')
    .trim();

  return {
    title: title.trim(),
    text: [title, description, text].filter(Boolean).join('\n').slice(0, 12000),
  };
}

async function fetchPage(rawUrl: string): Promise<{ title: string; text: string; url: string }> {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error('That does not look like a valid URL');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Only http(s) URLs are supported');
  }
  if (BLOCKED_HOSTS.test(url.hostname)) {
    throw new Error('That host is not allowed');
  }

  const res = await fetch(url.toString(), {
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SBDC-MotionStudio/1.0)' },
  });
  if (!res.ok) throw new Error(`The page returned ${res.status}`);

  const html = (await res.text()).slice(0, 1_500_000);
  const { title, text } = extractPageText(html);
  if (text.length < 80) throw new Error('Could not extract readable text from that page');
  return { title, text, url: url.toString() };
}

export async function POST(req: NextRequest) {
  let body: MotionScenesInput & { url?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let pageTitle = '';
  if (body.url && typeof body.url === 'string') {
    try {
      const page = await fetchPage(body.url);
      pageTitle = page.title;
      body.script = page.text;
      body.source = 'webpage';
      body.pageUrl = page.url;
    } catch (e) {
      return Response.json(
        { error: e instanceof Error ? e.message : 'Failed to fetch the page' },
        { status: 400 },
      );
    }
  }

  if (!body.script || typeof body.script !== 'string' || !body.script.trim()) {
    return Response.json({ error: 'script or url is required' }, { status: 400 });
  }
  if (body.script.length > 40000) {
    return Response.json({ error: 'Script is too long (40k character max)' }, { status: 400 });
  }
  if (body.brand !== undefined && body.brand !== 'sbdc' && body.brand !== 'tfg') {
    body.brand = undefined;
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

  return Response.json({ scenes, pageTitle: pageTitle || undefined });
}
