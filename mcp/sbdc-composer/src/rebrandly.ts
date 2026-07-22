/* ═══════════════════════════════════════════════════════
   Rebrandly layer for the SBDC Motion Composer.
   Thin wrapper around the Marketing Engine's production
   client (src/lib/pipeline/rebrandly.ts) — slug collision
   retries, 429 backoff, and UTM appending all live there.
   This module adds what the composer needs on top:
   · per-project caching so re-renders never mint duplicates
   · storyboard scanning that rewrites long URLs in scene
     text to the sbdc.events display form
   · a graceful offline mode when no API key is set, so
     previews still work.
   ═══════════════════════════════════════════════════════ */

import { createShortlink, getClicks } from '../../../src/lib/pipeline/rebrandly';
import { slugFromUrl, slashtagFromTitle } from '../../../src/lib/pipeline/slug';
import { Scene } from '../../../src/lib/motion/types';
import { Project, CachedShortlink } from './projects.js';

export { getClicks };

export function hasApiKey(): boolean {
  return !!process.env.REBRANDLY_API_KEY;
}

export function shortDomain(): string {
  return process.env.REBRANDLY_DOMAIN || 'sbdc.events';
}

export const NO_KEY_WARNING =
  'REBRANDLY_API_KEY is not set — shortlinks were not created and URLs were left unchanged. ' +
  'Previews and exports still work; set the key to mint sbdc.events links.';

/**
 * Create (or reuse from the project cache) a shortlink for a long URL.
 * The caller is responsible for saving the project afterwards.
 */
export async function ensureShortlink(
  project: Project,
  url: string,
  title: string,
  slug?: string,
): Promise<{ link: CachedShortlink; cached: boolean }> {
  project.shortlinks ??= {};
  const existing = project.shortlinks[url];
  if (existing) return { link: existing, cached: true };

  const sl = await createShortlink({
    // The shared client derives the slashtag from `title` — pass the
    // explicit slug through it when the caller chose one.
    title: slug || title,
    slug: slugFromUrl(url) || slashtagFromTitle(title),
    detailUrl: url,
  });
  const link: CachedShortlink = {
    ...sl,
    display: `${shortDomain()}/${sl.slashtag}`,
    title,
  };
  project.shortlinks[url] = link;
  return { link, cached: false };
}

// Scene text fields the mapper scans, per the handoff.
const TEXT_FIELDS = ['title', 'subtitle', 'body', 'attribution'] as const;

/** URLs worth shortening: http(s), longer than ~30 chars, not already ours. */
const URL_RE = /https?:\/\/[^\s"'<>()\[\]]+/g;
const MIN_URL_LENGTH = 30;

function scanText(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.match(URL_RE) ?? []) {
    const url = raw.replace(/[.,;:!?]+$/, ''); // trailing sentence punctuation
    if (url.length <= MIN_URL_LENGTH) continue;
    try {
      if (new URL(url).hostname === shortDomain()) continue;
    } catch {
      continue;
    }
    out.push(url);
  }
  return out;
}

export interface Rewrite {
  sceneIndex: number;
  field: string;
  url: string;
  display: string;
  shortlink: string;
  cached: boolean;
}

/**
 * Scan every scene's text for long URLs, create/reuse shortlinks, and
 * rewrite the text in place with the display form ("sbdc.events/slug",
 * no scheme — matching how TFG cards render "techfuturesgroup.org").
 * Returns the before/after report. Mutates project (caller saves).
 */
export async function mapShortlinks(project: Project): Promise<{
  rewrites: Rewrite[];
  warnings: string[];
}> {
  const rewrites: Rewrite[] = [];
  const warnings: string[] = [];

  for (let i = 0; i < project.doc.scenes.length; i++) {
    const scene = project.doc.scenes[i];
    for (const field of TEXT_FIELDS) {
      const text = scene[field as keyof Scene] as string;
      if (!text || typeof text !== 'string') continue;
      let next = text;
      for (const url of scanText(text)) {
        if (!hasApiKey()) {
          if (!warnings.includes(NO_KEY_WARNING)) warnings.push(NO_KEY_WARNING);
          continue;
        }
        try {
          const title = scene.title?.trim() || scene.kicker?.trim() || project.name;
          const { link, cached } = await ensureShortlink(project, url, title);
          next = next.split(url).join(link.display);
          rewrites.push({
            sceneIndex: i, field, url,
            display: link.display, shortlink: link.shortlink, cached,
          });
        } catch (e) {
          warnings.push(
            `Scene ${i} ${field}: shortlink failed for ${url} — ${e instanceof Error ? e.message : e}. URL left unchanged.`,
          );
        }
      }
      if (next !== text) (scene as unknown as Record<string, unknown>)[field] = next;
    }
  }
  return { rewrites, warnings };
}
