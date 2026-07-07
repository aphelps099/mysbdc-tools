import { NextRequest } from 'next/server';

/**
 * Same-origin proxy for official brand images (logos on norcalsbdc.org).
 * Canvas rendering + MP4 export require same-origin images — drawing a
 * cross-origin logo would taint the canvas and kill export — so the
 * studios load remote brand marks through this route.
 * Host-allowlisted; not a general proxy.
 */

export const dynamic = 'force-dynamic';

const ALLOWED_HOSTS = new Set(['www.norcalsbdc.org', 'norcalsbdc.org']);

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get('src');
  if (!src) return new Response('src required', { status: 400 });

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return new Response('bad url', { status: 400 });
  }
  if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname)) {
    return new Response('host not allowed', { status: 403 });
  }

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return new Response(`upstream ${res.status}`, { status: 502 });
    const type = res.headers.get('content-type') ?? 'image/png';
    if (!type.startsWith('image/')) return new Response('not an image', { status: 502 });
    return new Response(res.body, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return new Response('fetch failed', { status: 502 });
  }
}
