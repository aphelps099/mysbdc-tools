/* Project store — one JSON file per project under projects/ (gitignored).
   A project is a MotionDoc plus a registry of local asset files, plus a
   cache of Rebrandly shortlinks keyed by long URL so re-renders and
   re-exports never mint duplicates. This package's projects/ dir is its
   own — TFG and SBDC projects never collide. */

import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MotionDoc } from '../../../src/lib/motion/types';
import { Shortlink } from '../../../src/lib/pipeline/rebrandly';

const here = dirname(fileURLToPath(import.meta.url)); // dist/ at runtime
export const PKG_ROOT = join(here, '..');
export const REPO_ROOT = join(PKG_ROOT, '..', '..');
const PROJECTS_DIR = join(PKG_ROOT, 'projects');
export const OUT_DIR = join(PKG_ROOT, 'out');

export type AssetKind = 'image' | 'video' | 'music';

export interface ProjectAsset {
  id: string;
  kind: AssetKind;
  /** Absolute path on disk. */
  path: string;
  name: string;
}

/** A cached shortlink: the Rebrandly record plus the display text cards render. */
export interface CachedShortlink extends Shortlink {
  /** What scenes show, e.g. "sbdc.events/marketing-bootcamp" (no scheme). */
  display: string;
  title: string;
}

export interface Project {
  name: string;
  doc: MotionDoc;
  assets: ProjectAsset[];
  /** Long URL → shortlink, so repeat maps/exports reuse instead of minting. */
  shortlinks?: Record<string, CachedShortlink>;
  created: string;
  updated: string;
}

function fileFor(name: string): string {
  if (!/^[a-z0-9][a-z0-9-_]{0,63}$/i.test(name)) {
    throw new Error(
      `Invalid project name "${name}" — use letters, digits, dashes, underscores (max 64 chars).`,
    );
  }
  return join(PROJECTS_DIR, `${name}.json`);
}

export function listProjects(): { name: string; scenes: number; aspect: string; updated: string }[] {
  if (!existsSync(PROJECTS_DIR)) return [];
  return readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const p = JSON.parse(readFileSync(join(PROJECTS_DIR, f), 'utf8')) as Project;
      return { name: p.name, scenes: p.doc.scenes.length, aspect: p.doc.aspect, updated: p.updated };
    })
    .sort((a, b) => (a.updated < b.updated ? 1 : -1));
}

export function loadProject(name: string): Project {
  const file = fileFor(name);
  if (!existsSync(file)) {
    const known = listProjects().map((p) => p.name);
    throw new Error(
      `Project "${name}" not found.${known.length ? ` Existing projects: ${known.join(', ')}` : ' No projects exist yet — create one with motion_create_project.'}`,
    );
  }
  return JSON.parse(readFileSync(file, 'utf8')) as Project;
}

export function saveProject(p: Project): void {
  mkdirSync(PROJECTS_DIR, { recursive: true });
  p.updated = new Date().toISOString();
  writeFileSync(fileFor(p.name), JSON.stringify(p, null, 2));
}

export function projectExists(name: string): boolean {
  return existsSync(fileFor(name));
}
