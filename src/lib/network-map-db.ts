import { Pool } from 'pg';
import { normalizeState } from '@/components/network-map/logic';
import type { Workspace } from '@/components/network-map/types';

/* ═══════════════════════════════════════════════════════
   Network Map — Postgres store (Neon).

   When NETWORK_MAP_DATABASE_URL (or DATABASE_URL) is set,
   the shared workspace lives in Postgres instead of on the
   container's disk, so it survives redeploys with no volume.
   Mirrors the disk store's behavior: the saved workspace
   carries its own updatedAt (the conflict-detection base),
   and every overwrite keeps a rolling backup.

   Queries go through an injectable QueryFn so tests can run
   without a real database.
   ═══════════════════════════════════════════════════════ */

const WORKSPACE_ID = 'shared';
const BACKUPS_TO_KEEP = 20;

export type QueryFn = (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;

export function databaseUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  return env.NETWORK_MAP_DATABASE_URL || env.DATABASE_URL || null;
}

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

/** Lazy pool + one-time schema creation. Returns null when no database is configured. */
export function getDbQuery(): QueryFn | null {
  const url = databaseUrl();
  if (!url) return null;
  if (!pool) {
    // Neon connection strings carry ?sslmode=require, which node-postgres honors.
    pool = new Pool({ connectionString: url, max: 3 });
  }
  const p = pool;
  const query: QueryFn = async (text, params) => p.query(text, params as unknown[] | undefined);
  if (!schemaReady) schemaReady = ensureSchema(query);
  const ready = schemaReady;
  return async (text, params) => {
    await ready;
    return query(text, params);
  };
}

async function ensureSchema(query: QueryFn): Promise<void> {
  await query(`CREATE TABLE IF NOT EXISTS network_map_workspace (
    id text PRIMARY KEY,
    workspace jsonb NOT NULL
  )`);
  await query(`CREATE TABLE IF NOT EXISTS network_map_backups (
    id bigserial PRIMARY KEY,
    workspace jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`);
}

export async function readSharedWorkspaceDb(query: QueryFn): Promise<Workspace | null> {
  const { rows } = await query('SELECT workspace FROM network_map_workspace WHERE id = $1', [WORKSPACE_ID]);
  if (!rows.length) return null;
  return normalizeState(rows[0].workspace);
}

export async function writeSharedWorkspaceDb(query: QueryFn, workspace: Workspace): Promise<Workspace> {
  const saved: Workspace = { ...normalizeState(workspace), updatedAt: new Date().toISOString() };
  // Rolling backup of the copy being overwritten (no-op on first save).
  await query(
    `INSERT INTO network_map_backups (workspace)
     SELECT workspace FROM network_map_workspace WHERE id = $1`,
    [WORKSPACE_ID],
  );
  await query(
    `DELETE FROM network_map_backups
     WHERE id NOT IN (SELECT id FROM network_map_backups ORDER BY id DESC LIMIT $1)`,
    [BACKUPS_TO_KEEP],
  );
  await query(
    `INSERT INTO network_map_workspace (id, workspace) VALUES ($1, $2::jsonb)
     ON CONFLICT (id) DO UPDATE SET workspace = EXCLUDED.workspace`,
    [WORKSPACE_ID, JSON.stringify(saved)],
  );
  return saved;
}
