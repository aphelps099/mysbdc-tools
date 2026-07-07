import { describe, it, expect } from 'vitest';
import { EventSheet, COLUMNS, SheetsApi, SHEET_TAB } from '@/lib/pipeline/sheet';

/** In-memory mock of the Sheets values API. */
function mockApi() {
  const grid: string[][] = [];
  const api: SheetsApi = {
    async get(range) {
      // header
      if (range === `${SHEET_TAB}!A1:Z1`) return grid.length ? [grid[0]] : [];
      // whole data range
      if (range === `${SHEET_TAB}!A2:Z`) return grid.slice(1);
      // single row
      const m = range.match(/!A(\d+):Z(\d+)$/);
      if (m) {
        const idx = Number(m[1]) - 1;
        return grid[idx] ? [grid[idx]] : [];
      }
      throw new Error(`unexpected range ${range}`);
    },
    async update(range, values) {
      const m = range.match(/!A(\d+):Z(\d+)?$/);
      if (!m) throw new Error(`unexpected range ${range}`);
      const idx = Number(m[1]) - 1;
      grid[idx] = values[0];
    },
    async append(_range, values) {
      grid.push(...values);
    },
  };
  return { api, grid };
}

describe('EventSheet', () => {
  it('writes the header once, idempotently', async () => {
    const { api, grid } = mockApi();
    const sheet = new EventSheet(api);
    await sheet.ensureHeader();
    await sheet.ensureHeader();
    expect(grid).toHaveLength(1);
    expect(grid[0]).toEqual([...COLUMNS]);
    expect(grid[0]).toHaveLength(26);
  });

  it('appends and finds rows by slug', async () => {
    const { api } = mockApi();
    const sheet = new EventSheet(api);
    await sheet.ensureHeader();
    await sheet.appendEvent({ slug: 'a-workshop', title: 'A Workshop', status: 'copy_ready' });
    await sheet.appendEvent({ slug: 'b-webinar', title: 'B Webinar', status: 'new' });

    const found = await sheet.findRowBySlug('b-webinar');
    expect(found).not.toBeNull();
    expect(found!.title).toBe('B Webinar');
    expect(found!.rowIndex).toBe(3);
    expect(found!.created_at).toBeTruthy();
    expect(await sheet.findRowBySlug('missing')).toBeNull();
  });

  it('filters by status', async () => {
    const { api } = mockApi();
    const sheet = new EventSheet(api);
    await sheet.ensureHeader();
    await sheet.appendEvent({ slug: 'a', status: 'copy_ready' });
    await sheet.appendEvent({ slug: 'b', status: 'approved' });
    await sheet.appendEvent({ slug: 'c', status: 'approved' });
    expect(await sheet.listRowsByStatus('approved')).toHaveLength(2);
  });

  it('merge-updates a row without clobbering other columns', async () => {
    const { api } = mockApi();
    const sheet = new EventSheet(api);
    await sheet.ensureHeader();
    await sheet.appendEvent({ slug: 'a', title: 'Keep Me', status: 'new' });
    const row = await sheet.findRowBySlug('a');
    await sheet.updateEvent(row!.rowIndex, { status: 'copy_ready', shortlink: 'https://sbdc.events/a' });
    const after = await sheet.findRowBySlug('a');
    expect(after!.title).toBe('Keep Me');
    expect(after!.status).toBe('copy_ready');
    expect(after!.shortlink).toBe('https://sbdc.events/a');
    expect(after!.updated_at).toBeTruthy();
  });
});
