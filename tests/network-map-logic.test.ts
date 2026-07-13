import { describe, expect, it } from 'vitest';
import {
  choroplethColor,
  filteredLocations,
  formatMoney,
  markerSize,
  metricForRegion,
  mixColor,
  normalizeLocation,
  normalizeState,
  regionIdFrom,
  regionStats,
} from '@/components/network-map/logic';
import { shouldNudgeBackup } from '@/components/network-map/storage';
import type { NetworkLocation } from '@/components/network-map/types';

function location(overrides: Partial<NetworkLocation>): NetworkLocation {
  return {
    id: 'x',
    type: 'branch',
    name: 'Test',
    regionId: 1,
    address: '',
    investment: 0,
    lat: null,
    lon: null,
    notes: '',
    ...overrides,
  };
}

describe('formatMoney', () => {
  // Thresholds pinned to the prototype implementation — these strings appear
  // in stats, labels, legend, rollups, and tooltips.
  it('formats compact currency exactly like the prototype', () => {
    expect(formatMoney(9500000, true)).toBe('$9.50M');
    expect(formatMoney(12000000, true)).toBe('$12M');
    expect(formatMoney(2000000, true)).toBe('$2M');
    expect(formatMoney(85000, true)).toBe('$85K');
    expect(formatMoney(1500, true)).toBe('$1.5K');
    expect(formatMoney(150000, true)).toBe('$150K');
    expect(formatMoney(850, true)).toBe('$850');
    expect(formatMoney(0, true)).toBe('$0');
  });

  it('formats full currency without compaction', () => {
    expect(formatMoney(1234567)).toBe('$1,234,567');
  });
});

describe('regionIdFrom', () => {
  it('accepts ids, names, and "region N"', () => {
    expect(regionIdFrom(3)).toBe(3);
    expect(regionIdFrom('3')).toBe(3);
    expect(regionIdFrom('Silicon Valley')).toBe(8);
    expect(regionIdFrom('north state')).toBe(2);
    expect(regionIdFrom('region 5')).toBe(5);
  });

  it('rejects unknown values', () => {
    expect(regionIdFrom(9)).toBeNull();
    expect(regionIdFrom(0)).toBeNull();
    expect(regionIdFrom('Fresno Region')).toBeNull();
    expect(regionIdFrom('')).toBeNull();
    expect(regionIdFrom(null)).toBeNull();
  });
});

describe('normalizeLocation', () => {
  it('applies prototype field aliases', () => {
    const result = normalizeLocation({
      organization: 'Alias Org',
      territory: 'East Bay',
      lng: -122.27,
      latitude: 37.8,
      invest: '75000',
      type: 'Host',
    })!;
    expect(result.name).toBe('Alias Org');
    expect(result.regionId).toBe(6);
    expect(result.lon).toBe(-122.27);
    expect(result.lat).toBe(37.8);
    expect(result.investment).toBe(75000);
    expect(result.type).toBe('host');
  });

  it('defaults and clamps like the prototype', () => {
    const result = normalizeLocation({ name: 'X', region: 'not a region', investment: -50, type: 'office' })!;
    expect(result.regionId).toBe(1); // documented prototype behavior (import report improves this in phase 1.5)
    expect(result.investment).toBe(0);
    expect(result.type).toBe('branch');
    expect(result.lat).toBeNull();
    expect(result.id).toBeTruthy();
  });

  it('rejects non-objects', () => {
    expect(normalizeLocation(null)).toBeNull();
    expect(normalizeLocation('text')).toBeNull();
  });
});

describe('regionStats + metricForRegion', () => {
  const locations = [
    location({ type: 'host', regionId: 2, investment: 500000 }),
    location({ type: 'branch', regionId: 2, investment: 75000 }),
    location({ type: 'branch', regionId: 8, investment: 25000 }),
  ];

  it('aggregates hosts and branches per region', () => {
    const stats = regionStats(locations);
    expect(stats[2]).toEqual({ hosts: 1, branches: 1, hostInvestment: 500000, branchInvestment: 75000, total: 575000 });
    expect(stats[8].total).toBe(25000);
    expect(stats[1].total).toBe(0);
  });

  it('selects the metric for the active fill mode', () => {
    const stats = regionStats(locations);
    expect(metricForRegion(stats, 'total', 2)).toBe(575000);
    expect(metricForRegion(stats, 'host', 2)).toBe(500000);
    expect(metricForRegion(stats, 'branch', 2)).toBe(75000);
    expect(metricForRegion(stats, 'territories', 2)).toBe(575000);
  });
});

