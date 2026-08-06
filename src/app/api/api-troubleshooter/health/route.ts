/**
 * API Troubleshooter — health strip data. Read-only.
 *
 * Reports (a) whether this deployment can reach Neoserra, and (b) recent
 * wizard-path submission stats from the existing backend milestone log.
 * The WordPress/Gravity Forms path does not feed this log — its ledger is
 * the notification emails (paste one into the tool to trace it).
 */

import { NextResponse } from 'next/server';
import { neoserraConfigured } from '@/lib/api-troubleshooter/neoserra-read';
import { fetchMilestoneLog } from '@/lib/neoserra';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const health: {
    neoserraConfigured: boolean;
    backendLog: {
      available: boolean;
      days: number;
      submissions: number;
      withErrors: number;
      lastSubmission: string | null;
    };
  } = {
    neoserraConfigured: neoserraConfigured(),
    backendLog: { available: false, days: 7, submissions: 0, withErrors: 0, lastSubmission: null },
  };

  try {
    const entries = await fetchMilestoneLog(7);
    health.backendLog = {
      available: true,
      days: 7,
      submissions: entries.length,
      withErrors: entries.filter((e) => e.errors && e.errors.length > 0).length,
      lastSubmission: entries[0]?.timestamp ?? null,
    };
  } catch {
    // Backend unreachable — report honestly rather than failing the page.
  }

  return NextResponse.json(health);
}
