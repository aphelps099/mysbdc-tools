/**
 * Fetch an event page server-side and return its readable text, so the
 * teaser builder (public/brand/video/teaser-builder.html) can auto-fill
 * event details from a pasted URL without hitting browser CORS limits.
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_CHARS = 20000;

function isAllowedUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase();
  // Block obvious internal targets (SSRF guard)
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(host) ||
    host.includes(':')
  ) {
    return null;
  }
  return url;
}

function htmlToText(html: string): { title: string; text: string } {
  const title =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ??
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.trim() ??
    '';
  const text = html
    .replace(/<(script|style|noscript|svg|head)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*/g, '\n')
    .trim();
  const decode = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
  return { title: decode(title), text: text.slice(0, MAX_CHARS) };
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url') ?? '';
  const url = isAllowedUrl(raw);
  if (!url) {
    return Response.json({ error: 'Provide a valid public http(s) URL via ?url=' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SBDC-TeaserBuilder/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) {
      return Response.json({ error: `Page returned ${res.status}` }, { status: 502 });
    }
    const html = (await res.text()).slice(0, 2_000_000);
    return Response.json({ ok: true, url: url.toString(), ...htmlToText(html) });
  } catch {
    return Response.json({ error: 'Could not fetch that URL (timeout or network error)' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
