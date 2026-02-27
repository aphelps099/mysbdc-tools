/** TFG Application API calls — submit application and upload pitch deck. */

import type { TFGApplicationData, TFGSubmitResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/** Upload pitch deck file, return reference info. */
export async function uploadPitchDeck(
  file: File,
): Promise<{ fileId: string; fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('context', 'tfg_application');

  const res = await fetch(`${API_BASE}/api/tfg/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`File upload failed (${res.status}): ${text}`);
  }
  return res.json();
}

/** Submit the complete TFG application. */
export async function submitTFGApplication(
  data: TFGApplicationData,
  pitchDeckFileId?: string,
): Promise<TFGSubmitResult> {
  // Strip the File object (not JSON-serializable) and include fileId instead
  const { pitchDeckFile, ...jsonData } = data;

  const res = await fetch(`${API_BASE}/api/tfg/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...jsonData,
      pitchDeckFileId: pitchDeckFileId || undefined,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`TFG submission failed (${res.status}): ${text}`);
  }
  return res.json();
}
