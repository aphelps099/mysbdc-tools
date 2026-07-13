import type { Geometry, Position } from 'geojson';
import { getRegion, REGIONS } from './regions';
import { resolveRegionColor } from './style';
import {
  choroplethColor,
  filteredLocations,
  formatMoney,
  hasCoordinates,
  markerSize,
  metricForRegion,
  regionStats,
} from './logic';
import type { BorderCollection, BuilderSettings, CountyCollection, MapStyle, NetworkLocation } from './types';

/* ═══════════════════════════════════════════════════════
   Native map renderer — draws the map to a 2D canvas from
   the data + style, using a caller-supplied lat/lng →
   pixel projection. This is how exports are produced:
   html2canvas cannot reliably capture Leaflet's SVG region
   fills once real tiles load, so we render the color coding
   ourselves and it is always correct. Pure (no Leaflet /
   DOM beyond the passed ctx), so it is unit-testable.
   ═══════════════════════════════════════════════════════ */

export type Project = (lng: number, lat: number) => { x: number; y: number };

export interface RenderOptions {
  width: number;
  height: number;
  project: Project;
  counties: CountyCollection;
  borders: BorderCollection | null;
  locations: NetworkLocation[];
  settings: BuilderSettings;
  style: MapStyle;
  title?: string;
  /* When true the caller already painted a basemap behind us, so counties
     use their normal semi-transparent fill; when false we sit on plain
     paper and can fill a touch more solidly for legibility. */
  hasBasemap?: boolean;
}

/* Label anchor per region: bounds-center of its counties, with the
   San Francisco override (its bounds-center lands in the bay). */
export function regionLabelPoints(counties: CountyCollection): Record<number, [number, number]> {
  const out: Record<number, [number, number]> = {};
  REGIONS.forEach((region) => {
    if (region.id === 7) {
      out[7] = [37.78, -122.44];
      return;
    }
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;
    counties.features
      .filter((feature) => feature.properties.region === region.id)
      .forEach((feature) => {
        eachRing(feature.geometry, (ring) => {
          ring.forEach(([lon, lat]) => {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lon < minLon) minLon = lon;
            if (lon > maxLon) maxLon = lon;
          });
        });
      });
    if (Number.isFinite(minLat)) out[region.id] = [(minLat + maxLat) / 2, (minLon + maxLon) / 2];
  });
  return out;
}

function eachRing(geometry: Geometry, fn: (ring: Position[]) => void): void {
  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach(fn);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((polygon) => polygon.forEach(fn));
  }
}

/* Add a feature's polygon(s) as sub-paths (outer + holes) so fill('evenodd')
   punches the holes out correctly. */
