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
import { SEED_PARTNERS } from '@/components/partnerships/seed';
import type { Partner } from '@/components/partnerships/types';

/* ═══════════════════════════════════════════════════════
   Partnership CRM — shared partner store (server side).

   One partners collection for the whole team, stored as
   JSON on disk (same pattern as network-map-store). Point
   PARTNERSHIPS_DATA_DIR at the Railway persistent volume
   (e.g. /data/partnerships) for durability; without a
   volume the store still works but resets on redeploy.

   SAMPLE_DATA: until the first write, reads serve the seed
   fixture and report sampleData: true so the UI can show
   the SAMPLE DATA chip.
   ═══════════════════════════════════════════════════════ */

const PARTNERS_FILE = 'partners.json';
const BACKUP_DIR = 'backups';
const BACKUPS_TO_KEEP = 20;

export function resolveDataDir(env: NodeJS.ProcessEnv = process.env): string {
  if (env.PARTNERSHIPS_DATA_DIR) return env.PARTNERSHIPS_DATA_DIR;
  try {
    accessSync('/data', constants.W_OK);
    return '/data/partnerships';
  } catch {
    return path.join(process.cwd(), '.data', 'partnerships');
  }
}

export function readStoredPartners(dir: string): Partner[] | null {
  try {
    const raw = readFileSync(path.join(dir, PARTNERS_FILE), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Partner[]) : null;
  } catch {
    return null;
  }
}

/** { partners, sampleData } — sampleData is true while serving the untouched seed. */
export function loadPartners(dir: string): { partners: Partner[]; sampleData: boolean } {
  const stored = readStoredPartners(dir);
  if (stored) return { partners: stored, sampleData: false };
  return { partners: SEED_PARTNERS, sampleData: true };
}

export function writePartners(dir: string, partners: Partner[]): void {
  mkdirSync(path.join(dir, BACKUP_DIR), { recursive: true });

  const file = path.join(dir, PARTNERS_FILE);
  if (existsSync(file)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    writeFileSync(path.join(dir, BACKUP_DIR, `partners-${stamp}.json`), readFileSync(file));
    pruneBackups(dir);
  }
  // Atomic write: a crash mid-write must never leave a torn partners.json.
  const tmp = file + '.tmp';
  writeFileSync(tmp, JSON.stringify(partners, null, 2));
  renameSync(tmp, file);
}

/** Remove the stored collection (a backup is kept), reverting reads to the seed. */
export function deleteStoredPartners(dir: string): void {
  const file = path.join(dir, PARTNERS_FILE);
  if (!existsSync(file)) return;
  mkdirSync(path.join(dir, BACKUP_DIR), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  writeFileSync(path.join(dir, BACKUP_DIR, `partners-${stamp}.json`), readFileSync(file));
  pruneBackups(dir);
  unlinkSync(file);
}

function pruneBackups(dir: string): void {
  try {
    const backupDir = path.join(dir, BACKUP_DIR);
    const backups = readdirSync(backupDir)
      .filter((name) => name.startsWith('partners-') && name.endsWith('.json'))
      .sort();
    for (const name of backups.slice(0, Math.max(0, backups.length - BACKUPS_TO_KEEP))) {
      unlinkSync(path.join(backupDir, name));
    }
  } catch {
    /* backup pruning is best-effort */
  }
}
