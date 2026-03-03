import type { RoadmapApplicationData, RoadmapSubmitResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Neoserra center / database ID for the Roadmap for Innovation program.
 * All R4I applications flow into this center.
 */
export const NEOSERRA_CENTER_ID = 113;

/**
 * Submit a Roadmap for Innovation application.
 *
 * Reuses the existing /api/intake/submit endpoint (which already
 * handles Neoserra client creation) — we just force centerId=113
 * so it lands in the R4I center/database.
 */
export async function submitRoadmapApplication(
  data: RoadmapApplicationData,
): Promise<RoadmapSubmitResult> {
  const res = await fetch(`${API_BASE}/api/intake/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      centerId: NEOSERRA_CENTER_ID,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Submission failed (${res.status}): ${text}`);
  }

  return res.json();
}
