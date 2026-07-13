'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import './network-map.css';
import MapCanvas, { type MapHandle } from './MapCanvas';
import LocationEditor, { emptyDraft, type LocationDraft } from './LocationEditor';
import DesignPanel from './DesignPanel';
import { downloadCanvasPng } from './export-image';
import { DEFAULT_STYLE } from './style';
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
  loadSyncMarker,
  saveMeta,
  saveSyncMarker,
  saveWorkspace,
  SYNC_PULSE_KEY,
  WORKSPACE_STORAGE_KEY,
  type BackupMeta,
} from './storage';
import type {
  BorderCollection,
  BuilderSettings,
  CountyCollection,
  FillMode,
  GeocodeCandidate,
  MapStyle,
  NetworkLocation,
  Workspace,
} from './types';

/* JSON of the shared parts (locations + design) — what auto-saves and what
   drives dirty/conflict detection. View settings stay personal per browser. */
function sharedSnapshot(workspace: Workspace): string {
  return JSON.stringify({ locations: workspace.locations, style: workspace.style });
}

/* ═══════════════════════════════════════════════════════
   Network Map — one shared live map of the NorCal SBDC
   network. Edits save automatically to the server
   (/api/network-map/workspace); every save carries the
   last-seen server version so nobody can silently overwrite
   anyone else, and a persisted sync marker lets offline
   edits survive reloads. localStorage is only a cache.
   See docs/network-map.md.
   ═══════════════════════════════════════════════════════ */

type Panel = 'network' | 'editor' | 'design' | 'data';
type SyncStatus = 'loading' | 'saved' | 'saving' | 'offline' | 'conflict';

const WORKSPACE_API = '/api/network-map/workspace';
const CANONICAL_URL = '/data/network-map/network.v1.json';
const COUNTIES_URL = '/data/network-map/counties.v1.geojson';
const BORDERS_URL = '/data/network-map/region-borders.v1.geojson';
const SAVE_DEBOUNCE_MS = 1200;
const OFFLINE_RETRY_MS = 15000;

const FILL_MODES: Array<{ mode: FillMode; label: string }> = [
  { mode: 'territories', label: 'Regions' },
  { mode: 'total', label: 'Total $' },
  { mode: 'host', label: 'Host $' },
  { mode: 'branch', label: 'Branch $' },
];

const IMAGE_SIZES: Array<{ label: string; scale: number }> = [
  { label: 'Standard', scale: 2 },
  { label: 'Large', scale: 4 },
  { label: 'Poster', scale: 6 },
];

const LEGEND_COPY: Record<FillMode, [string, string]> = {
  territories: ['Service regions', 'County color identifies one of eight SBDC service regions.'],
  total: ['Total investment', 'Combined host and branch investment by service region.'],
  host: ['Host investment', 'Host investment by service region.'],
  branch: ['Branch investment', 'Neighborhood branch investment by service region.'],
};

