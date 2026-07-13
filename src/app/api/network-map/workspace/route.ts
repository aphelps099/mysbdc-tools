import { NextRequest, NextResponse } from 'next/server';
import {
  isDurableDir,
  readSeedWorkspace,
  readSharedWorkspace,
  resolveDataDir,
  writeSharedWorkspace,
} from '@/lib/network-map-store';
import { normalizeState } from '@/components/network-map/logic';

/* ═══════════════════════════════════════════════════════
   /api/network-map/workspace — the shared live network map.

   GET  → current shared workspace (falls back to the
          committed seed on first run)
   PUT  → save; body { workspace, baseUpdatedAt?, force? }.
          When a shared workspace already exists, the save
          must carry its exact updatedAt as baseUpdatedAt or
          an explicit force:true — anything else is a 409
          with the current copy, so a stale or never-synced
          client can never silently overwrite everyone's map.

   Session-cookie-gated by src/middleware.ts, so only people
   who unlocked the toolbox can read or write it.
   ═══════════════════════════════════════════════════════ */

const MAX_BODY_BYTES = 2_000_000;

export async function GET() {
  const dir = resolveDataDir();
  const shared = readSharedWorkspace(dir);
  const workspace = shared ?? readSeedWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: 'No shared workspace available.' }, { status: 404 });
  }
  return NextResponse.json({
    workspace,
    source: shared ? 'shared' : 'seed',
    durable: isDurableDir(dir),
  });
}

export async function PUT(request: NextRequest) {
  let body: { workspace?: unknown; baseUpdatedAt?: string; force?: boolean };
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Workspace too large.' }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const incoming = body?.workspace as { locations?: unknown } | undefined;
  if (!incoming || typeof incoming !== 'object' || !Array.isArray(incoming.locations)) {
    return NextResponse.json({ error: 'Body must include a workspace with a locations array.' }, { status: 400 });
  }

  const dir = resolveDataDir();
  const current = readSharedWorkspace(dir);
  // Overwriting an existing shared workspace requires either the exact
  // current version as the base or an explicit, user-confirmed force.
  if (current && body.force !== true && body.baseUpdatedAt !== current.updatedAt) {
    return NextResponse.json(
      { error: 'stale', workspace: current, durable: isDurableDir(dir) },
      { status: 409 },
    );
  }

  try {
    const saved = writeSharedWorkspace(dir, normalizeState(incoming));
    return NextResponse.json({ workspace: saved, durable: isDurableDir(dir) });
  } catch {
    return NextResponse.json({ error: 'Could not save the shared workspace.' }, { status: 500 });
  }
}
