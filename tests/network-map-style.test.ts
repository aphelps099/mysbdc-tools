import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_STYLE, isValidHex, normalizeStyle, resolveRegionColor } from '@/components/network-map/style';
import { normalizeState } from '@/components/network-map/logic';
import { drawNetworkMap, regionLabelPoints } from '@/components/network-map/render-map';
import { REGIONS } from '@/components/network-map/regions';
import type { CountyCollection } from '@/components/network-map/types';

const counties: CountyCollection = JSON.parse(
  readFileSync(path.resolve(__dirname, '../public/data/network-map/counties.v1.geojson'), 'utf8'),
);

describe('style normalization', () => {
  it('provides a full default style with a color per region', () => {
    expect(Object.keys(DEFAULT_STYLE.regionColors)).toHaveLength(REGIONS.length);
    REGIONS.forEach((region) => {
      expect(isValidHex(DEFAULT_STYLE.regionColors[String(region.id)])).toBe(true);
    });
  });

  it('merges partial input over defaults and keeps valid overrides', () => {
    const style = normalizeStyle({ hostColor: '#ff0000', regionColors: { '2': '#00ff00' }, basemap: 'satellite' });
    expect(style.hostColor).toBe('#ff0000');
    expect(style.regionColors['2']).toBe('#00ff00');
    expect(style.regionColors['1']).toBe(DEFAULT_STYLE.regionColors['1']); // untouched region keeps default
    expect(style.basemap).toBe('satellite');
  });

  it('rejects invalid colors, out-of-range numbers, and unknown basemaps', () => {
    const style = normalizeStyle({
      hostColor: 'not-a-color',
      borderWidth: 999,
      territoryOpacity: 5,
      basemap: 'evil-style',
      regionColors: { '1': 'javascript:alert(1)' },
    });
    expect(style.hostColor).toBe(DEFAULT_STYLE.hostColor);
    expect(style.borderWidth).toBe(8); // clamped to max
    expect(style.territoryOpacity).toBe(1); // clamped
    expect(style.basemap).toBe(DEFAULT_STYLE.basemap);
    expect(style.regionColors['1']).toBe(DEFAULT_STYLE.regionColors['1']);
  });

  it('accepts 3- and 6-digit hex', () => {
    expect(isValidHex('#abc')).toBe(true);
    expect(isValidHex('#AABBCC')).toBe(true);
    expect(isValidHex('#gggggg')).toBe(false);
    expect(isValidHex('red')).toBe(false);
  });

  it('resolveRegionColor falls back safely', () => {
    expect(resolveRegionColor(DEFAULT_STYLE, 3)).toBe(DEFAULT_STYLE.regionColors['3']);
    expect(isValidHex(resolveRegionColor(DEFAULT_STYLE, 99))).toBe(true);
  });
});

describe('workspace carries style', () => {
  it('normalizeState always yields a valid style', () => {
    expect(normalizeState({}).style).toEqual(DEFAULT_STYLE);
    const custom = normalizeState({ style: { hostColor: '#123456' } });
    expect(custom.style.hostColor).toBe('#123456');
  });

  it('round-trips a customized style', () => {
    const first = normalizeState({ locations: [{ name: 'A' }], style: { branchColor: '#abcdef' } });
    const second = normalizeState(JSON.parse(JSON.stringify(first)));
    expect(second.style).toEqual(first.style);
  });
});

describe('region label anchors', () => {
  it('gives every region an anchor, with the SF override', () => {
    const anchors = regionLabelPoints(counties);
    expect(Object.keys(anchors)).toHaveLength(REGIONS.length);
    expect(anchors[7]).toEqual([37.78, -122.44]);
    // Region anchors fall within the NorCal bbox.
    Object.values(anchors).forEach(([lat, lon]) => {
      expect(lat).toBeGreaterThan(36);
      expect(lat).toBeLessThan(43);
      expect(lon).toBeGreaterThan(-125);
      expect(lon).toBeLessThan(-119);
    });
  });
});

describe('drawNetworkMap', () => {
  // A stub 2D context that records fill colors so we can prove the renderer
  // paints custom region/pin colors (jsdom has no real canvas).
  function stubCtx() {
    const fills: string[] = [];
    const strokes: string[] = [];
    const state = { _fill: '', _stroke: '' };
    return {
      calls: { fills, strokes },
      ctx: new Proxy(
        {
          save() {},
          restore() {},
          beginPath() {},
          closePath() {},
          moveTo() {},
          lineTo() {},
          arc() {},
          arcTo() {},
          translate() {},
          scale() {},
          fillRect() {},
          measureText() {
            return { width: 40 };
          },
          fillText() {},
          stroke() {
            strokes.push(state._stroke);
          },
          fill() {
            fills.push(state._fill);
          },
        } as unknown as CanvasRenderingContext2D,
        {
          set(target, prop, value) {
            if (prop === 'fillStyle') state._fill = String(value);
            if (prop === 'strokeStyle') state._stroke = String(value);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (target as any)[prop] = value;
            return true;
          },
          get(target, prop) {
            if (prop === 'fillStyle') return state._fill;
            if (prop === 'strokeStyle') return state._stroke;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (target as any)[prop];
          },
        },
      ),
    };
  }

  it('paints custom region and pin colors without throwing', () => {
    const { ctx, calls } = stubCtx();
    const style = normalizeStyle({
      regionColors: { '2': '#abcdef' },
      hostColor: '#ff00ff',
      borderColor: '#010203',
    });
    const project = vi.fn((lng: number, lat: number) => ({ x: (lng + 124) * 100, y: (42 - lat) * 100 }));

    drawNetworkMap(ctx, {
      width: 800,
      height: 600,
      project,
      counties,
      borders: null,
      locations: [
        { id: '1', type: 'host', name: 'H', regionId: 2, address: '', investment: 100, lat: 39.7, lon: -121.8, notes: '' },
      ],
      settings: {
        theme: 'brand',
        fillMode: 'territories',
        showHosts: true,
        showBranches: true,
        showRegionLabels: true,
        showCounties: true,
        scaleMarkers: false,
        regionFilter: 'all',
        search: '',
      },
      style,
      hasBasemap: false,
    });

    expect(project).toHaveBeenCalled();
    // A region-2 county was filled with the custom color, and the host pin too.
    expect(calls.fills).toContain('#abcdef');
    expect(calls.fills).toContain('#ff00ff');
  });
});
