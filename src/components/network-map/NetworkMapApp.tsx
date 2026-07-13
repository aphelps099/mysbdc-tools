'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import './network-map.css';
import MapCanvas, { type MapHandle } from './MapCanvas';
import LocationEditor, { emptyDraft, type LocationDraft } from './LocationEditor';
import { getRegion, REGIONS } from './regions';
import {
  DEFAULT_SETTINGS,
  detectRegion,
  filteredLocations,
  finiteNumber,
  formatMoney,
  hasCoordinates,
  makeId,
  metricForRegion,
  normalizeState,
  regionStats,
} from './logic';
import {
  loadMeta,
  loadStoredWorkspace,
  saveMeta,
  saveWorkspace,
  shouldNudgeBackup,
  WORKSPACE_STORAGE_KEY,
  type BackupMeta,
} from './storage';
import type {
  BorderCollection,
  BuilderSettings,
  CountyCollection,
  FillMode,
  NetworkLocation,
  Workspace,
} from './types';

/* ═══════════════════════════════════════════════════════
   Network Map — map the NorCal SBDC network: territory
   hosts, neighborhood branches, and investment by region.
   Ported from the standalone prototype; see
   docs/region-builder-plan.md and docs/network-map.md.
   ═══════════════════════════════════════════════════════ */

type Panel = 'network' | 'editor' | 'data';

const CANONICAL_URL = '/data/network-map/network.v1.json';
const COUNTIES_URL = '/data/network-map/counties.v1.geojson';
const BORDERS_URL = '/data/network-map/region-borders.v1.geojson';

const FILL_MODES: Array<{ mode: FillMode; label: string }> = [
  { mode: 'territories', label: 'Regions' },
  { mode: 'total', label: 'Total $' },
  { mode: 'host', label: 'Host $' },
  { mode: 'branch', label: 'Branch $' },
];

const LEGEND_COPY: Record<FillMode, [string, string]> = {
  territories: ['Service regions', 'County color identifies one of eight SBDC service regions.'],
  total: ['Total investment', 'Combined host and branch investment by service region.'],
  host: ['Host investment', 'Host investment by service region.'],
  branch: ['Branch investment', 'Neighborhood branch investment by service region.'],
};

