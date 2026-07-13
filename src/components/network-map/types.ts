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

export interface Workspace {
  version: 3;
  force: boolean;
  locations: NetworkLocation[];
  settings: BuilderSettings;
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
}

export interface CountyProperties {
  name: string;
  region: number;
  fips: string;
}

export type CountyCollection = FeatureCollection<Polygon | MultiPolygon, CountyProperties>;
export type BorderCollection = FeatureCollection<MultiLineString>;
