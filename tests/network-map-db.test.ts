import { describe, expect, it } from 'vitest';
import { databaseUrl, readSharedWorkspaceDb, writeSharedWorkspaceDb, type QueryFn } from '@/lib/network-map-db';

/* In-memory stand-in for the two Postgres tables, keyed off the statement
   shape the store lib actually issues. */
function fakeDb() {
  let workspace: unknown = null;
  const backups: unknown[] = [];
  const query: QueryFn = async (text, params) => {
    if (text.startsWith('SELECT workspace FROM network_map_workspace')) {
      return { rows: workspace === null ? [] : [{ workspace }] };
    }
    if (text.includes('INSERT INTO network_map_backups')) {
      if (workspace !== null) backups.push(workspace);
      return { rows: [] };
    }
    if (text.startsWith('DELETE FROM network_map_backups')) {
      const keep = params?.[0] as number;
      backups.splice(0, Math.max(0, backups.length - keep));
      return { rows: [] };
    }
    if (text.includes('INSERT INTO network_map_workspace')) {
      workspace = JSON.parse(params?.[1] as string);
      return { rows: [] };
    }
    throw new Error(`unexpected query: ${text}`);
  };
  return { query, state: { get workspace() { return workspace; }, backups } };
}

describe('network-map database store', () => {
  it('databaseUrl prefers NETWORK_MAP_DATABASE_URL, falls back to DATABASE_URL, else null', () => {
    expect(databaseUrl({ NETWORK_MAP_DATABASE_URL: 'a', DATABASE_URL: 'b' } as NodeJS.ProcessEnv)).toBe('a');
    expect(databaseUrl({ DATABASE_URL: 'b' } as NodeJS.ProcessEnv)).toBe('b');
    expect(databaseUrl({} as NodeJS.ProcessEnv)).toBeNull();
  });

  it('read returns null when nothing is stored', async () => {
    const db = fakeDb();
    expect(await readSharedWorkspaceDb(db.query)).toBeNull();
  });

  it('write stamps a fresh updatedAt and read round-trips a normalized workspace', async () => {
    const db = fakeDb();
    const saved = await writeSharedWorkspaceDb(db.query, {
      locations: [{ id: 'x', kind: 'host', name: 'Chico host' }],
      updatedAt: '2020-01-01T00:00:00.000Z',
    } as never);
    expect(saved.updatedAt).not.toBe('2020-01-01T00:00:00.000Z');
    expect(Date.parse(saved.updatedAt)).toBeGreaterThan(Date.parse('2024-01-01'));

    const read = await readSharedWorkspaceDb(db.query);
    expect(read).not.toBeNull();
    expect(read!.updatedAt).toBe(saved.updatedAt);
    expect(read!.locations.map((l) => l.name)).toEqual(['Chico host']);
  });

  it('keeps a rolling backup of each overwritten copy, pruned to 20', async () => {
    const db = fakeDb();
    for (let i = 0; i < 25; i++) {
      await writeSharedWorkspaceDb(db.query, { locations: [], updatedAt: '' } as never);
    }
    // 25 writes → 24 overwrites backed up, pruned down to the newest 20
    expect(db.state.backups.length).toBe(20);
  });
});
