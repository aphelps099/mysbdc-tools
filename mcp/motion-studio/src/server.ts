/* ═══════════════════════════════════════════════════════
   TFG Motion Studio MCP server (stdio).
   Author, preview, and export TFG brand videos from an
   MCP client (e.g. Claude Code) — no browser UI, no login.
   Rendering runs the repo's real engine in headless
   Chromium, so exports match the web studio exactly.
   ═══════════════════════════════════════════════════════ */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { docDuration } from '../../../src/lib/motion/types';
import { GUIDE } from './guide.js';
import { tfgScene, patchScene, tfgDefaultDoc, TFG_SCHEMES, SceneInput } from './tfg.js';
import {
  listProjects, loadProject, saveProject, projectExists, Project, OUT_DIR, AssetKind,
} from './projects.js';
import { RenderBackend, docTimes } from './browser.js';
import { normalizeToH264 } from './transcode.js';

const backend = new RenderBackend();

const server = new McpServer({
  name: 'tfg-motion-studio',
  version: '0.1.0',
});

// ── Zod pieces ────────────────────────────────────────

const templateEnum = z.enum([
  'title', 'statement', 'stat', 'list', 'quote', 'image', 'video', 'disclaimer', 'endcard',
]);
const animEnum = z.enum([
  'rise', 'word-stagger', 'letter-cascade', 'typewriter', 'wipe', 'blur-in', 'scale-in', 'mask-reveal',
]);
const transitionEnum = z.enum(['cut', 'fade', 'wipe', 'slide']);
const alignEnum = z.enum(['center', 'lower-left', 'lower-center', 'lower-right']);
const backdropEnum = z.enum([
  'none', 'grid', 'starburst', 'ring', 'arc',
  'hero-ring', 'star', 'hero',
  'split-left', 'split-right', 'split-bottom',
  'spirograph', 'escher', 'dot-wave', 'wave-field', 'growth-bars', 'rounds', 'tfg-type',
]);
const kenBurnsEnum = z.enum(['none', 'zoom-in', 'zoom-out', 'pan-left', 'pan-right']);
const overlayEnum = z.enum(['none', 'scrim', 'gradient-bottom', 'gradient-left', 'gradient-right', 'brand']);
const aspectEnum = z.enum(['16:9', '1:1', '9:16', '4:5']);
const tfgSchemeEnum = z.enum(['dark', 'charcoal', 'green', 'cream', 'white']);

const sceneFields = {
  duration: z.number().min(1000).max(20000).optional().describe('Scene length in ms (2500–5000 typical)'),
  tfgScheme: tfgSchemeEnum.optional().describe('TFG color scheme (default "dark")'),
  customScheme: z.object({ bg: z.string(), fg: z.string(), accent: z.string() }).nullable().optional()
    .describe('Explicit hex colors — overrides tfgScheme'),
  anim: animEnum.optional().describe('Text entrance animation'),
  transition: transitionEnum.optional().describe('Transition INTO this scene'),
  align: alignEnum.optional(),
  backdrop: backdropEnum.optional().describe('Brand graphic behind text (non-media scenes)'),
  weird: z.boolean().optional().describe('Pattern-Studio weird mode: denser/faster backdrop with wobble; auto-picks a pattern if backdrop unset'),
  serifTitle: z.boolean().optional().describe('Tobias serif for the main line'),
  textScale: z.number().min(0.3).max(1).optional().describe('Shrink long titles/URLs to fit'),
  kicker: z.string().max(80).optional().describe('Small caps label above the title'),
  title: z.string().max(220).optional(),
  subtitle: z.string().max(220).optional(),
  body: z.string().max(600).optional().describe('List lines (newline separated) / fine print'),
  attribution: z.string().max(140).optional().describe('Quote attribution / stat label'),
  logoText: z.string().max(40).optional().describe('Endcard: animated vector lockup words (ring draws in, words rise). TFG default "TECH FUTURES GROUP"; pass "" for the static raster logo'),
  statPrefix: z.string().max(8).optional(),
  statValue: z.number().optional(),
  statSuffix: z.string().max(8).optional(),
  imageId: z.string().nullable().optional().describe('Registered image asset id (image scenes)'),
  imageLayout: z.enum(['full', 'card']).optional().describe('"full" = photo fills the frame; "card" = inset portrait frame on the scheme background with text below (presenter cards)'),
  kenBurns: kenBurnsEnum.optional(),
  overlay: overlayEnum.optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  videoId: z.string().nullable().optional().describe('Registered video asset id (video scenes)'),
  videoTrimStart: z.number().min(0).optional().describe('Offset into the source clip (ms)'),
  videoMuted: z.boolean().optional(),
  videoVolume: z.number().min(0).max(1).optional(),
};

const sceneInputSchema = z.object({ template: templateEnum, ...sceneFields });

// ── Helpers ───────────────────────────────────────────

function ok(payload: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }] };
}

function fail(message: string) {
  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true,
  };
}