describe('filteredLocations', () => {
  const locations = [
    location({ id: 'a', type: 'host', regionId: 2, name: 'Chico Host', address: 'Main St' }),
    location({ id: 'b', type: 'branch', regionId: 2, name: 'Oroville Branch' }),
    location({ id: 'c', type: 'branch', regionId: 8, name: 'San Jose Branch', notes: 'startup corridor' }),
  ];
  const base = {
    theme: 'brand',
    fillMode: 'territories' as const,
    showHosts: true,
    showBranches: true,
    showRegionLabels: true,
    showCounties: true,
    scaleMarkers: false,
    regionFilter: 'all',
    search: '',
  };

  it('filters by region, type, and search (name/address/notes/region/type words)', () => {
    expect(filteredLocations(locations, base)).toHaveLength(3);
    expect(filteredLocations(locations, { ...base, regionFilter: '2' }).map((l) => l.id)).toEqual(['a', 'b']);
    expect(filteredLocations(locations, { ...base, showBranches: false }).map((l) => l.id)).toEqual(['a']);
    expect(filteredLocations(locations, { ...base, search: 'corridor' }).map((l) => l.id)).toEqual(['c']);
    expect(filteredLocations(locations, { ...base, search: 'silicon valley' }).map((l) => l.id)).toEqual(['c']);
    expect(filteredLocations(locations, { ...base, search: 'host' }).map((l) => l.id)).toEqual(['a']);
  });
});

describe('rendering math', () => {
  it('mixes colors channel-wise', () => {
    expect(mixColor('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixColor('#000000', '#ffffff', -1)).toBe('#000000');
    expect(mixColor('#000000', '#ffffff', 2)).toBe('#ffffff');
  });

  it('applies the choropleth ramp with sqrt scaling', () => {
    expect(choroplethColor(0, 100)).toBe('#eef1f4');
    expect(choroplethColor(50, 0)).toBe('#eef1f4');
    expect(choroplethColor(100, 100)).toBe('#1a3fa3'); // 0.18 + 0.82·√1 = 1
    expect(choroplethColor(25, 100)).toBe(mixColor('#eef2f8', '#1a3fa3', 0.18 + 0.82 * 0.5));
  });

  it('sizes markers by type and scaled investment', () => {
    const host = location({ type: 'host', investment: 400000 });
    const branch = location({ type: 'branch', investment: 100000 });
    expect(markerSize(host, 400000, false)).toBe(30);
    expect(markerSize(branch, 400000, false)).toBe(20);
    expect(markerSize(host, 400000, true)).toBe(48); // 30 + 18·√1
    expect(markerSize(branch, 400000, true)).toBe(27); // 20 + 14·0.5
    expect(markerSize(host, 0, true)).toBe(30);
  });
});

describe('normalizeState', () => {
  it('builds a v3 workspace with defaults from arbitrary input', () => {
    const state = normalizeState({ locations: [{ name: 'Solo' }], settings: { fillMode: 'host' } });
    expect(state.version).toBe(3);
    expect(state.force).toBe(false);
    expect(state.locations).toHaveLength(1);
    expect(state.settings.fillMode).toBe('host');
    expect(state.settings.regionFilter).toBe('all');
  });

  it('tolerates garbage', () => {
    const state = normalizeState(undefined);
    expect(state.locations).toEqual([]);
    expect(state.settings.theme).toBe('brand');
  });
});

describe('shouldNudgeBackup', () => {
  const now = new Date('2026-07-13T12:00:00Z');

  it('stays quiet with no data or no un-exported edits', () => {
    expect(shouldNudgeBackup({ lastExportAt: null, editsSinceExport: 5, nudgeSnoozedUntil: null }, 0, now)).toBe(false);
    expect(shouldNudgeBackup({ lastExportAt: null, editsSinceExport: 0, nudgeSnoozedUntil: null }, 3, now)).toBe(false);
  });

  it('nudges when edits were never exported or the backup is stale', () => {
    expect(shouldNudgeBackup({ lastExportAt: null, editsSinceExport: 1, nudgeSnoozedUntil: null }, 3, now)).toBe(true);
    expect(
      shouldNudgeBackup({ lastExportAt: '2026-07-01T00:00:00Z', editsSinceExport: 1, nudgeSnoozedUntil: null }, 3, now),
    ).toBe(true);
    expect(
      shouldNudgeBackup({ lastExportAt: '2026-07-12T00:00:00Z', editsSinceExport: 1, nudgeSnoozedUntil: null }, 3, now),
    ).toBe(false);
    expect(
      shouldNudgeBackup({ lastExportAt: '2026-07-12T00:00:00Z', editsSinceExport: 25, nudgeSnoozedUntil: null }, 3, now),
    ).toBe(true);
  });

  it('respects the snooze', () => {
    expect(
      shouldNudgeBackup({ lastExportAt: null, editsSinceExport: 30, nudgeSnoozedUntil: '2026-07-20T00:00:00Z' }, 3, now),
    ).toBe(false);
  });
});
