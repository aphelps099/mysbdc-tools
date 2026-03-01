/** TFG Application API — single multipart submission (JSON + file). */

import type { TFGApplicationData, TFGSubmitResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/** Submit the complete TFG application as multipart/form-data. */
export async function submitTFGApplication(
  data: TFGApplicationData,
): Promise<TFGSubmitResult> {
  const formData = new FormData();

  // Strip the File object (not JSON-serializable) and send fields as JSON
  const { pitchDeckFile, ...jsonFields } = data;
  formData.append('data', JSON.stringify(jsonFields));

  // Attach pitch deck file if present
  if (pitchDeckFile) {
    formData.append('pitchDeck', pitchDeckFile, pitchDeckFile.name);
  }

  // Do NOT set Content-Type — browser sets multipart boundary automatically
  const res = await fetch(`${API_BASE}/api/tfg/submit`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`TFG submission failed (${res.status}): ${text}`);
  }
  return res.json();
}
