import type { Geometry, Position } from 'geojson';
import { REGIONS, getRegion } from './regions';
import type {
  BuilderSettings,
  CountyCollection,
  FillMode,
  NetworkLocation,
  RegionStats,
  Workspace,
} from './types';

/* ═══════════════════════════════════════════════════════
   Network Map — pure logic, ported from the prototype.
   No browser or Leaflet dependencies: everything here is
   unit-testable under vitest's node environment, and the
   formulas are pinned by tests because they define what
   users see (rollups, choropleth, marker sizes, labels).
   ═══════════════════════════════════════════════════════ */

export const DEFAULT_SETTINGS: BuilderSettings = {
  theme: 'brand',
  fillMode: 'territories',
  showHosts: true,
  showBranches: true,
  showRegionLabels: true,
  showCounties: true,
  scaleMarkers: false,
  regionFilter: 'all',
  search: '',
};

export function finiteNumber(value: unknown): number | null {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'loc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/* Accepts a region id (1-8), an exact region name, or "region N". */
export function regionIdFrom(value: unknown): number | null {
  if (value == null || value === '') return null;
  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 8) return numeric;
  const normalized = String(value).trim().toLowerCase();
  const match = REGIONS.find(
    (region) => region.name.toLowerCase() === normalized || 'region ' + region.id === normalized,
  );
  return match ? match.id : null;
}

/* Field aliases (organization, territory, lng, invest, …) mirror the
   prototype so its JSON backups import unchanged. */
export function normalizeLocation(item: unknown): NetworkLocation | null {
  if (!item || typeof item !== 'object') return null;
  const raw = item as Record<string, unknown>;
  const regionValue = regionIdFrom(raw.regionId ?? raw.region ?? raw.territory);
  const lat = finiteNumber(raw.lat ?? raw.latitude);
  const lon = finiteNumber(raw.lon ?? raw.lng ?? raw.longitude);
  return {
    id: String(raw.id || makeId()),
    type: String(raw.type || 'branch').toLowerCase() === 'host' ? 'host' : 'branch',
    name: String(raw.name || raw.organization || 'Unnamed location'),
    regionId: regionValue || 1,
    address: String(raw.address || ''),
    investment: Math.max(0, finiteNumber(raw.investment ?? raw.invest) || 0),
    lat,
    lon,
    notes: String(raw.notes || ''),
  };
}

export function normalizeState(source: unknown): Workspace {
  const raw = (source && typeof source === 'object' ? source : {}) as Record<string, unknown>;
  const locations = Array.isArray(raw.locations)
    ? raw.locations.map(normalizeLocation).filter((l): l is NetworkLocation => l !== null)
    : [];
  return {
    version: 3,
    force: false,
    locations,
    settings: { ...DEFAULT_SETTINGS, ...(raw.settings && typeof raw.settings === 'object' ? raw.settings : {}) },
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

export function hasCoordinates(location: NetworkLocation): boolean {
  return Number.isFinite(location.lat as number) && Number.isFinite(location.lon as number);
}

/* Compact thresholds pinned by tests: 9,500,000 → $9.5M; 12,000,000 → $12M;
   85,000 → $85K; 850 → $850. */
export function formatMoney(value: number, compact = false): string {
  const number = Number(value) || 0;
  if (compact && Math.abs(number) >= 1000000) {
    return '$' + (number / 1000000).toFixed(number >= 10000000 ? 1 : 2).replace(/\.0+$/, '') + 'M';
  }
  if (compact && Math.abs(number) >= 1000) {
    return '$' + (number / 1000).toFixed(number >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'K';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(number);
}

export function regionStats(locations: NetworkLocation[]): Record<number, RegionStats> {
  const stats: Record<number, RegionStats> = {};
  REGIONS.forEach((region) => {
    stats[region.id] = { hosts: 0, branches: 0, hostInvestment: 0, branchInvestment: 0, total: 0 };
  });
  locations.forEach((location) => {
    const row = stats[location.regionId] || stats[1];
    if (location.type === 'host') {
      row.hosts += 1;
      row.hostInvestment += location.investment || 0;
    } else {
      row.branches += 1;
      row.branchInvestment += location.investment || 0;
    }
    row.total += location.investment || 0;
  });
  return stats;
}

export function metricForRegion(stats: Record<number, RegionStats>, fillMode: FillMode, regionId: number): number {
  const row = stats[regionId];
  if (fillMode === 'host') return row.hostInvestment;
  if (fillMode === 'branch') return row.branchInvestment;
  return row.total;
}

export function filteredLocations(locations: NetworkLocation[], settings: BuilderSettings): NetworkLocation[] {
  const query = settings.search.trim().toLowerCase();
  return locations.filter((location) => {
    if (settings.regionFilter !== 'all' && location.regionId !== Number(settings.regionFilter)) return false;
    if (location.type === 'host' && !settings.showHosts) return false;
    if (location.type === 'branch' && !settings.showBranches) return false;
    if (!query) return true;
    const region = getRegion(location.regionId);
    return [location.name, location.address, location.notes, region.name, location.type]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

export function mixColor(from: string, to: string, amount: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const t = Math.max(0, Math.min(1, amount));
  const part = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return '#' + part(a.r, b.r) + part(a.g, b.g) + part(a.b, b.b);
}

/* Choropleth ramp: mix('#eef2f8','#1a3fa3', 0.18 + 0.82·√(value/max));
   zero/no-data counties render '#eef1f4'. */
export function choroplethColor(value: number, max: number): string {
  return value > 0 && max > 0 ? mixColor('#eef2f8', '#1a3fa3', 0.18 + 0.82 * Math.sqrt(value / max)) : '#eef1f4';
}

/* Host pins 30px base ("H"), branches 20px ("B"); investment scaling adds
   (18 | 14)·√(investment / maxVisibleInvestment). */
export function markerSize(location: NetworkLocation, maxInvestment: number, scaleMarkers: boolean): number {
  const base = location.type === 'host' ? 30 : 20;
  if (!scaleMarkers || !location.investment || !maxInvestment) return base;
  const extra = location.type === 'host' ? 18 : 14;
  return Math.round(base + extra * Math.sqrt(location.investment / maxInvestment));
}

/* ── Region detection (advisory) ──
   Ray-cast point-in-polygon over the simplified county geometry. Borders can
   be ~1-3 km off the legal county lines, so results pre-fill the region
   select and are always user-overridable; null means "outside every
   service-area county" (including bay/coastline artifacts). */

function ringContains(ring: Position[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function polygonContains(rings: Position[][], x: number, y: number): boolean {
  if (!rings.length || !ringContains(rings[0], x, y)) return false;
  for (let i = 1; i < rings.length; i += 1) {
    if (ringContains(rings[i], x, y)) return false;
  }
  return true;
}

export function geometryContains(geometry: Geometry | null | undefined, x: number, y: number): boolean {
  if (!geometry) return false;
  if (geometry.type === 'Polygon') return polygonContains(geometry.coordinates, x, y);
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polygon) => polygonContains(polygon, x, y));
  }
  return false;
}

export function detectRegion(counties: CountyCollection | null, lat: number, lon: number): number | null {
  if (!counties) return null;
  for (const feature of counties.features) {
    if (geometryContains(feature.geometry, lon, lat)) return Number(feature.properties.region);
  }
  return null;
}

export function detectCounty(counties: CountyCollection | null, lat: number, lon: number): string | null {
  if (!counties) return null;
  for (const feature of counties.features) {
    if (geometryContains(feature.geometry, lon, lat)) return feature.properties.name;
  }
  return null;
}