function summarize(p: Project) {
  return {
    name: p.name,
    aspect: p.doc.aspect,
    fps: p.doc.fps,
    durationMs: docDuration(p.doc),
    fonts: { heading: p.doc.fontHeading, body: p.doc.fontBody },
    music: p.doc.audioId ? { assetId: p.doc.audioId, volume: p.doc.audioVolume } : null,
    assets: p.assets.map((a) => ({ id: a.id, kind: a.kind, name: a.name })),
    scenes: p.doc.scenes.map((s, i) => ({
      index: i,
      template: s.template,
      duration: s.duration,
      title: s.title || undefined,
      kicker: s.kicker || undefined,
      scheme: s.customScheme,
    })),
  };
}

function checkAssetRefs(p: Project): string[] {
  const ids = new Set(p.assets.map((a) => a.id));
  const warnings: string[] = [];
  p.doc.scenes.forEach((s, i) => {
    if (s.imageId && !ids.has(s.imageId)) {
      warnings.push(`Scene ${i} references imageId "${s.imageId}" but no such asset is registered — the scene renders without the photo.`);
    }
    if (s.videoId && !ids.has(s.videoId)) {
      warnings.push(`Scene ${i} references videoId "${s.videoId}" but no such asset is registered — the scene renders without the clip.`);
    }
  });
  return warnings;
}

// ── Tools ─────────────────────────────────────────────

server.registerTool(
  'motion_guide',
  {
    description:
      'Read this FIRST. The authoring guide for TFG Motion Studio videos: workflow, scene templates and their fields, TFG brand schemes/voice, pacing recipes.',
    annotations: { readOnlyHint: true },
  },
  async () => ({ content: [{ type: 'text', text: GUIDE }] }),
);

server.registerTool(
  'motion_create_project',
  {
    description:
      'Create a new TFG motion project (Tobias + GT America Extended, TFG dark scheme). Optionally pass the full storyboard as scenes[]. Fails if the name is taken — pick a new name or use motion_set_scenes to rework an existing project.',
    inputSchema: {
      name: z.string().describe('Project id, e.g. "demo-day-reel" (letters/digits/dashes)'),
      aspect: aspectEnum.optional().describe('Canvas preset — default "16:9". Use "9:16" for Reels/Stories.'),
      scenes: z.array(sceneInputSchema).max(24).optional().describe('Initial storyboard (see motion_guide)'),
    },
  },
  async ({ name, aspect, scenes }) => {
    if (projectExists(name)) return fail(`Project "${name}" already exists — choose another name, or edit it with motion_set_scenes / motion_update_scene.`);
    const doc = tfgDefaultDoc();
    if (aspect) doc.aspect = aspect;
    doc.scenes = (scenes ?? []).map((s) => tfgScene(s as SceneInput));
    const project: Project = {
      name, doc, assets: [], created: new Date().toISOString(), updated: new Date().toISOString(),
    };
    saveProject(project);
    return ok({ created: true, ...summarize(project), warnings: checkAssetRefs(project) });
  },
);

server.registerTool(
  'motion_list_projects',
  { description: 'List existing motion projects.', annotations: { readOnlyHint: true } },
  async () => ok(listProjects()),
);

server.registerTool(
  'motion_get_project',
  {
    description: 'Full state of a project: doc settings, assets, and every scene with all fields.',
    inputSchema: { name: z.string() },
    annotations: { readOnlyHint: true },
  },
  async ({ name }) => {
    const p = loadProject(name);
    return ok({ ...p, durationMs: docDuration(p.doc) });
  },
);

server.registerTool(
  'motion_set_scenes',
  {
    description: 'Replace the project\'s entire storyboard with a new scene list.',
    inputSchema: {
      name: z.string(),
      scenes: z.array(sceneInputSchema).min(1).max(24),
    },
  },
  async ({ name, scenes }) => {
    const p = loadProject(name);
    p.doc.scenes = scenes.map((s) => tfgScene(s as SceneInput));
    saveProject(p);
    return ok({ ...summarize(p), warnings: checkAssetRefs(p) });
  },
);

server.registerTool(
  'motion_update_scene',
  {
    description: 'Patch one scene by index (only the fields you pass change). Set template to change the scene type.',
    inputSchema: {
      name: z.string(),
      index: z.number().int().min(0),
      patch: z.object({ template: templateEnum.optional(), ...sceneFields }),
    },
  },
  async ({ name, index, patch }) => {
    const p = loadProject(name);
    if (index >= p.doc.scenes.length) {
      return fail(`Scene index ${index} out of range — project has ${p.doc.scenes.length} scenes (0–${p.doc.scenes.length - 1}).`);
    }
    p.doc.scenes[index] = patchScene(p.doc.scenes[index], patch as Partial<SceneInput>);
    saveProject(p);
    return ok({ updated: index, scene: p.doc.scenes[index], warnings: checkAssetRefs(p) });
  },
);