const SYNC_LABELS: Record<SyncStatus, string> = {
  loading: 'Loading the shared map…',
  saved: '✓ Saved for everyone',
  saving: 'Saving…',
  offline: 'Offline — reconnecting…',
  conflict: 'Someone else saved changes — choose a version above',
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
  const [initialMarker] = useState(() => loadSyncMarker(window.localStorage));
  const [meta, setMeta] = useState<BackupMeta>(() => loadMeta(window.localStorage));
  const [counties, setCounties] = useState<CountyCollection | null>(null);
  const [borders, setBorders] = useState<BorderCollection | null>(null);
  const [panel, setPanel] = useState<Panel>('network');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LocationDraft>(emptyDraft);
  const [pickMode, setPickMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [conflict, setConflict] = useState<Workspace | null>(null);
  const [exportScale, setExportScale] = useState<number | null>(null);
  const [exportStreets, setExportStreets] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  const mapRef = useRef<MapHandle>(null);
  const mapWrapRef = useRef<HTMLElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workspaceRef = useRef<Workspace | null>(workspace);
  const serverUpdatedAtRef = useRef<string | null>(initialMarker?.serverUpdatedAt ?? null);
  const lastSyncedSharedRef = useRef<string | null>(initialMarker?.lastSyncedShared ?? null);
  const syncStatusRef = useRef<SyncStatus>('loading');
  const inFlightRef = useRef(false);
  const draftRef = useRef<LocationDraft>(draft);
  const pickModeRef = useRef(false);
  const saveTokenRef = useRef(0);
  workspaceRef.current = workspace;
  syncStatusRef.current = syncStatus;
  draftRef.current = draft;
  pickModeRef.current = pickMode;

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  /* Record that this browser is in sync with the server — kept in
     localStorage so a reload can tell clean cache from un-synced edits. */
  const markSynced = useCallback((serverUpdatedAt: string, snapshot: string) => {
    serverUpdatedAtRef.current = serverUpdatedAt;
    lastSyncedSharedRef.current = snapshot;
    saveSyncMarker(window.localStorage, { serverUpdatedAt, lastSyncedShared: snapshot });
  }, []);

  const isDirty = useCallback(() => {
    const current = workspaceRef.current;
    return current !== null && sharedSnapshot(current) !== lastSyncedSharedRef.current;
  }, []);

  /* Adopt a server workspace. Locations AND design are shared; view settings
     (filters, search, toggles) stay personal to this browser. */
  const adoptServerWorkspace = useCallback(
    (incoming: Workspace) => {
      markSynced(incoming.updatedAt, sharedSnapshot(incoming));
      setWorkspace((prev) => ({
        ...incoming,
        settings: prev?.settings ?? {
          ...incoming.settings,
          search: '',
          regionFilter: 'all',
          showHosts: true,
          showBranches: true,
        },
      }));
    },
    [markSynced],
  );

  /* ── Save to the server ── */
  const flushSave = useCallback(
    async (force = false) => {
      const current = workspaceRef.current;
      if (!current || inFlightRef.current) return;
      const snapshot = sharedSnapshot(current);
      if (!force && snapshot === lastSyncedSharedRef.current) return;

      inFlightRef.current = true;
      if (syncStatusRef.current !== 'offline') setSyncStatus('saving');
      try {
        if (!force && serverUpdatedAtRef.current === null) {
          // This browser has never synced. Establish a base first — blindly
          // writing here could overwrite everyone's map with stale data.
          const probe = await fetch(WORKSPACE_API);
          if (probe.ok) {
            const data = await probe.json();
            const incoming = normalizeState(data.workspace);
            if (sharedSnapshot(incoming) === snapshot) {
              markSynced(incoming.updatedAt, snapshot);
              setSyncStatus('saved');
            } else {
              setConflict(incoming);
              setSyncStatus('conflict');
            }
            return;
          }
          if (probe.status !== 404) throw new Error('probe failed');
          // 404: nothing exists server-side at all — safe to create below.
        }

        const response = await fetch(WORKSPACE_API, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspace: current,
            baseUpdatedAt: force ? undefined : (serverUpdatedAtRef.current ?? undefined),
            force: force || undefined,
          }),
        });
        if (response.status === 409) {
          const data = await response.json();
          setConflict(normalizeState(data.workspace));
          setSyncStatus('conflict');
          return;
        }
        if (!response.ok) throw new Error('save failed');
        const data = await response.json();
        markSynced(data.workspace?.updatedAt ?? new Date().toISOString(), snapshot);
        try {
          window.localStorage.setItem(SYNC_PULSE_KEY, String(Date.now()));
        } catch {
          /* pulse is best-effort */
        }
        setConflict(null);
        // If more edits landed mid-flight, the save effect reschedules.
        setSyncStatus('saved');
      } catch {
        setSyncStatus('offline');
      } finally {
        inFlightRef.current = false;
      }
    },
    [markSynced],
  );

  /* ── Refresh from the server (focus, cross-tab pulse, reconnect) ── */
  const refreshFromServer = useCallback(async () => {
    if (inFlightRef.current) return;
    const status = syncStatusRef.current;
    if (status === 'loading' || status === 'saving' || status === 'conflict') return;
    if (isDirty()) {
      // Un-synced local edits take priority: push them (the server's base
      // check turns any real clash into the conflict banner).
      flushSave();
      return;
    }
    if (draftRef.current.id !== '') return; // don't yank an open edit out from under the user
    try {
      const response = await fetch(WORKSPACE_API);
      if (!response.ok) return;
      const data = await response.json();
      // Re-check: an edit, save, or conflict may have started during the fetch.
      if (inFlightRef.current || isDirty() || draftRef.current.id !== '') return;
      if (syncStatusRef.current === 'saving' || syncStatusRef.current === 'conflict') return;
      const incoming = normalizeState(data.workspace);
      if (incoming.updatedAt !== serverUpdatedAtRef.current) {
        adoptServerWorkspace(incoming);
        showToast('Map updated with the latest shared changes');
      }
      if (syncStatusRef.current === 'offline') setSyncStatus('saved');
    } catch {
      /* still offline — keep the current copy */
    }
  }, [adoptServerWorkspace, flushSave, isDirty, showToast]);

  /* ── Initial load: geo data + the shared workspace ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [countiesRes, bordersRes] = await Promise.all([fetch(COUNTIES_URL), fetch(BORDERS_URL)]);
        if (cancelled) return;
        if (countiesRes.ok) setCounties(await countiesRes.json());
        if (bordersRes.ok) setBorders(await bordersRes.json());
      } catch {
        /* county layer failure surfaces via the map's empty state */
      }
    })();
    (async () => {
      try {
        const response = await fetch(WORKSPACE_API);
        if (!response.ok) throw new Error('workspace fetch failed');
        const data = await response.json();
        if (cancelled) return;
        const incoming = normalizeState(data.workspace);
        const local = workspaceRef.current;
        const dirty = local !== null && sharedSnapshot(local) !== lastSyncedSharedRef.current;
        if (!dirty) {
          adoptServerWorkspace(incoming);
          setSyncStatus('saved');
        } else if (incoming.updatedAt === serverUpdatedAtRef.current) {
          // Offline edits from a previous session, server unchanged since —
          // keep them; the save effect pushes them up.
          setSyncStatus('saving');
        } else {
          // Both sides moved: let the user arbitrate.
          setConflict(incoming);
          setSyncStatus('conflict');
        }
      } catch {
        if (cancelled) return;
        setSyncStatus('offline');
        if (!workspaceRef.current) {
          try {
            const seedRes = await fetch(CANONICAL_URL);
            if (seedRes.ok && !cancelled && !workspaceRef.current) {
              setWorkspace(normalizeState(await seedRes.json()));
            }
          } catch {
            if (!workspaceRef.current) setWorkspace(normalizeState({}));
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [adoptServerWorkspace]);

  /* ── Cache locally + schedule server saves ── */
  useEffect(() => {
    if (!workspace) return;
    saveWorkspace(window.localStorage, workspace);
    if (syncStatus === 'loading' || syncStatus === 'conflict') return;
    const dirty = sharedSnapshot(workspace) !== lastSyncedSharedRef.current;
    if (!dirty) {
      // Edits reverted to the synced snapshot inside the debounce window.
      if (syncStatus === 'saving' && !inFlightRef.current) setSyncStatus('saved');
      return;
    }
    if (syncStatus === 'saved') setSyncStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => flushSave(), syncStatus === 'offline' ? OFFLINE_RETRY_MS : SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [workspace, syncStatus, flushSave]);

  useEffect(() => {
    saveMeta(window.localStorage, meta);
  }, [meta]);

  useEffect(() => {
    const onFocus = () => refreshFromServer();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshFromServer();
    };
    const onStorage = (event: StorageEvent) => {
      if ((event.key === SYNC_PULSE_KEY || event.key === WORKSPACE_STORAGE_KEY) && event.newValue !== null) {
        refreshFromServer();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !pickModeRef.current) return;
      setPickMode(false);
      showToast('Done placing pins');
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('storage', onStorage);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [refreshFromServer, showToast]);

  const settings = workspace?.settings ?? DEFAULT_SETTINGS;
  const style = workspace?.style ?? DEFAULT_STYLE;
  const locations = useMemo(() => workspace?.locations ?? [], [workspace]);

  const updateSettings = useCallback((patch: Partial<BuilderSettings>) => {
    setWorkspace((prev) => (prev ? { ...prev, settings: { ...prev.settings, ...patch } } : prev));
  }, []);

  // Design is shared, so a style change bumps updatedAt and auto-saves.
  const mutateStyle = useCallback((patch: Partial<MapStyle>) => {
    setWorkspace((prev) =>
      prev ? { ...prev, style: { ...prev.style, ...patch }, updatedAt: new Date().toISOString() } : prev,
    );
  }, []);

  const resetStyle = useCallback(() => {
    setWorkspace((prev) => (prev ? { ...prev, style: { ...DEFAULT_STYLE }, updatedAt: new Date().toISOString() } : prev));
    showToast('Design reset to defaults');
  }, [showToast]);

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
  const hasUnsyncedEdits = useMemo(
    () => workspace !== null && sharedSnapshot(workspace) !== lastSyncedSharedRef.current,
    // syncStatus is a dependency because the refs update on sync transitions
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workspace, syncStatus],
  );

  /* ── Panel / editor flows ── */
  const openPanel = useCallback((next: Panel) => {
    setPanel(next);
    if (next !== 'editor') setPickMode(false);
    mapRef.current?.invalidateSize();
  }, []);

  const startAdd = useCallback(() => {
    saveTokenRef.current += 1;
    setDraft(emptyDraft());
    setPickMode(false);
    openPanel('editor');
  }, [openPanel]);

  const openEditor = useCallback(
    (id: string) => {
      const location = locations.find((item) => item.id === id);
      if (!location) return;
      saveTokenRef.current += 1;
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
        regionChosen: true,
      });
      setPickMode(false);
      openPanel('editor');
    },
    [locations, openPanel],
  );

  const saveDraft = useCallback(async () => {
    const name = draft.name.trim();
    if (!name) {
      showToast('Add an organization or location name');
      return;
    }
    if (saveBusy) return;

    let lat = finiteNumber(draft.lat);
    let lon = finiteNumber(draft.lon);
    let regionId = Number(draft.regionId) || 1;
    let autoPlaced = false;

    // Bulletproofing: an address without a pin gets located automatically
    // when the lookup finds exactly one confident match.
    if ((lat == null || lon == null) && draft.address.trim()) {
      const token = ++saveTokenRef.current;
      setSaveBusy(true);
      showToast('Finding the address…');
      try {
        const response = await fetch('/api/geocode?q=' + encodeURIComponent(draft.address.trim()), {
          signal: AbortSignal.timeout(20000),
        });
        if (response.ok) {
          const data = await response.json();
          const candidates: GeocodeCandidate[] = data.results || [];
          if (candidates.length === 1 && candidates[0].precision !== 'relaxed') {
            lat = candidates[0].lat;
            lon = candidates[0].lon;
            if (!draft.regionChosen) {
              const detected = detectRegion(counties, lat, lon);
              if (detected) regionId = detected;
            }
            autoPlaced = true;
          }
        }
      } catch {
        /* lookup unavailable — save unplaced below */
      }
      setSaveBusy(false);
      // The user cancelled or switched locations while we were looking up.
      if (saveTokenRef.current !== token) return;
    }

    const location: NetworkLocation = {
      id: draft.id || makeId(),
      type: draft.type,
      name,
      regionId,
      address: draft.address.trim(),
      investment: Math.max(0, finiteNumber(draft.investment) || 0),
      lat,
      lon,
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
      showToast(
        autoPlaced
          ? `Added ${location.name} — pin placed from the address. Double-check it on the map.`
          : (editing ? 'Updated ' : 'Added ') + location.name,
      );
    } else {
      showToast(`Saved ${location.name} — use Find address or a map click to place its pin.`);
    }
  }, [counties, draft, mutateLocations, openPanel, saveBusy, showToast]);

  const deleteDraft = useCallback(() => {
    const location = locations.find((item) => item.id === draft.id);
    if (!location) return;
    if (!window.confirm(`Delete "${location.name}" from the shared map?`)) return;
    saveTokenRef.current += 1;
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
        showToast('Use Find address or a map click to place this location');
      }
    },
    [locations, openEditor, showToast],
  );

  const handleMapPick = useCallback(
    (lat: number, lon: number) => {
      const detected = detectRegion(counties, lat, lon);
      setDraft((previous) => {
        const next = { ...previous, lat: lat.toFixed(6), lon: lon.toFixed(6) };
        if (!detected) {
          next.regionHint = 'That point is outside the 36-county service area — choose the region manually.';
        } else if (!previous.regionChosen) {
          next.regionId = String(detected);
          next.regionHint = 'Region suggested from the map position — verify near county lines.';
        } else if (String(detected) !== previous.regionId) {
          next.regionHint = `The map position looks like ${getRegion(detected).name} — double-check the service region.`;
        } else {
          next.regionHint = null;
        }
        return next;
      });
      // Pick mode stays on: keep clicking until the pin is right.
      showToast('Pin placed — click again to adjust, or press Done placing');
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

  /* ── Exports / import / workspace actions ── */
  const exportJson = useCallback(() => {
    if (!workspace) return;
    downloadText('norcal-sbdc-network-backup.json', JSON.stringify(workspace, null, 2), 'application/json');
    setMeta((prev) => ({ ...prev, lastExportAt: new Date().toISOString(), editsSinceExport: 0 }));
    showToast('Backup file downloaded');
  }, [workspace, showToast]);

  const exportImage = useCallback(
    async (scale: number) => {
      if (exportScale !== null) return;
      setExportScale(scale);
      showToast('Rendering the map image…');
      try {
        // Native render from data + style — color coding is always captured.
        let canvas = mapRef.current?.renderToCanvas(scale, exportStreets) ?? null;
        if (!canvas) throw new Error('render failed');
        try {
          await downloadCanvasPng(canvas, scale);
        } catch {
          // A cross-origin basemap tile tainted the canvas: re-render the
          // clean color version (no streets) so the download still works.
          canvas = mapRef.current?.renderToCanvas(scale, false) ?? null;
          if (!canvas) throw new Error('render failed');
          await downloadCanvasPng(canvas, scale);
          showToast('Map image downloaded (color version — street basemap could not be included)');
          return;
        }
        showToast('Map image downloaded');
      } catch {
        showToast('Could not render the map image — try Print / save as PDF.');
      } finally {
        setExportScale(null);
      }
    },
    [exportScale, exportStreets, showToast],
  );

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
          throw new Error('not a backup');
        }
        const replace = window.confirm(
          'Replace the locations everyone sees with this file?\n\nChoose OK to replace, or Cancel to add the imported records alongside the current ones.',
        );
        setWorkspace((prev) => {
          const base = prev ?? normalizeState({});
          const items = importedState ? importedState.locations : importedLocations!;
          return {
            ...base,
            locations: replace ? items : [...base.locations, ...items],
            updatedAt: new Date().toISOString(),
          };
        });
        setMeta((prev) => ({ ...prev, editsSinceExport: prev.editsSinceExport + 1 }));
        openPanel('network');
        showToast('Import complete — saving for everyone');
      } catch {
        showToast("Import failed — that file doesn't look like a map backup.");
      }
    },
    [openPanel, showToast],
  );

  const clearWorkspace = useCallback(() => {
    if (!locations.length) return;
    if (
      !window.confirm(
        'Remove ALL locations from the shared map? Everyone will see an empty map. (The server keeps recent backups.)',
      )
    )
      return;
    mutateLocations(() => []);
    setSelectedId(null);
    showToast('All locations removed');
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
            <p className={'nm-sync ' + (syncStatus === 'saved' ? 'saved' : syncStatus === 'offline' ? 'offline' : '')}>
              {SYNC_LABELS[syncStatus]}
            </p>
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

      {conflict && (
        <div className="nm-banner" role="alert">
          <span>Someone else saved changes to the shared map while you were editing.</span>
          <button
            type="button"
            className="nm-btn nm-btn-small nm-btn-primary"
            onClick={() => {
              adoptServerWorkspace(conflict);
              setConflict(null);
              setSyncStatus('saved');
              showToast('Loaded the latest shared map');
            }}
          >
            Use their version
          </button>
          <button
            type="button"
            className="nm-btn nm-btn-small"
            onClick={() => {
              setConflict(null);
              flushSave(true);
            }}
          >
            Keep my version
          </button>
        </div>
      )}
      {syncStatus === 'offline' && hasUnsyncedEdits && !conflict && (
        <div className="nm-banner nm-banner-soft" role="status">
          <span>You&rsquo;re offline — recent edits live only in this browser until the connection comes back.</span>
          <button type="button" className="nm-btn nm-btn-small nm-btn-primary" onClick={exportJson}>
            Download backup file
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
                ['design', 'Design'],
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
                        {!hasCoordinates(location) && (
                          <span className="nm-needs-pin">No map pin yet — open to place it</span>
                        )}
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
                  saveTokenRef.current += 1;
                  setDraft(emptyDraft());
                  setPickMode(false);
                  openPanel('network');
                }}
                onDelete={deleteDraft}
                onTogglePick={() => {
                  setPickMode((previous) => !previous);
                }}
                onFlyTo={(lat, lon, zoom) => mapRef.current?.flyToLocation(lat, lon, zoom)}
              />
            </div>
          )}

          {panel === 'design' && (
            <div className="nm-panel" role="tabpanel">
              <DesignPanel style={style} onChange={mutateStyle} onReset={resetStyle} />
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

              <h3 className="nm-section-title">Share &amp; export</h3>
              <div className="nm-export-stack">
                <button type="button" className="nm-btn" onClick={() => window.print()}>
                  Print / save as PDF
                </button>
                <div className="nm-export-row">
                  <span>Map image (PNG)</span>
                  {IMAGE_SIZES.map(({ label, scale }) => (
                    <button
                      key={scale}
                      type="button"
                      className="nm-btn nm-btn-small"
                      disabled={exportScale !== null}
                      title={`${label} resolution (${scale}× the on-screen size)`}
                      onClick={() => exportImage(scale)}
                    >
                      {exportScale === scale ? 'Rendering…' : label}
                    </button>
                  ))}
                </div>
                <label className="nm-check-row" style={{ marginTop: 2 }}>
                  <input
                    type="checkbox"
                    checked={exportStreets}
                    onChange={(event) => setExportStreets(event.target.checked)}
                  />
                  Include the street basemap in image exports
                </label>
                <p className="nm-help">
                  Images are drawn from your data, so the region and pin colors always come through. Set the county
                  fill, filters, and zoom first — the export matches what you see.
                </p>
              </div>

              <details className="nm-advanced">
                <summary>Advanced — backup &amp; restore</summary>
                <div className="nm-export-grid">
                  <button type="button" className="nm-btn" onClick={exportJson}>
                    Download backup file
                  </button>
                  <button type="button" className="nm-btn" onClick={() => importInputRef.current?.click()}>
                    Import backup
                  </button>
                  <button type="button" className="nm-btn nm-btn-danger" onClick={clearWorkspace}>
                    Clear all locations
                  </button>
                </div>
                <p className="nm-help">
                  The map saves automatically for everyone — backup files are only for archives, bulk edits, or
                  moving data in from the old prototype.
                </p>
              </details>
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

        <section className="nm-map-wrap" ref={mapWrapRef}>
          <MapCanvas
            ref={mapRef}
            counties={counties}
            borders={borders}
            locations={locations}
            settings={settings}
            style={style}
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

          {locations.length === 0 && workspace !== null && syncStatus !== 'loading' && (
            <div className="nm-map-empty">
              <p>
                <strong>The map is empty.</strong> Add the first territory host to get started.
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
