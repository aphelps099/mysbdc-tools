'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { getRegion, REGIONS } from './regions';
import { resolveRegionColor } from './style';
import { drawNetworkMap } from './render-map';
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
   MapCanvas — imperative Leaflet layer for Network Map.
   Ported from the prototype's renderBaseMap / renderMarkers /
   renderRegionLabels; React owns the surrounding UI, this
   component owns the Leaflet object graph. Colors come from
   the shared MapStyle, and renderToCanvas produces exports
   natively (so color coding is always captured).
   ═══════════════════════════════════════════════════════ */

export interface MapHandle {
  flyToLocation(lat: number, lon: number, minZoom: number, openPopupId?: string): void;
  fitNetwork(): void;
  invalidateSize(): void;
  renderToCanvas(scale: number, includeBasemap: boolean): HTMLCanvasElement | null;
}

export interface DraftPreview {
  type: NetworkLocation['type'];
  lat: number;
  lon: number;
  investment: number;
}

interface MapCanvasProps {
  counties: CountyCollection | null;
  borders: BorderCollection | null;
  locations: NetworkLocation[];
  settings: BuilderSettings;
  style: MapStyle;
  preview: DraftPreview | null;
  pickMode: boolean;
  onCountyClick(regionId: number): void;
  onSelectLocation(id: string): void;
  onEditLocation(id: string): void;
  onMapPick(lat: number, lon: number): void;
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';

function escapeHtml(value: unknown): string {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markerIcon(location: NetworkLocation, maxInvestment: number, scaleMarkers: boolean, style: MapStyle): L.DivIcon {
  const size = markerSize(location, maxInvestment, scaleMarkers);
  const isHost = location.type === 'host';
  const label = isHost ? 'H' : 'B';
  const bg = isHost ? style.hostColor : style.branchColor;
  const bd = isHost ? style.hostBorder : style.branchBorder;
  return L.divIcon({
    className: 'nm-div-icon',
    html: `<div class="nm-pin ${location.type}" style="--pin:${size}px;--pin-bg:${bg};--pin-bd:${bd}"><span>${label}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function tileUrl(basemap: string): string {
  return `https://api.maptiler.com/maps/${basemap}/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
}

function popupHtml(location: NetworkLocation): string {
  const region = getRegion(location.regionId);
  return (
    `<div class="nm-popup-kicker">${location.type === 'host' ? 'Territory host' : 'Neighborhood branch'}</div>` +
    `<div class="nm-popup-title">${escapeHtml(location.name)}</div>` +
    `<div class="nm-popup-line">${escapeHtml(region.name)}</div>` +
    (location.address ? `<div class="nm-popup-line">${escapeHtml(location.address)}</div>` : '') +
    `<div class="nm-popup-invest">${formatMoney(location.investment)}</div>` +
    `<div class="nm-popup-actions"><button class="nm-btn nm-btn-small nm-btn-primary" type="button" data-edit-location="${escapeHtml(location.id)}">Edit location</button></div>`
  );
}

const MapCanvas = forwardRef<MapHandle, MapCanvasProps>(function MapCanvas(props, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const countyLayerRef = useRef<L.GeoJSON | null>(null);
  const borderLayerRef = useRef<L.GeoJSON | null>(null);
  const labelLayerRef = useRef<L.LayerGroup | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const previewMarkerRef = useRef<L.Marker | null>(null);
  const markerIndexRef = useRef<Map<string, L.Marker>>(new Map());
  const countyBoundsRef = useRef<L.LatLngBounds | null>(null);
  const didInitialFitRef = useRef(false);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const logoControlRef = useRef<L.Control | null>(null);
  const [basemapDown, setBasemapDown] = useState(false);

  // Latest props for stable Leaflet event handlers.
  const propsRef = useRef(props);
  propsRef.current = props;

  /* ── Map init (once) ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 5,
      maxZoom: 18,
    });
    map.setView([39.3, -121.9], 6); // provisional; replaced by county-bounds fit
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ position: 'bottomright', imperial: true, metric: false }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    labelLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (event: L.LeafletMouseEvent) => {
      if (!propsRef.current.pickMode) return;
      propsRef.current.onMapPick(event.latlng.lat, event.latlng.lng);
    });

    // Popup "Edit location" buttons (popups render inside the map container).
    const onContainerClick = (event: Event) => {
      const button = (event.target as HTMLElement).closest('[data-edit-location]');
      if (button) propsRef.current.onEditLocation((button as HTMLElement).dataset.editLocation!);
    };
    container.addEventListener('click', onContainerClick);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      window.removeEventListener('resize', onResize);
      container.removeEventListener('click', onContainerClick);
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      logoControlRef.current = null;
      didInitialFitRef.current = false;
    };
  }, []);

  /* ── Basemap: swap the tile layer when the chosen style changes ── */
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return;
    container.style.background = props.style.paper;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const none = props.style.basemap === 'none' || !MAPTILER_KEY;
    setBasemapDown(none && !MAPTILER_KEY);

    if (!none) {
      let tileErrors = 0;
      const tiles = L.tileLayer(tileUrl(props.style.basemap), {
        maxZoom: 18,
        crossOrigin: true,
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
      });
      tiles.on('tileerror', () => {
        tileErrors += 1;
        if (tileErrors >= 4) setBasemapDown(true);
      });
      tiles.on('tileload', () => {
        tileErrors = 0;
        setBasemapDown(false);
      });
      tiles.addTo(map);
      tiles.bringToBack();
      tileLayerRef.current = tiles;
    }

    // MapTiler logo — required whenever a MapTiler basemap is shown.
    if (!logoControlRef.current && !none) {
      const LogoControl = L.Control.extend({
        onAdd() {
          const node = L.DomUtil.create('div', 'nm-maptiler-logo');
          node.innerHTML =
            '<a href="https://www.maptiler.com" target="_blank" rel="noreferrer"><img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo" width="80" height="24"></a>';
          return node;
        },
      });
      const control = new LogoControl({ position: 'bottomleft' });
      control.addTo(map);
      logoControlRef.current = control;
    } else if (logoControlRef.current && none) {
      map.removeControl(logoControlRef.current);
      logoControlRef.current = null;
    }
  }, [props.style.basemap, props.style.paper]);

  /* ── County choropleth + region borders + labels ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !props.counties) return;

    const stats = regionStats(props.locations);
    const { fillMode, showCounties, showRegionLabels } = props.settings;

    if (countyLayerRef.current) map.removeLayer(countyLayerRef.current);
    if (borderLayerRef.current) map.removeLayer(borderLayerRef.current);

    const values = REGIONS.map((region) => metricForRegion(stats, fillMode, region.id));
    const max = Math.max(...values, 0);

    const style = props.style;
    const countyStyle = (feature?: GeoJSON.Feature): L.PathOptions => {
      const region = getRegion((feature?.properties as { region: number }).region);
      const fillColor =
        fillMode === 'territories'
          ? resolveRegionColor(style, region.id)
          : choroplethColor(metricForRegion(stats, fillMode, region.id), max, style.choroplethFrom, style.choroplethTo);
      return {
        color: showCounties ? 'rgba(247,244,238,.9)' : fillColor,
        weight: showCounties ? 0.75 : 0,
        opacity: 1,
        fillColor,
        fillOpacity: fillMode === 'territories' ? style.territoryOpacity : 0.68,
      };
    };

    const countyLayer = L.geoJSON(props.counties, {
      style: countyStyle,
      onEachFeature: (feature, layer) => {
        const properties = feature.properties as { name: string; region: number };
        const region = getRegion(properties.region);
        const row = stats[region.id];
        (layer as L.Path).bindTooltip(
          `<strong>${escapeHtml(region.name)}</strong><br>${escapeHtml(properties.name)} County<br>${formatMoney(row.total, true)} network investment`,
          { sticky: true, direction: 'top' },
        );
        layer.on('mouseover', () => {
          (layer as L.Path).setStyle({ weight: 2, color: '#0e1a2b', fillOpacity: 0.76 });
          (layer as L.Path).bringToFront();
        });
        layer.on('mouseout', () => countyLayer.resetStyle(layer as L.Path));
        layer.on('click', () => {
          // In pick mode the map-level click handler places the pin; the
          // county filter action would hijack the same click.
          if (propsRef.current.pickMode) return;
          propsRef.current.onCountyClick(region.id);
        });
      },
    }).addTo(map);
    countyLayerRef.current = countyLayer;

    if (props.borders) {
      borderLayerRef.current = L.geoJSON(props.borders, {
        style: { color: style.borderColor, weight: style.borderWidth, opacity: 0.96, fill: false, interactive: false },
      }).addTo(map);
    }
    countyLayer.bringToBack();
    if (tileLayerRef.current) tileLayerRef.current.bringToBack();

    if (!countyBoundsRef.current) countyBoundsRef.current = countyLayer.getBounds();
    if (!didInitialFitRef.current) {
      map.fitBounds(countyBoundsRef.current.pad(0.04));
      didInitialFitRef.current = true;
    }

    const labelLayer = labelLayerRef.current!;
    labelLayer.clearLayers();
    if (showRegionLabels) {
      REGIONS.forEach((region) => {
        const features = props.counties!.features.filter((feature) => feature.properties.region === region.id);
        if (!features.length) return;
        const bounds = L.geoJSON({ type: 'FeatureCollection', features } as GeoJSON.FeatureCollection).getBounds();
        // San Francisco's bounds-center lands in the bay; pin its label onshore.
        const center = region.id === 7 ? L.latLng(37.78, -122.44) : bounds.getCenter();
        const value = stats[region.id].total;
        const html = `<div class="nm-region-label">${escapeHtml(region.name)}${
          fillMode !== 'territories' || value > 0 ? `<small>${formatMoney(value, true)}</small>` : ''
        }</div>`;
        L.marker(center, {
          interactive: false,
          icon: L.divIcon({ className: '', html, iconSize: undefined }),
        }).addTo(labelLayer);
      });
    }
  }, [props.counties, props.borders, props.locations, props.settings, props.style]);

  /* ── Location markers ── */
  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;

    markerLayer.clearLayers();
    markerIndexRef.current = new Map();
    const placed = filteredLocations(props.locations, props.settings).filter(hasCoordinates);
    const maxInvestment = Math.max(...placed.map((location) => location.investment || 0), 0);
    placed.forEach((location) => {
      const marker = L.marker([location.lat!, location.lon!], {
        icon: markerIcon(location, maxInvestment, props.settings.scaleMarkers, props.style),
        keyboard: true,
        title: location.name,
        alt: location.name,
      });
      marker.bindPopup(popupHtml(location));
      marker.on('click', () => propsRef.current.onSelectLocation(location.id));
      marker.addTo(markerLayer);
      markerIndexRef.current.set(location.id, marker);
    });
  }, [props.locations, props.settings, props.style]);

  /* ── Draft preview marker ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (previewMarkerRef.current) {
      map.removeLayer(previewMarkerRef.current);
      previewMarkerRef.current = null;
    }
    if (!props.preview) return;
    const { type, lat, lon, investment } = props.preview;
    const previewLocation: NetworkLocation = {
      id: '__preview__',
      type,
      name: 'Preview',
      regionId: 1,
      address: '',
      investment,
      lat,
      lon,
      notes: '',
    };
    previewMarkerRef.current = L.marker([lat, lon], {
      icon: markerIcon(previewLocation, investment || 0, false, props.style),
      zIndexOffset: 1000,
      interactive: false,
    }).addTo(map);
  }, [props.preview, props.style]);

  /* ── Pick-mode cursor ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getContainer().style.cursor = props.pickMode ? 'crosshair' : '';
  }, [props.pickMode]);

  useImperativeHandle(ref, (): MapHandle => ({
    flyToLocation(lat, lon, minZoom, openPopupId) {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo([lat, lon], Math.max(map.getZoom(), minZoom), { duration: 0.7 });
      if (openPopupId) {
        setTimeout(() => markerIndexRef.current.get(openPopupId)?.openPopup(), 750);
      }
    },
    fitNetwork() {
      const map = mapRef.current;
      if (!map) return;
      const placed = filteredLocations(propsRef.current.locations, propsRef.current.settings).filter(hasCoordinates);
      if (!placed.length) {
        if (countyBoundsRef.current) map.fitBounds(countyBoundsRef.current.pad(0.04));
        return;
      }
      const bounds = L.latLngBounds(placed.map((location) => [location.lat!, location.lon!] as [number, number]));
      map.fitBounds(bounds.pad(0.2), { maxZoom: 12 });
    },
    invalidateSize() {
      setTimeout(() => mapRef.current?.invalidateSize(), 30);
    },
    renderToCanvas(scale, includeBasemap) {
      const map = mapRef.current;
      const { counties } = propsRef.current;
      if (!map || !counties) return null;
      const size = map.getSize();
      const width = size.x;
      const height = size.y;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.scale(scale, scale);

      const style = propsRef.current.style;
      ctx.fillStyle = style.paper;
      ctx.fillRect(0, 0, width, height);

      const wantBasemap = includeBasemap && style.basemap !== 'none' && !!MAPTILER_KEY;
      if (wantBasemap) {
        const container = map.getContainer();
        const mapRect = container.getBoundingClientRect();
        container.querySelectorAll('.leaflet-tile-pane img').forEach((node) => {
          const img = node as HTMLImageElement;
          if (!img.complete || !img.naturalWidth || img.style.opacity === '0') return;
          const rect = img.getBoundingClientRect();
          try {
            ctx.drawImage(img, rect.left - mapRect.left, rect.top - mapRect.top, rect.width, rect.height);
          } catch {
            /* skip a tile that fails to draw */
          }
        });
      }

      drawNetworkMap(ctx, {
        width,
        height,
        project: (lng, lat) => {
          const point = map.latLngToContainerPoint([lat, lng]);
          return { x: point.x, y: point.y };
        },
        counties,
        borders: propsRef.current.borders,
        locations: propsRef.current.locations,
        settings: propsRef.current.settings,
        style,
        title: 'NorCal SBDC Network',
        hasBasemap: wantBasemap,
      });
      return canvas;
    },
  }));

  return (
    <div className="nm-map-stage">
      <div ref={containerRef} className="nm-map" role="application" aria-label="NorCal SBDC network map" />
      {basemapDown && props.style.basemap !== 'none' && (
        <div className="nm-basemap-notice" role="status">
          {MAPTILER_KEY
            ? 'Basemap tiles are unavailable — region data still works.'
            : 'No map key configured — showing region data without a basemap.'}
        </div>
      )}
    </div>
  );
});

export default MapCanvas;