server.registerTool(
  'motion_update_doc',
  {
    description: 'Change document-level settings: aspect, fps, watermark, film grain, fonts, music volume/fades.',
    inputSchema: {
      name: z.string(),
      patch: z.object({
        aspect: aspectEnum.optional(),
        fps: z.number().int().min(24).max(60).optional(),
        watermark: z.string().max(60).optional().describe('Subtle corner text, "" to remove'),
        showGrain: z.boolean().optional(),
        fontHeading: z.string().optional(),
        fontBody: z.string().optional(),
        audioVolume: z.number().min(0).max(1).optional(),
        audioFadeIn: z.number().min(0).max(10000).optional(),
        audioFadeOut: z.number().min(0).max(10000).optional(),
      }),
    },
  },
  async ({ name, patch }) => {
    const p = loadProject(name);
    Object.assign(p.doc, Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)));
    saveProject(p);
    return ok(summarize(p));
  },
);

server.registerTool(
  'motion_add_asset',
  {
    description:
      'Register a local media file with the project. kind "image" → usable via scene imageId; "video" → scene videoId; "music" → becomes the document\'s background music bed automatically.',
    inputSchema: {
      name: z.string(),
      id: z.string().describe('Asset id you\'ll reference from scenes, e.g. "hero-photo"'),
      kind: z.enum(['image', 'video', 'music']),
      path: z.string().describe('Absolute path to the file on disk'),
    },
  },
  async ({ name, id, kind, path }) => {
    const p = loadProject(name);
    const abs = resolve(path);
    if (!existsSync(abs)) return fail(`File not found: ${abs}`);
    p.assets = p.assets.filter((a) => a.id !== id);
    p.assets.push({ id, kind: kind as AssetKind, path: abs, name: basename(abs) });
    if (kind === 'music') p.doc.audioId = id;
    saveProject(p);
    return ok({ registered: { id, kind, path: abs }, assets: p.assets.map((a) => ({ id: a.id, kind: a.kind, name: a.name })) });
  },
);

server.registerTool(
  'motion_preview',
  {
    description:
      'Render PNG preview frames headlessly (pixel-identical to the export). Default: one frame per scene at 75% through it. Returns the images inline plus saved file paths.',
    inputSchema: {
      name: z.string(),
      times_ms: z.array(z.number().min(0)).max(12).optional()
        .describe('Explicit global timeline times (ms) to render instead of the per-scene default'),
    },
  },
  async ({ name, times_ms }) => {
    const p = loadProject(name);
    if (p.doc.scenes.length === 0) return fail('Project has no scenes yet — add some with motion_set_scenes.');
    const jobs = times_ms?.length
      ? times_ms.map((t) => ({ sceneIndex: -1, t }))
      : docTimes(p.doc);
    const pngs = await backend.renderPngs(p, jobs.map((j) => j.t));

    mkdirSync(OUT_DIR, { recursive: true });
    const files: string[] = [];
    const content: ({ type: 'text'; text: string } | { type: 'image'; data: string; mimeType: string })[] = [];
    pngs.forEach((b64, i) => {
      const label = jobs[i].sceneIndex >= 0 ? `scene${jobs[i].sceneIndex}` : `t${jobs[i].t}`;
      const file = join(OUT_DIR, `${p.name}-${label}.png`);
      writeFileSync(file, Buffer.from(b64, 'base64'));
      files.push(file);
      content.push({ type: 'image', data: b64, mimeType: 'image/png' });
    });
    content.unshift({
      type: 'text',
      text: JSON.stringify({ frames: jobs.map((j, i) => ({ ...j, file: files[i] })), warnings: checkAssetRefs(p) }, null, 2),
    });
    return { content };
  },
);

server.registerTool(
  'motion_export',
  {
    description:
      'Export the project to MP4 via the real WebCodecs pipeline in headless Chromium (music + clip audio included when present), normalized to H.264 so it plays everywhere. Returns the output file path.',
    inputSchema: {
      name: z.string(),
      filename: z.string().optional().describe('Output file name (default "<project>.mp4")'),
    },
  },
  async ({ name, filename }) => {
    const p = loadProject(name);
    if (p.doc.scenes.length === 0) return fail('Project has no scenes yet — add some with motion_set_scenes.');
    const t0 = Date.now();
    const raw = await backend.exportMp4(p);
    const norm = await normalizeToH264(raw);
    mkdirSync(OUT_DIR, { recursive: true });
    const file = join(OUT_DIR, filename?.replace(/[^\w.-]/g, '_') || `${p.name}.mp4`);
    writeFileSync(file, norm.bytes);
    const warnings = checkAssetRefs(p);
    if (norm.warning) warnings.push(norm.warning);
    return ok({
      file,
      sizeBytes: norm.bytes.length,
      codec: norm.codec,
      transcoded: norm.transcoded,
      videoDurationMs: docDuration(p.doc),
      renderTimeMs: Date.now() - t0,
      aspect: p.doc.aspect,
      warnings,
    });
  },
);

// ── Boot ──────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('tfg-motion-studio MCP server running (stdio)');
}

process.on('SIGINT', async () => { await backend.close(); process.exit(0); });
process.on('SIGTERM', async () => { await backend.close(); process.exit(0); });

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
