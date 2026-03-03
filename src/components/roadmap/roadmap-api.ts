import type { RoadmapApplicationData, RoadmapSubmitResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Submit a Roadmap for Innovation application.
 *
 * Routes through /api/roadmap/submit which maps fields to the
 * intake-compatible payload, creates the Neoserra client, and
 * sends the welcome email.
 */
export async function submitRoadmapApplication(
  data: RoadmapApplicationData,
): Promise<RoadmapSubmitResult> {
  const res = await fetch(`${API_BASE}/api/roadmap/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Submission failed (${res.status})`);
  }

  return res.json();
}
