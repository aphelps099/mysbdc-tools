import { normalizeState } from './logic';
import type { Workspace } from './types';

/* ═══════════════════════════════════════════════════════
   Network Map — persistence layer.
   Same storage key as the prototype so the schema stays
   wire-compatible. Isolated behind these functions (with an
   injectable Storage) so a server backend can replace
   localStorage later without touching the UI, and so tests
   run against a fake store in node.
   ═══════════════════════════════════════════════════════ */

export const WORKSPACE_STORAGE_KEY = 'norcal-sbdc-network-map-v3';
export const META_STORAGE_KEY = 'norcal-sbdc-network-map-meta';
export const SYNC_MARKER_KEY = 'norcal-sbdc-network-map-sync';
export const SYNC_PULSE_KEY = 'norcal-sbdc-network-map-pulse';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface BackupMeta {
  lastExportAt: string | null;
  editsSinceExport: number;
  nudgeSnoozedUntil: string | null;
}

const DEFAULT_META: BackupMeta = { lastExportAt: null, editsSinceExport: 0, nudgeSnoozedUntil: null };

export function loadStoredWorkspace(storage: StorageLike): Workspace | null {
  let stored: unknown = null;
  try {
    stored = JSON.parse(storage.getItem(WORKSPACE_STORAGE_KEY) || 'null');
  } catch {
    stored = null;
  }
  if (!stored || typeof stored !== 'object') return null;
  return normalizeState(stored);
}

export function saveWorkspace(storage: StorageLike, workspace: Workspace): void {
  try {
    storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
  } catch {
    /* storage full or unavailable — the in-memory workspace remains usable */
  }
}

export function loadMeta(storage: StorageLike): BackupMeta {
  try {
    const raw = JSON.parse(storage.getItem(META_STORAGE_KEY) || 'null');
    if (raw && typeof raw === 'object') return { ...DEFAULT_META, ...raw };
  } catch {
    /* fall through */
  }
  return { ...DEFAULT_META };
}

export function saveMeta(storage: StorageLike, meta: BackupMeta): void {
  try {
    storage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
  } catch {
    /* non-critical */
  }
}

/* Persisted record of what this browser last synced with the server. Lets a
   reload distinguish "clean cache" from "offline edits that were never
   saved for everyone" — without it, adopting the server copy on load would
   silently discard those edits. */
export interface SyncMarker {
  serverUpdatedAt: string;
  /* Opaque JSON snapshot of the shared parts (locations + design) this
     browser last synced — compared for dirtiness across reloads. */
  lastSyncedShared: string;
}

export function loadSyncMarker(storage: StorageLike): SyncMarker | null {
  try {
    const raw = JSON.parse(storage.getItem(SYNC_MARKER_KEY) || 'null');
    if (!raw || typeof raw.serverUpdatedAt !== 'string') return null;
    if (typeof raw.lastSyncedShared === 'string') return raw;
    // Legacy marker (locations-only snapshot) — carry it forward so an
    // upgraded client keeps a valid baseline instead of starting from null
    // (which would read as a spurious conflict on first load after deploy).
    if (typeof raw.lastSyncedLocations === 'string') {
      return { serverUpdatedAt: raw.serverUpdatedAt, lastSyncedShared: raw.lastSyncedLocations };
    }
  } catch {
    /* fall through */
  }
  return null;
}

export function saveSyncMarker(storage: StorageLike, marker: SyncMarker): void {
  try {
    storage.setItem(SYNC_MARKER_KEY, JSON.stringify(marker));
  } catch {
    /* non-critical */
  }
}

const NUDGE_STALE_DAYS = 7;
const NUDGE_EDIT_THRESHOLD = 25;

/* Backup nudge: only when there is data worth losing, un-exported edits
   exist, and the user has never exported / hasn't exported in 7 days / has
   accumulated many edits. Snooze suppresses it. */
export function shouldNudgeBackup(meta: BackupMeta, locationCount: number, now: Date = new Date()): boolean {
  if (locationCount === 0 || meta.editsSinceExport === 0) return false;
  if (meta.nudgeSnoozedUntil && new Date(meta.nudgeSnoozedUntil) > now) return false;
  if (meta.editsSinceExport >= NUDGE_EDIT_THRESHOLD) return true;
  if (!meta.lastExportAt) return true;
  const ageDays = (now.getTime() - new Date(meta.lastExportAt).getTime()) / 86400000;
  return ageDays >= NUDGE_STALE_DAYS;
}
