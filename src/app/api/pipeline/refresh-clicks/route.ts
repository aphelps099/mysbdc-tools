import { NextRequest } from 'next/server';
import { requirePipelineAuth, requireEnv } from '@/lib/pipeline/auth';
import { EventSheet } from '@/lib/pipeline/sheet';
import { getClicks } from '@/lib/pipeline/rebrandly';

/**
 * Marketing Engine — refresh Rebrandly click counts into the Sheet.
 * Iterates rows that have a rebrandly_link_id and writes `click_count`.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const denied = requirePipelineAuth(req);
  if (denied) return denied;
  const envMissing = requireEnv('SHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_KEY', 'REBRANDLY_API_KEY');
  if (envMissing) return envMissing;

  const sheet = EventSheet.fromEnv();
  const rows = (await sheet.listAll()).filter((r) => (r.rebrandly_link_id ?? '').trim());
  let updated = 0;
  const errors: { slug: string; message: string }[] = [];

  for (const row of rows) {
    try {
      const clicks = await getClicks(row.rebrandly_link_id as string);
      if (String(clicks) !== (row.click_count ?? '')) {
        await sheet.updateEvent(row.rowIndex, { click_count: String(clicks) });
        updated += 1;
      }
    } catch (e) {
      errors.push({ slug: row.slug ?? '?', message: e instanceof Error ? e.message : 'unknown' });
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log('[refresh-clicks]', JSON.stringify({ total: rows.length, updated, errors: errors.length }));
  return Response.json({ total: rows.length, updated, errors });
}
