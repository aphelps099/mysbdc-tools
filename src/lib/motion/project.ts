/* ═══════════════════════════════════════════════════════
   Motion Studio — project persistence
   Save/load projects as JSON and autosave to the browser.
   Media binaries are NOT embedded — they're referenced by
   filename, and re-uploading a file with the same name
   relinks it to every scene that used it.
   ═══════════════════════════════════════════════════════ */

import { MotionDoc, CustomScheme, defaultDoc } from './types';

export const AUTOSAVE_KEY = 'ms-pro-project-v1';

export interface MediaRef {
  /** Asset id used by scenes (imageId) or a fixed slot id (__logo-brand-light…). */
  id: string;
  /** Original filename, used to relink on re-upload. */
  name: string;
}

export interface ProjectFile {
  version: 1;
  kind: 'motion-studio-project';
  savedAt: string;
  doc: MotionDoc;
  brandName: string;
  brandColors: CustomScheme;
  media: {
    images: MediaRef[];
    /** Background video clips, referenced by filename like images. */
    videos?: MediaRef[];
    logoLight: string | null; // filenames
    logoDark: string | null;
    voiceover: string | null;
    music: string | null;
  };
}

export function serializeProject(p: Omit<ProjectFile, 'version' | 'kind' | 'savedAt'>): ProjectFile {
  return { version: 1, kind: 'motion-studio-project', savedAt: new Date().toISOString(), ...p };
}

/** Parse + minimally validate a project JSON string. Throws on garbage. */
export function parseProject(json: string): ProjectFile {
  const data = JSON.parse(json) as ProjectFile;
  if (data?.kind !== 'motion-studio-project' || !data.doc || !Array.isArray(data.doc.scenes)) {
    throw new Error('Not a Motion Studio project file');
  }
  // Merge onto defaults so docs saved before newer fields existed still load
  const base = defaultDoc();
  data.doc = { ...base, ...data.doc, scenes: data.doc.scenes };
  const media = data.media ?? ({} as Partial<ProjectFile['media']>);
  data.media = {
    images: Array.isArray(media.images) ? media.images : [],
    videos: Array.isArray(media.videos) ? media.videos : [],
    logoLight: media.logoLight ?? null,
    logoDark: media.logoDark ?? null,
    voiceover: media.voiceover ?? null,
    music: media.music ?? null,
  };
  return data;
}

export function saveAutosave(p: ProjectFile): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(p));
  } catch {
    // storage full/blocked — autosave is best-effort
  }
}

export function loadAutosave(): ProjectFile | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    return raw ? parseProject(raw) : null;
  } catch {
    return null;
  }
}

export function clearAutosave(): void {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch {
    // ignore
  }
}
