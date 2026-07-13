import { REGIONS } from './regions';
import type { MapStyle } from './types';

/* ═══════════════════════════════════════════════════════
   Map design — the shared, customizable look of the map.
   DEFAULT_STYLE reproduces the Editorial appearance; the
   Design panel edits a MapStyle stored in the workspace so
   changes are shared and flow through to exports.
   ═══════════════════════════════════════════════════════ */

export const BASEMAP_OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'streets-v2', label: 'Streets' },
  { id: 'basic-v2', label: 'Minimal' },
  { id: 'dataviz', label: 'Light gray' },
  { id: 'topo-v2', label: 'Terrain' },
  { id: 'satellite', label: 'Satellite' },
  { id: 'none', label: 'None (color only)' },
];

const BASEMAP_IDS = new Set(BASEMAP_OPTIONS.map((option) => option.id));

export const DEFAULT_STYLE: MapStyle = {
  regionColors: Object.fromEntries(REGIONS.map((region) => [String(region.id), region.color])),
  hostColor: '#16233a',
  hostBorder: '#d9a441',
  branchColor: '#4ba3a0',
  branchBorder: '#ffffff',
  borderColor: '#f7f4ee',
  borderWidth: 3,
  territoryOpacity: 0.82,
  choroplethFrom: '#eef2f8',
  choroplethTo: '#2b5ea7',
  basemap: 'streets-v2',
  paper: '#f7f4ee',
};

/* Previous defaults. Any stored value still equal to its legacy default is an
   untouched field, so we upgrade it to the current default on read — this
   refreshes maps saved with the old palette without discarding a color a user
   deliberately chose. */
const LEGACY_DEFAULTS: Record<string, string> = {
  '1': '#1A3FA3',
  '2': '#B23A48',
  '3': '#0B5E50',
  '4': '#B08A3E',
  '5': '#6D6EB4',
  '6': '#3B7F96',
  '7': '#D26A4A',
  '8': '#667F3D',
  hostColor: '#1a3fa3',
  hostBorder: '#b08a3e',
  branchColor: '#3b7f96',
  borderColor: '#ffffff',
  choroplethTo: '#1a3fa3',
  paper: '#e8e2d6',
};

/* Keep a stored color unless it is absent/invalid (→ new default) or exactly
   the old default (→ upgrade to new default). */
function migrateColor(stored: unknown, legacyKey: string, next: string): string {
  if (!isValidHex(stored)) return next;
  const value = (stored as string).trim();
  const legacy = LEGACY_DEFAULTS[legacyKey];
  return legacy && value.toLowerCase() === legacy.toLowerCase() ? next : value;
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isValidHex(value: unknown): value is string {
  return typeof value === 'string' && HEX.test(value.trim());
}

function hex(value: unknown, fallback: string): string {
  return isValidHex(value) ? (value as string).trim() : fallback;
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/* Merge a partial/untrusted style over the defaults — used on load, import,
   and server read so a malformed field can never break rendering. */
export function normalizeStyle(source: unknown): MapStyle {
  const raw = (source && typeof source === 'object' ? source : {}) as Partial<MapStyle>;
  const regionColors: Record<string, string> = {};
  REGIONS.forEach((region) => {
    const key = String(region.id);
    regionColors[key] = migrateColor(raw.regionColors?.[key], key, DEFAULT_STYLE.regionColors[key]);
  });
  const basemap = typeof raw.basemap === 'string' && BASEMAP_IDS.has(raw.basemap) ? raw.basemap : DEFAULT_STYLE.basemap;
  return {
    regionColors,
    hostColor: migrateColor(raw.hostColor, 'hostColor', DEFAULT_STYLE.hostColor),
    hostBorder: migrateColor(raw.hostBorder, 'hostBorder', DEFAULT_STYLE.hostBorder),
    branchColor: migrateColor(raw.branchColor, 'branchColor', DEFAULT_STYLE.branchColor),
    branchBorder: hex(raw.branchBorder, DEFAULT_STYLE.branchBorder),
    borderColor: migrateColor(raw.borderColor, 'borderColor', DEFAULT_STYLE.borderColor),
    borderWidth: clamp(raw.borderWidth, 0, 8, DEFAULT_STYLE.borderWidth),
    territoryOpacity: clamp(raw.territoryOpacity, 0.1, 1, DEFAULT_STYLE.territoryOpacity),
    choroplethFrom: hex(raw.choroplethFrom, DEFAULT_STYLE.choroplethFrom),
    choroplethTo: migrateColor(raw.choroplethTo, 'choroplethTo', DEFAULT_STYLE.choroplethTo),
    basemap,
    paper: migrateColor(raw.paper, 'paper', DEFAULT_STYLE.paper),
  };
}

export function resolveRegionColor(style: MapStyle, regionId: number | string): string {
  return style.regionColors[String(regionId)] || DEFAULT_STYLE.regionColors[String(regionId)] || '#888888';
}
