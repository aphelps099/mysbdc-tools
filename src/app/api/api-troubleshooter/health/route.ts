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
import { fetchStep2Entries, gfConfigured } from '@/lib/api-troubleshooter/gravity-forms';
import { fetchMilestoneLog } from '@/lib/neoserra';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const health: {
    neoserraConfigured: boolean;
    gravityForms: {
      configured: boolean;
      totalEntries: number | null;
      lastEntry: string | null;
    };
    backendLog: {
      available: boolean;
      days: number;
      submissions: number;
      withErrors: number;
      lastSubmission: string | null;
    };
  } = {
    neoserraConfigured: neoserraConfigured(),
    gravityForms: { configured: gfConfigured(), totalEntries: null, lastEntry: null },
    backendLog: { available: false, days: 7, submissions: 0, withErrors: 0, lastSubmission: null },
  };

  const [logResult, gfResult] = await Promise.allSettled([
    fetchMilestoneLog(7),
    health.gravityForms.configured ? fetchStep2Entries({ pageSize: 1 }) : Promise.resolve(null),
  ]);

  if (logResult.status === 'fulfilled') {
    const entries = logResult.value;
    health.backendLog = {
      available: true,
      days: 7,
      submissions: entries.length,
      withErrors: entries.filter((e) => e.errors && e.errors.length > 0).length,
      lastSubmission: entries[0]?.timestamp ?? null,
    };
  }
  if (gfResult.status === 'fulfilled' && gfResult.value) {
    health.gravityForms.totalEntries = gfResult.value.totalCount;
    health.gravityForms.lastEntry = gfResult.value.entries[0]?.dateCreated ?? null;
  }

  return NextResponse.json(health);
}
