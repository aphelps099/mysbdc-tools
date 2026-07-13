import {
  accessSync,
  constants,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { normalizeState } from '@/components/network-map/logic';
import type { Workspace } from '@/components/network-map/types';

/* ═══════════════════════════════════════════════════════
   Network Map — shared workspace store (server side).

   One live workspace for the whole network, stored as JSON
   on disk so nobody has to touch export files. Point
   NETWORK_MAP_DATA_DIR at the Railway persistent volume
   (e.g. /data/network-map) for durability; without a volume
   the store still works but resets on redeploy. Every write
   keeps a rolling backup for recovery.
   ═══════════════════════════════════════════════════════ */

const WORKSPACE_FILE = 'workspace.json';
const BACKUP_DIR = 'backups';
const BACKUPS_TO_KEEP = 20;

export function resolveDataDir(env: NodeJS.ProcessEnv = process.env): string {
  if (env.NETWORK_MAP_DATA_DIR) return env.NETWORK_MAP_DATA_DIR;
  // Railway convention in this repo: the persistent volume mounts at /data
  // (see TFG_DATA_DIR). Use it when it's writable.
  try {
    accessSync('/data', constants.W_OK);
    return '/data/network-map';
  } catch {
    return path.join(process.cwd(), '.data', 'network-map');
  }
}

export function isDurableDir(dir: string, env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.NETWORK_MAP_DATA_DIR) || dir.startsWith('/data/');
}

export function readSharedWorkspace(dir: string): Workspace | null {
  try {
    const raw = readFileSync(path.join(dir, WORKSPACE_FILE), 'utf8');
    return normalizeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

/* The committed seed file doubles as the first-run workspace. */
export function readSeedWorkspace(cwd: string = process.cwd()): Workspace | null {
  try {
    const raw = readFileSync(path.join(cwd, 'public', 'data', 'network-map', 'network.v1.json'), 'utf8');
    return normalizeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeSharedWorkspace(dir: string, workspace: Workspace): Workspace {
  const saved: Workspace = { ...normalizeState(workspace), updatedAt: new Date().toISOString() };
  mkdirSync(path.join(dir, BACKUP_DIR), { recursive: true });

  const file = path.join(dir, WORKSPACE_FILE);
  if (existsSync(file)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    writeFileSync(path.join(dir, BACKUP_DIR, `workspace-${stamp}.json`), readFileSync(file));
    pruneBackups(dir);
  }
  // Atomic write: a crash mid-write must never leave a torn workspace.json —
  // an unreadable file would silently disable conflict detection.
  const tmp = file + '.tmp';
  writeFileSync(tmp, JSON.stringify(saved, null, 2));
  renameSync(tmp, file);
  return saved;
}

function pruneBackups(dir: string): void {
  try {
    const backupDir = path.join(dir, BACKUP_DIR);
    const backups = readdirSync(backupDir)
      .filter((name) => name.startsWith('workspace-') && name.endsWith('.json'))
      .sort();
    for (const name of backups.slice(0, Math.max(0, backups.length - BACKUPS_TO_KEEP))) {
      unlinkSync(path.join(backupDir, name));
    }
  } catch {
    /* backup pruning is best-effort */
  }
}
