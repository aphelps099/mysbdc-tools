'use client';

import { useState } from 'react';
import { REGIONS } from './regions';
import { detectRegion, finiteNumber } from './logic';
import type { CountyCollection, GeocodeCandidate, LocationType } from './types';

/* ═══════════════════════════════════════════════════════
   LocationEditor — add/edit form for hosts and branches.
   Geocoding is on-demand only (never as-you-type) through
   /api/geocode; region auto-detection is an advisory
   pre-fill the user can always override.
   ═══════════════════════════════════════════════════════ */

export interface LocationDraft {
  id: string; // '' = new location
  type: LocationType;
  name: string;
  regionId: string;
  address: string;
  investment: string;
  lat: string;
  lon: string;
  notes: string;
  regionHint: string | null;
}

export function emptyDraft(): LocationDraft {
  return {
    id: '',
    type: 'host',
    name: '',
    regionId: '1',
    address: '',
    investment: '',
    lat: '',
    lon: '',
    notes: '',
    regionHint: null,
  };
}

interface Status {
  message: string;
  tone: '' | 'success' | 'error';
}

interface LocationEditorProps {
  draft: LocationDraft;
  counties: CountyCollection | null;
  pickMode: boolean;
  onChange(draft: LocationDraft): void;
  onSave(): void;
  onCancel(): void;
  onDelete(): void;
  onTogglePick(): void;
  onFlyTo(lat: number, lon: number, zoom: number): void;
}

