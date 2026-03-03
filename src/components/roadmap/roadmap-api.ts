import type { RoadmapApplicationData, RoadmapSubmitResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function submitRoadmapApplication(
  data: RoadmapApplicationData,
): Promise<RoadmapSubmitResult> {
  const res = await fetch(`${API_BASE}/api/roadmap/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Submission failed (${res.status}): ${text}`);
  }

  return res.json();
}