function downloadText(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function NetworkMapApp() {
  const [workspace, setWorkspace] = useState<Workspace | null>(() => loadStoredWorkspace(window.localStorage));
  const [meta, setMeta] = useState<BackupMeta>(() => loadMeta(window.localStorage));
  const [canonical, setCanonical] = useState<Workspace | null>(null);
  const [counties, setCounties] = useState<CountyCollection | null>(null);
  const [borders, setBorders] = useState<BorderCollection | null>(null);
  const [panel, setPanel] = useState<Panel>('network');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LocationDraft>(emptyDraft);
  const [pickMode, setPickMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [externalChange, setExternalChange] = useState(false);
  const mapRef = useRef<MapHandle>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hadStoredRef = useRef(workspace !== null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2600);
  }, []);

  /* ── Data + canonical workspace loading ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [countiesRes, bordersRes, canonicalRes] = await Promise.all([
          fetch(COUNTIES_URL),
          fetch(BORDERS_URL),
          fetch(CANONICAL_URL),
        ]);
        if (cancelled) return;
        if (countiesRes.ok) setCounties(await countiesRes.json());
        if (bordersRes.ok) setBorders(await bordersRes.json());
        if (canonicalRes.ok) setCanonical(normalizeState(await canonicalRes.json()));
      } catch {
        /* county layer failure surfaces via the map's empty state */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // First visit (no local workspace): adopt the published canonical network.
  useEffect(() => {
    if (!hadStoredRef.current && workspace === null && canonical) {
      setWorkspace(structuredClone(canonical));
    }
  }, [canonical, workspace]);

  /* ── Persistence ── */
  useEffect(() => {
    if (workspace) saveWorkspace(window.localStorage, workspace);
  }, [workspace]);

  useEffect(() => {
    saveMeta(window.localStorage, meta);
  }, [meta]);

  // Cross-tab guard: another tab wrote this workspace.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === WORKSPACE_STORAGE_KEY && event.newValue !== null) setExternalChange(true);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const settings = workspace?.settings ?? DEFAULT_SETTINGS;
  const locations = useMemo(() => workspace?.locations ?? [], [workspace]);

  const updateSettings = useCallback((patch: Partial<BuilderSettings>) => {
    setWorkspace((prev) =>
      prev
        ? { ...prev, settings: { ...prev.settings, ...patch }, updatedAt: new Date().toISOString() }
        : prev,
    );
  }, []);

  const mutateLocations = useCallback((updater: (previous: NetworkLocation[]) => NetworkLocation[]) => {
    setWorkspace((prev) =>
      prev ? { ...prev, locations: updater(prev.locations), updatedAt: new Date().toISOString() } : prev,
    );
    setMeta((prev) => ({ ...prev, editsSinceExport: prev.editsSinceExport + 1 }));
  }, []);

  /* ── Derived view state ── */
  const stats = useMemo(() => regionStats(locations), [locations]);
  const visible = useMemo(
    () =>
      [...filteredLocations(locations, settings)].sort(
        (a, b) => a.regionId - b.regionId || a.type.localeCompare(b.type) || a.name.localeCompare(b.name),
      ),
    [locations, settings],
  );
  const totalInvestment = useMemo(
    () => locations.reduce((sum, location) => sum + (location.investment || 0), 0),
    [locations],
  );
  const hostCount = locations.filter((location) => location.type === 'host').length;
  const branchCount = locations.length - hostCount;
  const regionsCovered = new Set(locations.map((location) => location.regionId)).size;
  const health = useMemo(() => {
    const unplaced = locations.filter((location) => !hasCoordinates(location)).length;
    const noAddress = locations.filter((location) => !location.address.trim()).length;
    const noInvestment = locations.filter((location) => !location.investment).length;
    return { unplaced, noAddress, noInvestment, clean: !unplaced && !noAddress && !noInvestment };
  }, [locations]);
  const legendMax = useMemo(
    () => Math.max(...REGIONS.map((region) => metricForRegion(stats, settings.fillMode, region.id)), 0),
    [stats, settings.fillMode],
  );
  const preview = useMemo(() => {
    const lat = finiteNumber(draft.lat);
    const lon = finiteNumber(draft.lon);
    if (panel !== 'editor' || lat == null || lon == null) return null;
    return { type: draft.type, lat, lon, investment: Math.max(0, finiteNumber(draft.investment) || 0) };
  }, [draft, panel]);
  const nudgeBackup = workspace !== null && shouldNudgeBackup(meta, locations.length);

  /* ── Panel / editor flows ── */
  const openPanel = useCallback((next: Panel) => {
    setPanel(next);
    mapRef.current?.invalidateSize();
  }, []);

  const startAdd = useCallback(() => {
    setDraft(emptyDraft());
    setPickMode(false);
    openPanel('editor');
  }, [openPanel]);

  const openEditor = useCallback(
    (id: string) => {
      const location = locations.find((item) => item.id === id);
      if (!location) return;
      setSelectedId(id);
      setDraft({
        id: location.id,
        type: location.type,
        name: location.name,
        regionId: String(location.regionId),
        address: location.address,
        investment: location.investment ? String(location.investment) : '',
        lat: hasCoordinates(location) ? String(location.lat) : '',
        lon: hasCoordinates(location) ? String(location.lon) : '',
        notes: location.notes,
        regionHint: null,
      });
      setPickMode(false);
      openPanel('editor');
    },
    [locations, openPanel],
  );

  const saveDraft = useCallback(() => {
    const name = draft.name.trim();
    if (!name) {
      showToast('Add an organization or location name');
      return;
    }
    const location: NetworkLocation = {
      id: draft.id || makeId(),
      type: draft.type,
      name,
      regionId: Number(draft.regionId) || 1,
      address: draft.address.trim(),
      investment: Math.max(0, finiteNumber(draft.investment) || 0),
      lat: finiteNumber(draft.lat),
      lon: finiteNumber(draft.lon),
      notes: draft.notes.trim(),
    };
    const editing = draft.id !== '';
    mutateLocations((previous) => {
      const index = previous.findIndex((item) => item.id === location.id);
      if (index >= 0) {
        const next = [...previous];
        next[index] = location;
        return next;
      }
      return [...previous, location];
    });
    setSelectedId(location.id);
    setPickMode(false);
    setDraft(emptyDraft());
    openPanel('network');
    if (hasCoordinates(location)) {
      mapRef.current?.flyToLocation(location.lat!, location.lon!, 10, location.id);
    }
    showToast((editing ? 'Updated ' : 'Added ') + location.name);
  }, [draft, mutateLocations, openPanel, showToast]);

  const deleteDraft = useCallback(() => {
    const location = locations.find((item) => item.id === draft.id);
    if (!location) return;
    if (!window.confirm(`Delete "${location.name}"?`)) return;
    mutateLocations((previous) => previous.filter((item) => item.id !== location.id));
    setSelectedId(null);
    setDraft(emptyDraft());
    setPickMode(false);
    openPanel('network');
    showToast('Location deleted');
  }, [draft.id, locations, mutateLocations, openPanel, showToast]);

  const focusLocation = useCallback(
    (id: string) => {
      const location = locations.find((item) => item.id === id);
      if (!location) return;
      setSelectedId(id);
      if (hasCoordinates(location)) {
        mapRef.current?.flyToLocation(location.lat!, location.lon!, 11, id);
      } else {
        openEditor(id);
        showToast('Add coordinates or use address lookup to place this location');
      }
    },
    [locations, openEditor, showToast],
  );

  const handleMapPick = useCallback(
    (lat: number, lon: number) => {
      const detected = detectRegion(counties, lat, lon);
      setDraft((previous) => ({
        ...previous,
        lat: lat.toFixed(6),
        lon: lon.toFixed(6),
        regionId: detected ? String(detected) : previous.regionId,
        regionHint: detected
          ? 'Region suggested from the map position — verify near county lines.'
          : 'That point is outside the 36-county service area — choose the region manually.',
      }));
      setPickMode(false);
      showToast('Pin placed. Add or confirm the street address, then save.');
    },
    [counties, showToast],
  );

  const handleCountyClick = useCallback(
    (regionId: number) => {
      updateSettings({ regionFilter: String(regionId) });
      openPanel('network');
      showToast('Filtered to ' + getRegion(regionId).name);
    },
    [updateSettings, openPanel, showToast],
  );

  /* ── Import / export / workspace actions ── */
  const exportJson = useCallback(() => {
    if (!workspace) return;
    downloadText('norcal-sbdc-network-backup.json', JSON.stringify(workspace, null, 2), 'application/json');
    setMeta((prev) => ({ ...prev, lastExportAt: new Date().toISOString(), editsSinceExport: 0 }));
    showToast('JSON backup downloaded');
  }, [workspace, showToast]);

  const importFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        let importedState: Workspace | null = null;
        let importedLocations: NetworkLocation[] | null = null;
        if (Array.isArray(data)) {
          importedLocations = normalizeState({ locations: data }).locations;
        } else if (data && Array.isArray(data.locations)) {
          importedState = normalizeState(data);
        } else {
          throw new Error('JSON does not contain a locations array');
        }
        const replace = window.confirm(
          'Replace existing locations?\n\nChoose OK to replace, or Cancel to append the imported records.',
        );
        setWorkspace((prev) => {
          const base = prev ?? normalizeState({});
          if (importedState && replace) return importedState;
          const items = importedState ? importedState.locations : importedLocations!;
          return {
            ...base,
            locations: replace ? items : [...base.locations, ...items],
            updatedAt: new Date().toISOString(),
          };
        });
        setMeta((prev) => ({ ...prev, editsSinceExport: prev.editsSinceExport + 1 }));
        openPanel('network');
        showToast('Import complete');
      } catch (error) {
        showToast('Import failed: ' + (error instanceof Error ? error.message : 'unreadable file'));
      }
    },
    [openPanel, showToast],
  );

  const resetToPublished = useCallback(() => {
    if (!canonical) return;
    if (!window.confirm('Replace your local workspace with the published network? Local edits will be lost.')) return;
    setWorkspace(structuredClone(canonical));
    setSelectedId(null);
    showToast('Loaded the published network');
  }, [canonical, showToast]);

  const clearWorkspace = useCallback(() => {
    if (!locations.length) return;
    if (!window.confirm('Clear all host and branch location data? Export a JSON backup first if you may need it later.'))
      return;
    mutateLocations(() => []);
    setSelectedId(null);
    showToast('Location data cleared');
  }, [locations.length, mutateLocations, showToast]);

  const clearFilters = useCallback(() => {
    updateSettings({ search: '', regionFilter: 'all', showHosts: true, showBranches: true });
  }, [updateSettings]);

  /* ── Render ── */
  return (
    <div className="nm-app" data-theme="brand">
      <header className="nm-topbar">
        <div className="nm-brand">
          <Link href="/" className="nm-home" aria-label="Back to the toolbox">
            ←
          </Link>
          <div>
            <h1>Network Map</h1>
            <p>NorCal SBDC hosts, branches &amp; investment</p>
          </div>
        </div>
        <div className="nm-stats" aria-label="Network totals">
          <div className="nm-stat">
            <strong>{formatMoney(totalInvestment, true)}</strong>
            <span>investment</span>
          </div>
          <div className="nm-stat">
            <strong>{hostCount}</strong>
            <span>hosts</span>
          </div>
          <div className="nm-stat">
            <strong>{branchCount}</strong>
            <span>branches</span>
          </div>
          <div className="nm-stat">
            <strong>
              {regionsCovered} / 8
            </strong>
            <span>regions</span>
          </div>
        </div>
        <div className="nm-topbar-actions">
          <button type="button" className="nm-btn nm-btn-primary" onClick={startAdd}>
            Add location
          </button>
        </div>
      </header>

      {externalChange && (
        <div className="nm-banner" role="alert">
          <span>This workspace was changed in another tab.</span>
          <button
            type="button"
            className="nm-btn nm-btn-small"
            onClick={() => {
              const latest = loadStoredWorkspace(window.localStorage);
              if (latest) setWorkspace(latest);
              setExternalChange(false);
            }}
          >
            Load latest
          </button>
          <button type="button" className="nm-btn nm-btn-small" onClick={() => setExternalChange(false)}>
            Keep mine
          </button>
        </div>
      )}
      {nudgeBackup && !externalChange && (
        <div className="nm-banner nm-banner-soft" role="status">
          <span>You have unsaved-to-file edits — browser storage is the only copy.</span>
          <button type="button" className="nm-btn nm-btn-small nm-btn-primary" onClick={exportJson}>
            Download JSON backup
          </button>
          <button
            type="button"
            className="nm-btn nm-btn-small"
            onClick={() =>
              setMeta((prev) => ({
                ...prev,
                nudgeSnoozedUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
              }))
            }
          >
            Remind me later
          </button>
        </div>
      )}

      <div className="nm-main">
        <aside className="nm-sidebar">
          <div className="nm-tabs" role="tablist" aria-label="Network map panels">
            {(
              [
                ['network', 'Network'],
                ['editor', draft.id ? 'Edit' : 'Add'],
                ['data', 'Data'],
              ] as Array<[Panel, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={panel === key}
                className={'nm-tab' + (panel === key ? ' active' : '')}
                onClick={() => openPanel(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {panel === 'network' && (
            <div className="nm-panel" role="tabpanel">
              <div className="nm-filters">
                <input
                  type="search"
                  className="nm-search"
                  placeholder="Search name, address, notes…"
                  aria-label="Search locations"
                  value={settings.search}
                  onChange={(event) => updateSettings({ search: event.target.value })}
                />
                <select
                  aria-label="Filter by region"
                  value={settings.regionFilter}
                  onChange={(event) => updateSettings({ regionFilter: event.target.value })}
                >
                  <option value="all">All eight regions</option>
                  {REGIONS.map((region) => (
                    <option key={region.id} value={String(region.id)}>
                      {region.name}
                    </option>
                  ))}
                </select>
                <div className="nm-check-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showHosts}
                      onChange={(event) => updateSettings({ showHosts: event.target.checked })}
                    />
                    Hosts
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showBranches}
                      onChange={(event) => updateSettings({ showBranches: event.target.checked })}
                    />
                    Branches
                  </label>
                  <button type="button" className="nm-btn nm-btn-small" onClick={clearFilters}>
                    Clear filters
                  </button>
                </div>
              </div>

              <p className="nm-result-count">
                {visible.length} location{visible.length === 1 ? '' : 's'}
              </p>
              <div className="nm-location-list">
                {visible.length === 0 && (
                  <p className="nm-empty">
                    {locations.length
                      ? 'No locations match the current filters.'
                      : 'No locations yet. Add the first territory host or neighborhood branch to begin.'}
                  </p>
                )}
                {visible.map((location) => {
                  const region = getRegion(location.regionId);
                  return (
                    <button
                      key={location.id}
                      type="button"
                      className={'nm-location-row' + (selectedId === location.id ? ' selected' : '')}
                      onClick={() => focusLocation(location.id)}
                    >
                      <span className={'nm-type-symbol ' + location.type}>
                        {location.type === 'host' ? 'H' : 'B'}
                      </span>
                      <span className="nm-location-copy">
                        <span className="nm-location-name">{location.name}</span>
                        <span className="nm-location-sub">
                          {region.name}
                          {location.address ? ' · ' + location.address : ''}
                        </span>
                        {!hasCoordinates(location) && <span className="nm-needs-pin">Needs map position</span>}
                      </span>
                      <span className="nm-location-invest">{formatMoney(location.investment, true)}</span>
                    </button>
                  );
                })}
              </div>

              <h3 className="nm-section-title">Regional rollup</h3>
              <div className="nm-region-list">
                {REGIONS.map((region) => {
                  const row = stats[region.id];
                  const maximum = Math.max(...REGIONS.map((r) => stats[r.id].total), 0);
                  const width = maximum > 0 ? Math.max(1.5, (100 * row.total) / maximum) : 1.5;
                  return (
                    <div key={region.id} className="nm-region-row">
                      <div className="nm-region-top">
                        <span>{region.name}</span>
                        <span>{formatMoney(row.total, true)}</span>
                      </div>
                      <div className="nm-region-detail">
                        {row.hosts} host{row.hosts === 1 ? '' : 's'} · {row.branches} branch
                        {row.branches === 1 ? '' : 'es'}
                      </div>
                      <div className="nm-region-track">
                        <div className="nm-region-bar" style={{ width: width + '%', background: region.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {panel === 'editor' && (
            <div className="nm-panel" role="tabpanel">
              <LocationEditor
                draft={draft}
                counties={counties}
                pickMode={pickMode}
                onChange={setDraft}
                onSave={saveDraft}
                onCancel={() => {
                  setDraft(emptyDraft());
                  setPickMode(false);
                  openPanel('network');
                }}
                onDelete={deleteDraft}
                onTogglePick={() => {
                  setPickMode((previous) => {
                    if (!previous) showToast('Click the map to place this location');
                    return !previous;
                  });
                }}
                onFlyTo={(lat, lon, zoom) => mapRef.current?.flyToLocation(lat, lon, zoom)}
              />
            </div>
          )}

          {panel === 'data' && (
            <div className="nm-panel" role="tabpanel">
              <h3 className="nm-section-title">County fill</h3>
              <div className="nm-segmented" role="group" aria-label="County fill mode">
                {FILL_MODES.map(({ mode, label }) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={settings.fillMode === mode}
                    className={settings.fillMode === mode ? 'active' : ''}
                    onClick={() => updateSettings({ fillMode: mode })}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="nm-help">Switch the county layer from territory identity to investment concentration.</p>

              <h3 className="nm-section-title">Map details</h3>
              <label className="nm-toggle-row">
                <span>Show region labels</span>
                <input
                  type="checkbox"
                  checked={settings.showRegionLabels}
                  onChange={(event) => updateSettings({ showRegionLabels: event.target.checked })}
                />
              </label>
              <label className="nm-toggle-row">
                <span>Show county boundaries</span>
                <input
                  type="checkbox"
                  checked={settings.showCounties}
                  onChange={(event) => updateSettings({ showCounties: event.target.checked })}
                />
              </label>
              <label className="nm-toggle-row">
                <span>Scale markers by investment</span>
                <input
                  type="checkbox"
                  checked={settings.scaleMarkers}
                  onChange={(event) => updateSettings({ scaleMarkers: event.target.checked })}
                />
              </label>

              <h3 className="nm-section-title">Workspace</h3>
              <div className="nm-export-grid">
                <button type="button" className="nm-btn" onClick={exportJson}>
                  Export JSON backup
                </button>
                <button type="button" className="nm-btn" onClick={() => importInputRef.current?.click()}>
                  Import JSON
                </button>
                <button type="button" className="nm-btn" onClick={resetToPublished} disabled={!canonical}>
                  Reset to published network
                </button>
                <button type="button" className="nm-btn nm-btn-danger" onClick={clearWorkspace}>
                  Clear workspace
                </button>
              </div>
              <input
                ref={importInputRef}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) await importFile(file);
                  event.target.value = '';
                }}
              />
              <p className="nm-help">
                Your workspace lives in this browser. Export a JSON backup to share it or move it to another
                machine — including backups made with the original prototype file, which import here unchanged.
              </p>

              <h3 className="nm-section-title">Data health</h3>
              <p className={'nm-status' + (health.clean && locations.length ? ' success' : '')}>
                {!locations.length
                  ? 'No locations have been added yet.'
                  : health.clean
                    ? 'All locations have addresses, coordinates, and investment values.'
                    : [
                        health.unplaced ? `${health.unplaced} need map coordinates` : '',
                        health.noAddress ? `${health.noAddress} missing an address` : '',
                        health.noInvestment ? `${health.noInvestment} missing investment` : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
              </p>
            </div>
          )}
        </aside>

        <section className="nm-map-wrap">
          <MapCanvas
            ref={mapRef}
            counties={counties}
            borders={borders}
            locations={locations}
            settings={settings}
            preview={preview}
            pickMode={pickMode}
            onCountyClick={handleCountyClick}
            onSelectLocation={setSelectedId}
            onEditLocation={openEditor}
            onMapPick={handleMapPick}
          />

          <div className="nm-map-toolbar">
            <button
              type="button"
              className={'nm-chip' + (settings.showHosts ? ' active' : '')}
              aria-pressed={settings.showHosts}
              onClick={() => updateSettings({ showHosts: !settings.showHosts })}
            >
              <span className="nm-chip-dot host" /> Hosts
            </button>
            <button
              type="button"
              className={'nm-chip' + (settings.showBranches ? ' active' : '')}
              aria-pressed={settings.showBranches}
              onClick={() => updateSettings({ showBranches: !settings.showBranches })}
            >
              <span className="nm-chip-dot branch" /> Branches
            </button>
            <button type="button" className="nm-chip" onClick={() => mapRef.current?.fitNetwork()}>
              Fit network
            </button>
          </div>

          <div className="nm-legend">
            <div className="nm-legend-title">{LEGEND_COPY[settings.fillMode][0]}</div>
            <div className="nm-legend-sub">{LEGEND_COPY[settings.fillMode][1]}</div>
            <div className="nm-legend-items">
              <span className="nm-legend-item">
                <span className="nm-legend-swatch host" /> Host
              </span>
              <span className="nm-legend-item">
                <span className="nm-legend-swatch branch" /> Neighborhood branch
              </span>
            </div>
            {settings.fillMode !== 'territories' && (
              <>
                <div className="nm-legend-gradient" />
                <div className="nm-legend-range">
                  <span>$0</span>
                  <span>{formatMoney(legendMax, true)}</span>
                </div>
              </>
            )}
          </div>

          {locations.length === 0 && workspace !== null && (
            <div className="nm-map-empty">
              <p>
                <strong>The map is empty.</strong> Add the first territory host, or import a JSON backup from the
                Data tab.
              </p>
              <button type="button" className="nm-btn nm-btn-primary" onClick={startAdd}>
                Add the first location
              </button>
            </div>
          )}
        </section>
      </div>

      <div className={'nm-toast' + (toast ? ' show' : '')} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
