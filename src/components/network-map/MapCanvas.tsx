'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { getRegion, REGIONS } from './regions';
import {
  choroplethColor,
  filteredLocations,
  formatMoney,
  hasCoordinates,
  markerSize,
  metricForRegion,
  regionStats,
} from './logic';
import type { BorderCollection, BuilderSettings, CountyCollection, NetworkLocation } from './types';

/* ═══════════════════════════════════════════════════════
   MapCanvas — imperative Leaflet layer for Network Map.
   Ported from the prototype's renderBaseMap / renderMarkers /
   renderRegionLabels; React owns the surrounding UI, this
   component owns the Leaflet object graph.
   ═══════════════════════════════════════════════════════ */

export interface MapHandle {
  flyToLocation(lat: number, lon: number, minZoom: number, openPopupId?: string): void;
  fitNetwork(): void;
  invalidateSize(): void;
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

function markerIcon(location: NetworkLocation, maxInvestment: number, scaleMarkers: boolean): L.DivIcon {
  const size = markerSize(location, maxInvestment, scaleMarkers);
  const label = location.type === 'host' ? 'H' : 'B';
  return L.divIcon({
    className: 'nm-div-icon',
    html: `<div class="nm-pin ${location.type}" style="--pin:${size}px"><span>${label}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
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
  const [basemapDown, setBasemapDown] = useState(!MAPTILER_KEY);

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

    if (MAPTILER_KEY) {
      let tileErrors = 0;
      const tiles = L.tileLayer(
        `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
        {
          maxZoom: 18,
          crossOrigin: true,
          attribution:
            '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
        },
      );
      tiles.on('tileerror', () => {
        tileErrors += 1;
        if (tileErrors >= 4) setBasemapDown(true);
      });
      tiles.on('tileload', () => {
        tileErrors = 0;
        setBasemapDown(false);
      });
      tiles.addTo(map);

      // MapTiler logo — required on the free tier.
      const LogoControl = L.Control.extend({
        onAdd() {
          const node = L.DomUtil.create('div', 'nm-maptiler-logo');
          node.innerHTML =
            '<a href="https://www.maptiler.com" target="_blank" rel="noreferrer"><img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo" width="80" height="24"></a>';
          return node;
        },
      });
      new LogoControl({ position: 'bottomleft' }).addTo(map);
    }

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
      didInitialFitRef.current = false;
    };
  }, []);

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

    const countyStyle = (feature?: GeoJSON.Feature): L.PathOptions => {
      const region = getRegion((feature?.properties as { region: number }).region);
      const fillColor =
        fillMode === 'territories' ? region.color : choroplethColor(metricForRegion(stats, fillMode, region.id), max);
      return {
        color: showCounties ? 'rgba(255,255,255,.82)' : fillColor,
        weight: showCounties ? 0.75 : 0,
        opacity: 1,
        fillColor,
        fillOpacity: fillMode === 'territories' ? 0.52 : 0.68,
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
        style: { color: '#ffffff', weight: 2.6, opacity: 0.96, fill: false, interactive: false },
      }).addTo(map);
    }
    countyLayer.bringToBack();

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
  }, [props.counties, props.borders, props.locations, props.settings]);

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
        icon: markerIcon(location, maxInvestment, props.settings.scaleMarkers),
        keyboard: true,
        title: location.name,
        alt: location.name,
      });
      marker.bindPopup(popupHtml(location));
      marker.on('click', () => propsRef.current.onSelectLocation(location.id));
      marker.addTo(markerLayer);
      markerIndexRef.current.set(location.id, marker);
    });
  }, [props.locations, props.settings]);

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
      icon: markerIcon(previewLocation, investment || 0, false),
      zIndexOffset: 1000,
      interactive: false,
    }).addTo(map);
  }, [props.preview]);

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
  }));

  return (
    <div className="nm-map-stage">
      <div ref={containerRef} className="nm-map" role="application" aria-label="NorCal SBDC network map" />
      {basemapDown && (
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
