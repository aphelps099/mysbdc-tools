/** Smart 641 API calls — submit intake form and fetch centers. */

import type { IntakeData, IntakeResult, CenterOption } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function submitIntake(data: IntakeData): Promise<IntakeResult> {
  const res = await fetch(`${API_BASE}/api/intake/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Intake submission failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function fetchIntakeCenters(): Promise<CenterOption[]> {
  try {
    const res = await fetch(`${API_BASE}/api/intake/centers`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.centers ?? [];
  } catch {
    return [];
  }
}

export interface EmailCheckResult {
  exists: boolean;
  message: string;
}

export async function checkEmail(email: string): Promise<EmailCheckResult | null> {
  if (!email || !email.includes('@')) return null;
  try {
    const res = await fetch(`${API_BASE}/api/intake/check-email?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export interface ResolvedCenter {
  centerId: number;
  centerName: string;
  counties: string;
}

export async function resolveCenter(zip: string): Promise<ResolvedCenter | null> {
  if (!zip || zip.length < 3) return null;
  try {
    const res = await fetch(`${API_BASE}/api/intake/resolve-center?zip=${encodeURIComponent(zip)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
