/**
 * TFG Application Storage — persist application JSON to disk.
 *
 * Pitch deck files are stored in Google Drive; only the Drive link
 * is recorded in the JSON. Application data lives on the Railway
 * persistent volume (or local ./data during dev).
 *
 * Env: TFG_DATA_DIR — defaults to ./data/tfg-applications
 */

import { mkdir, writeFile, readFile } from 'fs/promises';
import path from 'path';

const DATA_DIR = () =>
  process.env.TFG_DATA_DIR || path.join(process.cwd(), 'data', 'tfg-applications');

const UUID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

export interface StoredApplication {
  id: string;
  data: Record<string, unknown>;
  pitchDeckUrl: string | null;
  pitchDeckFileName: string | null;
  clientId: string | null;
  submittedAt: string;
}

/** Save application data as JSON. */
export async function saveApplication(
  id: string,
  data: Record<string, unknown>,
  pitchDeckUrl: string | null,
  pitchDeckFileName: string | null,
  clientId: string | null,
): Promise<void> {
  const dir = DATA_DIR();
  await mkdir(dir, { recursive: true });

  const record: StoredApplication = {
    id,
    data,
    pitchDeckUrl,
    pitchDeckFileName,
    clientId,
    submittedAt: new Date().toISOString(),
  };

  await writeFile(path.join(dir, `${id}.json`), JSON.stringify(record, null, 2));
}

/** Load a stored application by ID. Returns null if not found or invalid ID. */
export async function loadApplication(id: string): Promise<StoredApplication | null> {
  if (!UUID_RE.test(id)) return null;
  try {
    const raw = await readFile(path.join(DATA_DIR(), `${id}.json`), 'utf-8');
    return JSON.parse(raw) as StoredApplication;
  } catch {
    return null;
  }
}
