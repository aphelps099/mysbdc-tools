/* ═══════════════════════════════════════════════════════
   Marketing Engine — Google Sheet (system of record)
   One spreadsheet (SHEET_ID), one tab ("Events"), exact
   column order per spec. Everything reads/writes through
   this lib. Uses the same service account as Drive —
   the Sheet must be shared with the service-account email
   (Editor).
   ═══════════════════════════════════════════════════════ */

import { google, sheets_v4 } from 'googleapis';

export const SHEET_TAB = 'Events';

export const COLUMNS = [
  'slug', 'center', 'title', 'start_date', 'start_time', 'end_time', 'format', 'language',
  'event_url', 'rebrandly_link_id', 'shortlink', 'copy_tweet', 'copy_linkedin', 'copy_email',
  'status', 'motion_deeplink', 'video_16x9', 'video_9x16', 'video_1x1', 'project_json_url',
  'click_count', 'approved_by', 'posted_at', 'notes', 'created_at', 'updated_at',
] as const;

export type Column = typeof COLUMNS[number];
export type EventRow = Partial<Record<Column, string>>;
export interface SheetRow extends EventRow {
  /** 1-based spreadsheet row number (header = 1, first data row = 2). */
  rowIndex: number;
}

const LAST_COL = 'Z'; // 26 columns exactly

/** Minimal surface of the Sheets client we use — injectable for tests. */
export interface SheetsApi {
  get(range: string): Promise<string[][]>;
  update(range: string, values: string[][]): Promise<void>;
  append(range: string, values: string[][]): Promise<void>;
}

function getCredentials(): { email: string; key: string } {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set');
  const json = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
  return { email: json.client_email, key: json.private_key };
}

export function realSheetsApi(sheetId: string): SheetsApi {
  const creds = getCredentials();
  const auth = new google.auth.JWT({
    email: creds.email,
    key: creds.key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth });
  return {
    async get(range) {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
      return (res.data.values ?? []) as string[][];
    },
    async update(range, values) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values },
      });
    },
    async append(range, values) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values },
      });
    },
  };
}

function rowToRecord(row: string[], rowIndex: number): SheetRow {
  const rec: SheetRow = { rowIndex };
  COLUMNS.forEach((col, i) => { rec[col] = row[i] ?? ''; });
  return rec;
}

function recordToRow(rec: EventRow): string[] {
  return COLUMNS.map((col) => rec[col] ?? '');
}

export class EventSheet {
  constructor(private api: SheetsApi) {}

  static fromEnv(): EventSheet {
    const sheetId = process.env.SHEET_ID;
    if (!sheetId) throw new Error('SHEET_ID not set');
    return new EventSheet(realSheetsApi(sheetId));
  }

  /** Write the header row if the tab is empty. Idempotent. */
  async ensureHeader(): Promise<void> {
    const head = await this.api.get(`${SHEET_TAB}!A1:${LAST_COL}1`);
    if (!head.length || !head[0]?.length) {
      await this.api.update(`${SHEET_TAB}!A1:${LAST_COL}1`, [[...COLUMNS]]);
    }
  }

  async listAll(): Promise<SheetRow[]> {
    const rows = await this.api.get(`${SHEET_TAB}!A2:${LAST_COL}`);
    return rows
      .map((r, i) => rowToRecord(r, i + 2))
      .filter((r) => (r.slug ?? '').trim().length > 0);
  }

  async findRowBySlug(slug: string): Promise<SheetRow | null> {
    const all = await this.listAll();
    return all.find((r) => r.slug === slug) ?? null;
  }

  async listRowsByStatus(status: string): Promise<SheetRow[]> {
    return (await this.listAll()).filter((r) => r.status === status);
  }

  async appendEvent(rec: EventRow): Promise<void> {
    const now = new Date().toISOString();
    await this.api.append(`${SHEET_TAB}!A1:${LAST_COL}1`, [
      recordToRow({ created_at: now, updated_at: now, ...rec }),
    ]);
  }

  /** Merge-update one row (reads current values, overlays the patch). */
  async updateEvent(rowIndex: number, patch: EventRow): Promise<void> {
    const cur = await this.api.get(`${SHEET_TAB}!A${rowIndex}:${LAST_COL}${rowIndex}`);
    const existing = rowToRecord(cur[0] ?? [], rowIndex);
    const { rowIndex: _drop, ...existingCols } = existing;
    void _drop;
    const merged: EventRow = { ...existingCols, ...patch, updated_at: new Date().toISOString() };
    await this.api.update(`${SHEET_TAB}!A${rowIndex}:${LAST_COL}${rowIndex}`, [recordToRow(merged)]);
  }
}
