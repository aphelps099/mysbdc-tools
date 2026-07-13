import type { Region } from './types';

/* Fixed eight-region model for v1 — validated against the county dataset
   (36 counties, each in exactly one region). The phase-2 territory editor
   is where this becomes user-editable. */

export const REGIONS: Region[] = [
  { id: 1, name: 'Redwood Coast', color: '#1A3FA3', counties: ['Del Norte', 'Humboldt', 'Lake', 'Mendocino', 'Trinity'] },
  { id: 2, name: 'North State', color: '#B23A48', counties: ['Butte', 'Colusa', 'Glenn', 'Lassen', 'Modoc', 'Plumas', 'Shasta', 'Siskiyou', 'Tehama'] },
  { id: 3, name: 'Sacramento', color: '#0B5E50', counties: ['El Dorado', 'Nevada', 'Placer', 'Sacramento', 'Sierra', 'Sutter', 'Yolo', 'Yuba'] },
  { id: 4, name: 'San Joaquin', color: '#B08A3E', counties: ['Alpine', 'Amador', 'Calaveras', 'San Joaquin'] },
  { id: 5, name: 'North Bay', color: '#6D6EB4', counties: ['Marin', 'Napa', 'Solano', 'Sonoma'] },
  { id: 6, name: 'East Bay', color: '#3B7F96', counties: ['Alameda', 'Contra Costa'] },
  { id: 7, name: 'San Francisco', color: '#D26A4A', counties: ['San Francisco'] },
  { id: 8, name: 'Silicon Valley', color: '#667F3D', counties: ['San Mateo', 'Santa Clara', 'Santa Cruz'] },
];

export function getRegion(id: number | string): Region {
  return REGIONS.find((region) => region.id === Number(id)) || REGIONS[0];
}
