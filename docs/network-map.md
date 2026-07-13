# Network Map — runbook

`/network-map` maps the NorCal SBDC network: territory hosts, neighborhood
branches, and investment by service region, on the 36-county / 8-region
service area. Phase 1 implementation of `docs/region-builder-plan.md`
(the tool shipped under the name **Network Map**; "Region Builder" is
reserved for the phase-2 territory editor).

## Architecture

- Page: `src/app/network-map/page.tsx` (client-only dynamic import — Leaflet
  needs the browser).
- App: `src/components/network-map/` — `NetworkMapApp.tsx` (state + panels),
  `MapCanvas.tsx` (imperative Leaflet layer), `LocationEditor.tsx` (form +
  geocode chooser), `logic.ts` (pure ported prototype math — unit-tested),
  `storage.ts` (localStorage behind an injectable interface), `regions.ts`
  (fixed 8-region model).
- Map engine: plain Leaflet 1.9.4 in a client component. The prototype's map
  code is a single imperative module, so react-leaflet's declarative wrapper
  added nothing — the plan's engine choice (Leaflet over a MapLibre rewrite)
  is unchanged.
- Basemap: MapTiler raster tiles (`streets-v2`, 256px) with the Editorial CSS
  tile filter. If tiles fail or no key is set, the app shows a non-blocking
  notice and stays fully usable on local vector data.
- Geocoding: `src/app/api/geocode/route.ts` — US Census geocoder primary
  (keyless, public domain, no CORS → proxied server-side), MapTiler fallback,
  results bounded to the NorCal bbox, cached in memory 24 h. Session-gated by
  the app middleware like every other route.
- Geodata: `public/data/network-map/counties.v1.geojson` (36 counties,
  properties `name`/`region`/`fips`) and `region-borders.v1.geojson`
  (interior region mesh). Derived from the prototype's embedded TopoJSON
  (US Census TIGER/cartographic boundary lineage, public domain; simplified).
  San Francisco's degenerate zero-area island ring was pruned — Treasure
  Island addresses need the manual region override.

## Data model & persistence — one shared live map

- **Everyone sees and edits the same map.** The workspace lives server-side
  behind `/api/network-map/workspace` (GET/PUT, session-gated). The client
  auto-saves edits (debounced), refreshes on window focus, and shows a sync
  status in the topbar ("Saved for everyone" / "Saving…" / offline). Location
  data is shared; view settings (filters, search, toggles) stay per-browser.
- Storage: `src/lib/network-map-store.ts` writes `workspace.json` under
  `NETWORK_MAP_DATA_DIR` (default `/data/network-map` when the Railway volume
  is mounted, else `<repo>/.data/network-map`, which is ephemeral — **set the
  env var / mount the volume in production**). Every save keeps a rolling
  backup (last 20) under `backups/` for recovery.
- Conflicts: saves carry `baseUpdatedAt`; a stale save gets a 409 and the UI
  offers "Use their version / Keep my version".
- Workspace schema is the prototype's v3 (`{version:3, force, locations[],
  settings, updatedAt}`); localStorage (same key
  `norcal-sbdc-network-map-v3`) is the offline cache. JSON backups from the
  original prototype HTML import unchanged (fixture-tested).
- First run (no server file yet): the committed seed
  `public/data/network-map/network.v1.json` is served, then the first save
  materializes it into the store. **The real network seed data is still
  pending (plan decision D5).**
- Prototype users migrating: in the old HTML file use *Export JSON*, then
  Data tab → Advanced → *Import backup* here (imports affect everyone).

## Design (shared)

The **Design tab** customizes the map's look for everyone: the eight region
colors, host/branch pin fill + border, region-border color/width, county
color strength (territory fill opacity), the investment heat ramp
(low → high), the basemap style, and the empty background color. The design
is a `MapStyle` stored in the workspace (`src/components/network-map/style.ts`,
`normalizeStyle` clamps/validates every field), so it travels with the shared
live map — one person styles it and everyone, plus every export, sees it.
View settings (filters, search, layer toggles) stay per-browser; the shared
snapshot that syncs and drives conflict detection is `{locations, style}`
(`sharedSnapshot` in NetworkMapApp).

Basemaps: MapTiler styles (Streets, Minimal, Light gray, Terrain, Satellite)
or **None** for a clean color-only map. Switching basemap swaps the tile
layer; the MapTiler logo shows only while a MapTiler basemap is active.

## Exports

- **Map image (PNG)** at Standard/Large/Poster (2×/4×/6×) — rendered
  **natively** from the data + style by `render-map.ts` (drawNetworkMap) via
  `MapCanvas.renderToCanvas`, NOT by screenshotting Leaflet. This is the fix
  for "exports lost the color coding": html2canvas could not reliably capture
  Leaflet's SVG region fills once real tiles loaded, so we draw the counties,
  borders, labels, pins, legend, title, and attribution ourselves — color
  coding is always present. A "Include the street basemap" toggle (Data tab)
  composites the live tiles behind the color layers; if a tile lacks CORS and
  taints the canvas, the export automatically falls back to the clean
  color-only version.
- **Print / save as PDF** — browser print dialog with print CSS (chrome
  hidden, full-page map).
- **Backup file (JSON)** — under Data → Advanced; for archives, bulk edits,
  and prototype migration only. Normal users never need it.

## MapTiler key runbook

- Key lives in `NEXT_PUBLIC_MAPTILER_KEY` (Railway service variable +
  `.env.local` for dev). It is inlined into the client bundle at **build
  time**: set it before building; rotation = new key in Railway + redeploy.
- The key is public by design. Its only protection is the **origin
  allowlist** in the MapTiler dashboard (API keys → Allowed HTTP origins).
  Add the production domain and, if previews should show tiles, the Railway
  preview pattern; keep `localhost` out of the production key (use a second
  dev key if needed).
- **Account**: keep it under an org-owned address, not a personal one.
  Free tier = 100k requests + 5k sessions/month, non-commercial/R&D terms,
  MapTiler logo required (the app renders it), and service **pauses** on
  quota overrun — set the usage alert in the MapTiler dashboard well below
  the cap, and confirm tier eligibility per plan decision D3.
- Attribution (`© MapTiler © OpenStreetMap contributors`) is wired into the
  Leaflet attribution control — do not remove it.

## Tests

`npm test` → `tests/network-map-logic.test.ts` (formatMoney thresholds,
normalization aliases, aggregation, filters, choropleth/marker math, backup
nudge) and `tests/network-map-data.test.ts` (county dataset integrity,
point-in-polygon region detection incl. outside/limitation cases, prototype
backup import + round-trip, storage layer). Region auto-detection is
advisory (~1–3 km tolerance near county borders due to simplified geometry) —
the UI labels it "suggested" and always allows manual override.

## Phase 1.5 / 2 backlog (from the plan)

CSV import/template/export with import report, print/PDF pass, Night theme,
portable offline HTML export (template-based), remaining themes, Playwright
suite, MapLibre upgrade, territory editor, shared backend.