function tracePolygons(ctx: CanvasRenderingContext2D, geometry: Geometry, project: Project): void {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
  for (const rings of polygons) {
    for (const ring of rings) {
      ring.forEach(([lon, lat], index) => {
        const p = project(lon, lat);
        if (index === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
    }
  }
}

function drawPin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fill: string,
  border: string,
  letter: string,
  isHost: boolean,
): void {
  const r = size / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = Math.max(1.5, size * 0.09);
  ctx.strokeStyle = border;
  ctx.fillStyle = fill;
  ctx.beginPath();
  if (isHost) {
    // Rounded diamond.
    ctx.moveTo(0, -r);
    ctx.lineTo(r, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r, 0);
    ctx.closePath();
  } else {
    ctx.arc(0, 0, r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(size * 0.42)}px -apple-system, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 0, size * 0.04);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function drawNetworkMap(ctx: CanvasRenderingContext2D, options: RenderOptions): void {
  const { width, height, project, counties, borders, locations, settings, style, hasBasemap, title } = options;
  const stats = regionStats(locations);
  const { fillMode, showCounties, showRegionLabels } = settings;
  const values = REGIONS.map((region) => metricForRegion(stats, fillMode, region.id));
  const max = Math.max(...values, 0);

  // ── County fills ──
  const territoryOpacity = hasBasemap ? style.territoryOpacity : Math.min(1, style.territoryOpacity + 0.28);
  const investOpacity = hasBasemap ? 0.68 : 0.9;
  for (const feature of counties.features) {
    const region = getRegion(feature.properties.region);
    const fill =
      fillMode === 'territories'
        ? resolveRegionColor(style, region.id)
        : choroplethColor(metricForRegion(stats, fillMode, region.id), max, style.choroplethFrom, style.choroplethTo);
    ctx.beginPath();
    tracePolygons(ctx, feature.geometry, project);
    ctx.globalAlpha = fillMode === 'territories' ? territoryOpacity : investOpacity;
    ctx.fillStyle = fill;
    ctx.fill('evenodd');
    ctx.globalAlpha = 1;
    if (showCounties) {
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = 'rgba(247,244,238,0.9)';
      ctx.stroke();
    }
  }

  // ── Interior region borders ──
  if (borders) {
    ctx.strokeStyle = style.borderColor;
    ctx.lineWidth = style.borderWidth;
    ctx.lineJoin = 'round';
    for (const feature of borders.features) {
      // BorderCollection is FeatureCollection<MultiLineString>.
      for (const line of feature.geometry.coordinates) {
        ctx.beginPath();
        line.forEach(([lon, lat], index) => {
          const p = project(lon, lat);
          if (index === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    }
  }

  // ── Region labels ──
  if (showRegionLabels) {
    const anchors = regionLabelPoints(counties);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    REGIONS.forEach((region) => {
      const anchor = anchors[region.id];
      if (!anchor) return;
      const p = project(anchor[1], anchor[0]);
      if (p.x < -50 || p.x > width + 50 || p.y < -30 || p.y > height + 30) return;
      const value = stats[region.id].total;
      const showValue = fillMode !== 'territories' || value > 0;
      ctx.font = '700 13px Georgia, serif';
      const money = formatMoney(value, true);
      const w = Math.max(ctx.measureText(region.name).width, showValue ? ctx.measureText(money).width : 0) + 16;
      const h = showValue ? 30 : 20;
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      roundRect(ctx, p.x - w / 2, p.y - h / 2, w, h, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(28,36,48,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#1c2430';
      ctx.fillText(region.name, p.x, p.y - (showValue ? 5 : 0));
      if (showValue) {
        ctx.font = '600 10px -apple-system, system-ui, sans-serif';
        ctx.fillStyle = '#66707d';
        ctx.fillText(money, p.x, p.y + 8);
      }
    });
  }

  // ── Pins ──
  const placed = filteredLocations(locations, settings).filter(hasCoordinates);
  const maxInvestment = Math.max(...placed.map((location) => location.investment || 0), 0);
  for (const location of placed) {
    const p = project(location.lon!, location.lat!);
    const size = markerSize(location, maxInvestment, settings.scaleMarkers);
    const isHost = location.type === 'host';
    drawPin(
      ctx,
      p.x,
      p.y,
      size,
      isHost ? style.hostColor : style.branchColor,
      isHost ? style.hostBorder : style.branchBorder,
      isHost ? 'H' : 'B',
      isHost,
    );
  }

  // ── Title card + legend + attribution ──
  if (title) {
    ctx.font = '700 16px Georgia, serif';
    const tw = ctx.measureText(title).width + 24;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    roundRect(ctx, 12, 12, tw, 34, 10);
    ctx.fill();
    ctx.fillStyle = '#1c2430';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 24, 30);
  }

  drawLegend(ctx, height, style);

  ctx.font = '11px -apple-system, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(40,48,60,0.75)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  const credit = hasBasemap ? '© MapTiler © OpenStreetMap contributors' : 'NorCal SBDC Network Map';
  ctx.fillText(credit, width - 8, height - 6);
}

function drawLegend(ctx: CanvasRenderingContext2D, height: number, style: MapStyle): void {
  const x = 14;
  const y = height - 62;
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  roundRect(ctx, x, y, 190, 48, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(28,36,48,0.14)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  drawPin(ctx, x + 18, y + 16, 16, style.hostColor, style.hostBorder, 'H', true);
  ctx.fillStyle = '#1c2430';
  ctx.font = '12px -apple-system, system-ui, sans-serif';
  ctx.fillText('Territory host', x + 34, y + 16);
  drawPin(ctx, x + 18, y + 34, 15, style.branchColor, style.branchBorder, 'B', false);
  ctx.fillStyle = '#1c2430';
  ctx.fillText('Neighborhood branch', x + 34, y + 34);
}
