import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildQueryVariants } from '@/components/network-map/geocode-query';
import { normalizeState } from '@/components/network-map/logic';
import {
  readSeedWorkspace,
  readSharedWorkspace,
  resolveDataDir,
  writeSharedWorkspace,
} from '@/lib/network-map-store';
import { GET as workspaceGet, PUT as workspacePut } from '@/app/api/network-map/workspace/route';
import type { NextRequest } from 'next/server';

const queries = (q: string) => buildQueryVariants(q).map((v) => v.query);

describe('buildQueryVariants', () => {
  it('returns the raw query plus a ", CA" variant when no state is present', () => {
    expect(queries('1200 K St, Sacramento 95814')).toEqual([
      '1200 K St, Sacramento 95814',
      '1200 K St, Sacramento 95814, CA',
    ]);
  });

  it('does not duplicate CA when the state is already there', () => {
    expect(queries('1200 K St, Sacramento, CA 95814')).toEqual(['1200 K St, Sacramento, CA 95814']);
  });

  it('strips suite/room codes — the "1 Harpst Street, SBS 427" case — marked relaxed', () => {
    const variants = buildQueryVariants('1 Harpst Street, SBS 427');
    expect(variants[0]).toEqual({ query: '1 Harpst Street, SBS 427', precision: 'exact' });
    expect(variants[1]).toEqual({ query: '1 Harpst Street, SBS 427, CA', precision: 'exact' });
    expect(variants).toContainEqual({ query: '1 Harpst Street, CA', precision: 'relaxed' });
  });

  it('strips common unit designators', () => {
    expect(queries('500 Main St Suite 210, Chico, CA')).toContain('500 Main St, Chico, CA');
    expect(queries('500 Main St #12, Chico CA')).toContain('500 Main St, Chico CA');
    expect(queries('500 Main St, Unit B, Chico, CA 95928')).toContain('500 Main St, Chico, CA 95928');
  });

  it('never strips street names that merely contain a designator word', () => {
    expect(queries('123 Suite Dr, Chico, CA')).toEqual(['123 Suite Dr, Chico, CA']);
  });

  it('falls back to the street segment only for room-code-like tails', () => {
    expect(queries('99 Oak Ave, BLDG 12')).toContain('99 Oak Ave, CA');
    // a city-like tail must never be truncated into a different-city lookup
    expect(queries('1200 K St, Sacramento 95814')).not.toContain('1200 K St, CA');
    expect(queries('1 Main St, Ukiah 95482')).not.toContain('1 Main St, CA');
    expect(queries('1 Main St, Galt 95632')).not.toContain('1 Main St, CA');
  });

  it('handles empty and whitespace queries', () => {
    expect(buildQueryVariants('')).toEqual([]);
    expect(buildQueryVariants('   ')).toEqual([]);
  });
});

describe('network-map-store', () => {
  const dirs: string[] = [];
  function tempDir(): string {
    const dir = mkdtempSync(path.join(tmpdir(), 'nm-store-'));
    dirs.push(dir);
    return dir;
  }
  afterEach(() => {
    delete process.env.NETWORK_MAP_DATA_DIR;
    while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
  });

  it('resolveDataDir prefers the env override', () => {
    expect(resolveDataDir({ NETWORK_MAP_DATA_DIR: '/custom/spot' } as unknown as NodeJS.ProcessEnv)).toBe(
      '/custom/spot',
    );
  });

  it('round-trips a workspace and stamps a server updatedAt', () => {
    const dir = tempDir();
    expect(readSharedWorkspace(dir)).toBeNull();
    const workspace = normalizeState({ locations: [{ name: 'Host A', regionId: 2, investment: 100 }] });
    const saved = writeSharedWorkspace(dir, workspace);
    expect(saved.locations).toHaveLength(1);
    const read = readSharedWorkspace(dir);
    expect(read).not.toBeNull();
    expect(read!.locations[0].name).toBe('Host A');
    expect(read!.updatedAt).toBe(saved.updatedAt);
  });

  it('keeps rolling backups of previous saves, pruned to a cap', () => {
    const dir = tempDir();
    for (let i = 0; i < 25; i += 1) {
      writeSharedWorkspace(dir, normalizeState({ locations: [{ name: 'v' + i }] }));
    }
    const backups = readdirSync(path.join(dir, 'backups'));
    expect(backups.length).toBeGreaterThan(0);
    expect(backups.length).toBeLessThanOrEqual(20);
    // newest backup holds the previous (second-to-last) save
    const newest = backups.sort().at(-1)!;
    const parsed = JSON.parse(readFileSync(path.join(dir, 'backups', newest), 'utf8'));
    expect(parsed.locations[0].name).toBe('v23');
  });

  it('survives a corrupted workspace file', () => {
    const dir = tempDir();
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'workspace.json'), '{broken');
    expect(readSharedWorkspace(dir)).toBeNull();
  });

  it('reads the committed seed workspace', () => {
    const seed = readSeedWorkspace(path.resolve(__dirname, '..'));
    expect(seed).not.toBeNull();
    expect(seed!.version).toBe(3);
    expect(Array.isArray(seed!.locations)).toBe(true);
  });

  /* ── Route-level conflict semantics: nothing may silently overwrite ── */
  describe('workspace API route', () => {
    function putRequest(body: unknown): NextRequest {
      return new Request('http://localhost/api/network-map/workspace', {
        method: 'PUT',
        body: JSON.stringify(body),
      }) as unknown as NextRequest;
    }
    const workspaceBody = (name: string) => ({ locations: [{ name }], settings: {} });

    it('creates the first workspace without a base, then requires the base', async () => {
      process.env.NETWORK_MAP_DATA_DIR = tempDir();

      const created = await workspacePut(putRequest({ workspace: workspaceBody('First') }));
      expect(created.status).toBe(200);
      const { workspace: saved } = await created.json();

      // Same client saving again with the correct base → accepted.
      const ok = await workspacePut(
        putRequest({ workspace: workspaceBody('Second'), baseUpdatedAt: saved.updatedAt }),
      );
      expect(ok.status).toBe(200);

      // A never-synced client (no baseUpdatedAt) must NOT overwrite.
      const blind = await workspacePut(putRequest({ workspace: workspaceBody('Blind overwrite') }));
      expect(blind.status).toBe(409);

      // A stale base must not overwrite either.
      const stale = await workspacePut(
        putRequest({ workspace: workspaceBody('Stale'), baseUpdatedAt: '2000-01-01T00:00:00.000Z' }),
      );
      expect(stale.status).toBe(409);
      const staleBody = await stale.json();
      expect(staleBody.workspace.locations[0].name).toBe('Second');

      // Explicit force wins (the user confirmed "keep my version").
      const forced = await workspacePut(putRequest({ workspace: workspaceBody('Forced'), force: true }));
      expect(forced.status).toBe(200);

      const final = await workspaceGet();
      const finalBody = await final.json();
      expect(finalBody.workspace.locations[0].name).toBe('Forced');
      expect(finalBody.source).toBe('shared');
    });

    it('rejects bodies without a locations array', async () => {
      process.env.NETWORK_MAP_DATA_DIR = tempDir();
      const bad = await workspacePut(putRequest({ nope: true }));
      expect(bad.status).toBe(400);
    });
  });
});
