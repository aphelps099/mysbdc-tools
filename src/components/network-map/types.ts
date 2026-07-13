import type { FeatureCollection, MultiLineString, MultiPolygon, Polygon } from 'geojson';

/* ═══════════════════════════════════════════════════════
   Network Map — shared types
   Wire-compatible with the prototype's v3 workspace schema
   (storage key norcal-sbdc-network-map-v3).
   ═══════════════════════════════════════════════════════ */

export type LocationType = 'host' | 'branch';

export interface NetworkLocation {
  id: string;
  type: LocationType;
  name: string;
  regionId: number;
  address: string;
  investment: number;
  lat: number | null;
  lon: number | null;
  notes: string;
}

export type FillMode = 'territories' | 'total' | 'host' | 'branch';

export interface BuilderSettings {
  theme: string;
  fillMode: FillMode;
  showHosts: boolean;
  showBranches: boolean;
  showRegionLabels: boolean;
  showCounties: boolean;
  scaleMarkers: boolean;
  regionFilter: string; // 'all' or region id as string
  search: string;
}

/* Shared visual design of the map — travels with the workspace so one
   person can style it and everyone (and every export) sees the same colors. */
export interface MapStyle {
  regionColors: Record<string, string>; // region id (as string) -> hex
  hostColor: string;
  hostBorder: string;
  branchColor: string;
  branchBorder: string;
  borderColor: string; // interior region-border mesh
  borderWidth: number;
  territoryOpacity: number; // 0..1 county fill opacity in territory mode
  choroplethFrom: string;
  choroplethTo: string;
  basemap: string; // MapTiler style id, or 'none' for a color-only map
  paper: string; // background behind/without the basemap
}

export interface Workspace {
  version: 3;
  force: boolean;
  locations: NetworkLocation[];
  settings: BuilderSettings;
  style: MapStyle;
  updatedAt: string;
}

export interface Region {
  id: number;
  name: string;
  color: string;
  counties: string[];
}

export interface RegionStats {
  hosts: number;
  branches: number;
  hostInvestment: number;
  branchInvestment: number;
  total: number;
}

export interface GeocodeCandidate {
  label: string;
  lat: number;
  lon: number;
  source: 'census' | 'maptiler';
  /* 'relaxed' = matched only after the query was simplified (suite/room code
     stripped) — treat as approximate and never auto-place without review. */
  precision?: 'exact' | 'relaxed';
}

export interface CountyProperties {
  name: string;
  region: number;
  fips: string;
}

export type CountyCollection = FeatureCollection<Polygon | MultiPolygon, CountyProperties>;
export type BorderCollection = FeatureCollection<MultiLineString>;
