import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { detectCounty, detectRegion, normalizeState } from '@/components/network-map/logic';
import { REGIONS } from '@/components/network-map/regions';
import {
  loadStoredWorkspace,
  saveWorkspace,
  type StorageLike,
} from '@/components/network-map/storage';
import type { CountyCollection } from '@/components/network-map/types';

const counties: CountyCollection = JSON.parse(
  readFileSync(path.resolve(__dirname, '../public/data/network-map/counties.v1.geojson'), 'utf8'),
);

describe('county dataset integrity', () => {
  it('contains exactly 36 counties, each in exactly one configured region', () => {
    expect(counties.features).toHaveLength(36);
    const namesByRegion = new Map(REGIONS.map((region) => [region.id, new Set(region.counties)]));
    for (const feature of counties.features) {
      const { name, region, fips } = feature.properties;
      expect(fips).toMatch(/^06\d{3}$/);
      expect(namesByRegion.get(region)?.has(name), `${name} should belong to region ${region}`).toBe(true);
    }
    const totalConfigured = REGIONS.reduce((sum, region) => sum + region.counties.length, 0);
    expect(totalConfigured).toBe(36);
  });
});

describe('detectRegion (advisory point-in-polygon)', () => {
  const cases: Array<[label: string, lat: number, lon: number, expected: number | null]> = [
    ['San Francisco downtown', 37.7749, -122.4194, 7],
    ['Sacramento downtown', 38.5816, -121.4944, 3],
    ['Chico (Butte)', 39.7285, -121.8375, 2],
    ['Oakland (Alameda)', 37.8044, -122.2712, 6],
    ['San Jose (Santa Clara)', 37.3382, -121.8863, 8],
    ['Ukiah (Mendocino)', 39.1502, -123.2078, 1],
    ['Stockton (San Joaquin)', 37.9577, -121.2908, 4],
    ['Santa Rosa (Sonoma)', 38.4404, -122.7141, 5],
    ['Eureka (Humboldt)', 40.8021, -124.1637, 1],
    ['Fresno — outside the service area', 36.7378, -119.7871, null],
    ['Reno, NV — outside California', 39.5296, -119.8138, null],
    ['Pacific Ocean', 38.0, -124.2, null],
  ];

  it.each(cases)('%s → region %s', (_label, lat, lon, expected) => {
    expect(detectRegion(counties, lat, lon)).toBe(expected);
  });

  it('returns null without county data', () => {
    expect(detectRegion(null, 38.58, -121.49)).toBeNull();
  });

  it('documents the Treasure Island limitation (simplified shoreline)', () => {
    // The island polygon collapsed under simplification and was pruned; real
    // SF addresses there need the manual region override.
    expect(detectRegion(counties, 37.823, -122.371)).toBeNull();
  });

  it('names the detected county', () => {
    expect(detectCounty(counties, 39.7285, -121.8375)).toBe('Butte');
  });
});

describe('prototype v3 backup compatibility', () => {
  const fixture = JSON.parse(
    readFileSync(path.resolve(__dirname, 'fixtures/network-map-prototype-backup.v3.json'), 'utf8'),
  );

  it('imports a prototype JSON backup, including alias fields', () => {
    const state = normalizeState(fixture);
    expect(state.version).toBe(3);
    expect(state.locations).toHaveLength(3);

    const [host, alias, unplaced] = state.locations;
    expect(host.type).toBe('host');
    expect(host.investment).toBe(500000);
    expect(host.regionId).toBe(2);

    expect(alias.name).toBe('Alias Fields Branch');
    expect(alias.type).toBe('branch');
    expect(alias.regionId).toBe(8); // territory: 'Silicon Valley'
    expect(alias.investment).toBe(75000); // invest: '75000'
    expect(alias.lon).toBe(-121.88633); // lng alias

    expect(unplaced.regionId).toBe(5); // region: 'region 5'
    expect(unplaced.lat).toBeNull();

    expect(state.settings.fillMode).toBe('total');
    expect(state.settings.showBranches).toBe(false);
    expect(state.settings.search).toBe('branch');
  });

  it('round-trips losslessly through export/import', () => {
    const first = normalizeState(fixture);
    const second = normalizeState(JSON.parse(JSON.stringify(first)));
    expect(second).toEqual(first);
  });
});

describe('storage layer', () => {
  function fakeStorage(): StorageLike {
    const data = new Map<string, string>();
    return {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => void data.set(key, value),
      removeItem: (key) => void data.delete(key),
    };
  }

  it('persists and restores a workspace', () => {
    const storage = fakeStorage();
    expect(loadStoredWorkspace(storage)).toBeNull();
    const workspace = normalizeState({ locations: [{ name: 'Persisted', regionId: 4 }] });
    saveWorkspace(storage, workspace);
    const restored = loadStoredWorkspace(storage);
    expect(restored).not.toBeNull();
    expect(restored!.locations[0].name).toBe('Persisted');
    expect(restored!.locations[0].regionId).toBe(4);
  });

  it('survives corrupted stored JSON', () => {
    const storage = fakeStorage();
    storage.setItem('norcal-sbdc-network-map-v3', '{not json');
    expect(loadStoredWorkspace(storage)).toBeNull();
  });
});