export default function LocationEditor({
  draft,
  counties,
  pickMode,
  onChange,
  onSave,
  onCancel,
  onDelete,
  onTogglePick,
  onFlyTo,
}: LocationEditorProps) {
  const [status, setStatus] = useState<Status | null>(null);
  const [results, setResults] = useState<GeocodeCandidate[]>([]);
  const [busy, setBusy] = useState(false);

  const editing = draft.id !== '';
  const lat = finiteNumber(draft.lat);
  const lon = finiteNumber(draft.lon);
  const placed = lat != null && lon != null;

  const set = (patch: Partial<LocationDraft>) => onChange({ ...draft, ...patch });

  async function findAddress() {
    if (busy) return;
    const address = draft.address.trim();
    if (!address) {
      setStatus({ message: 'Enter a complete street address first.', tone: 'error' });
      return;
    }
    setBusy(true);
    setResults([]);
    setStatus({ message: 'Searching Northern California addresses…', tone: '' });
    try {
      const response = await fetch('/api/geocode?q=' + encodeURIComponent(address));
      if (!response.ok) throw new Error('lookup failed');
      const data = await response.json();
      const candidates: GeocodeCandidate[] = data.results || [];
      if (!candidates.length) {
        setStatus({
          message: 'No Northern California matches found. Add the city and ZIP, or place the pin with a map click.',
          tone: 'error',
        });
        return;
      }
      setResults(candidates);
      setStatus({ message: 'Choose the correct match:', tone: 'success' });
    } catch {
      setStatus({
        message:
          'Live address lookup is unavailable. You can still place the pin with a map click or enter coordinates manually.',
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  }

  function selectResult(candidate: GeocodeCandidate) {
    const detected = detectRegion(counties, candidate.lat, candidate.lon);
    set({
      lat: candidate.lat.toFixed(6),
      lon: candidate.lon.toFixed(6),
      address: draft.address.trim() ? draft.address : candidate.label,
      regionId: detected ? String(detected) : draft.regionId,
      regionHint: detected
        ? 'Region suggested from the map position — verify near county lines.'
        : 'That point is outside the 36-county service area — choose the region manually.',
    });
    setResults([]);
    setStatus({ message: 'Address matched. Review the pin and save the location.', tone: 'success' });
    onFlyTo(candidate.lat, candidate.lon, 14);
  }

  return (
    <form
      className="nm-editor"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <div className="nm-editor-head">
        <h2>{editing ? 'Edit location' : 'Add a location'}</h2>
        {editing && (
          <button type="button" className="nm-btn nm-btn-danger nm-btn-small" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>

      <fieldset className="nm-type-toggle">
        <legend className="nm-label">Location type</legend>
        <label className={draft.type === 'host' ? 'active' : ''}>
          <input
            type="radio"
            name="location-type"
            value="host"
            checked={draft.type === 'host'}
            onChange={() => set({ type: 'host' })}
          />
          Territory host
        </label>
        <label className={draft.type === 'branch' ? 'active' : ''}>
          <input
            type="radio"
            name="location-type"
            value="branch"
            checked={draft.type === 'branch'}
            onChange={() => set({ type: 'branch' })}
          />
          Neighborhood branch
        </label>
      </fieldset>

      <label className="nm-field">
        <span className="nm-label">Organization or location name</span>
        <input
          type="text"
          value={draft.name}
          onChange={(event) => set({ name: event.target.value })}
          placeholder="e.g. Butte College SBDC"
          required
        />
      </label>

      <label className="nm-field">
        <span className="nm-label">Service region</span>
        <select value={draft.regionId} onChange={(event) => set({ regionId: event.target.value, regionHint: null })}>
          {REGIONS.map((region) => (
            <option key={region.id} value={String(region.id)}>
              {region.id} · {region.name}
            </option>
          ))}
        </select>
        {draft.regionHint && <span className="nm-hint">{draft.regionHint}</span>}
      </label>

      <label className="nm-field">
        <span className="nm-label">Street address</span>
        <input
          type="text"
          value={draft.address}
          onChange={(event) => set({ address: event.target.value })}
          placeholder="Street, city, ZIP"
        />
      </label>

      <div className="nm-geocode-row">
        <button type="button" className="nm-btn" onClick={findAddress} disabled={busy}>
          {busy ? 'Searching…' : 'Find address'}
        </button>
        <button type="button" className={'nm-btn' + (pickMode ? ' nm-btn-primary' : '')} onClick={onTogglePick}>
          {pickMode ? 'Click the map now…' : 'Place with map click'}
        </button>
      </div>
      {status && (
        <p className={'nm-status' + (status.tone ? ' ' + status.tone : '')} role="status">
          {status.message}
        </p>
      )}
      {results.length > 0 && (
        <div className="nm-geocode-results">
          {results.map((candidate, index) => (
            <button
              key={index}
              type="button"
              className="nm-geocode-result"
              onClick={() => selectResult(candidate)}
            >
              {candidate.label}
            </button>
          ))}
        </div>
      )}

      <div className="nm-coord-grid">
        <label className="nm-field">
          <span className="nm-label">Latitude</span>
          <input
            type="text"
            inputMode="decimal"
            value={draft.lat}
            onChange={(event) => set({ lat: event.target.value })}
            placeholder="38.5810"
          />
        </label>
        <label className="nm-field">
          <span className="nm-label">Longitude</span>
          <input
            type="text"
            inputMode="decimal"
            value={draft.lon}
            onChange={(event) => set({ lon: event.target.value })}
            placeholder="-121.4939"
          />
        </label>
      </div>
      <p className={'nm-coord-status' + (placed ? ' good' : '')}>
        {placed ? `Map position ready · ${lat!.toFixed(5)}, ${lon!.toFixed(5)}` : 'No map position selected yet.'}
      </p>

      <label className="nm-field">
        <span className="nm-label">Annual investment (USD)</span>
        <input
          type="text"
          inputMode="numeric"
          value={draft.investment}
          onChange={(event) => set({ investment: event.target.value })}
          placeholder="250000"
        />
      </label>

      <label className="nm-field">
        <span className="nm-label">Notes</span>
        <textarea
          value={draft.notes}
          onChange={(event) => set({ notes: event.target.value })}
          rows={3}
          placeholder="Program focus, partners, service notes…"
        />
      </label>

      <div className="nm-editor-actions">
        <button type="submit" className="nm-btn nm-btn-primary">
          {editing ? 'Save changes' : 'Add location'}
        </button>
        <button type="button" className="nm-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
