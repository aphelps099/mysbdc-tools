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

## Data model & persistence

- Workspace schema is the prototype's v3 (`{version:3, force, locations[],
  settings, updatedAt}`) under the same localStorage key
  `norcal-sbdc-network-map-v3`. JSON backups exported from the original
  prototype HTML import unchanged (fixture-tested in
  `tests/network-map-data.test.ts`).
- **Canonical published network**: `public/data/network-map/network.v1.json`.
  First visit loads it; "Reset to published network" restores it. To publish
  an update: make edits in the app → Data tab → **Export JSON backup** →
  copy the exported `locations`/`settings`/`updatedAt` into `network.v1.json`
  → commit → Railway deploys it to everyone. **The real network seed data is
  still pending (plan decision D5 — named data owner).**
- Backup nudges appear when un-exported edits are stale (>7 days) or pile up
  (≥25); a cross-tab banner appears when another tab writes the workspace.
- Prototype users migrating: browser storage under `file://` does NOT carry
  over — in the old HTML file use *Export JSON*, then *Import JSON* here.

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
