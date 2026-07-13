# Region Builder → Network Map — Production Installation Plan (v2)

Production port of the "NorCal SBDC Network Map & Investment Explorer" prototype
(single-file HTML, Leaflet + embedded county TopoJSON) into this toolbox at a
dedicated route, registered on the landing page.

This is the reviewed and strengthened version of the original draft plan. Every
repo-specific claim was verified against the codebase, every external technical
claim was checked against current provider policies and measured package data,
and the embedded county data was validated mechanically. The major changes from
the draft are listed first so the delta is clear.

---

## What changed from the draft plan, and why

1. **Map engine: Leaflet port, not MapLibre rewrite.** The prototype is already
   Leaflet; react-leaflet 5.0.0 is React 19-native (peer deps `react ^19`), so
   divIcon markers, popups, tooltips, `flyTo`, `fitBounds`, and style-function
   choropleths port ~1:1. Measured gzipped bundles: Leaflet 42.6 KB vs
   maplibre-gl 276 KB (6.5×). Raster tiles print/PDF cleanly, while MapLibre's
   WebGL canvas has known blank-print/blank-capture problems requiring
   `preserveDrawingBuffer` workarounds. The prototype's four appearance themes
   restyle the basemap via CSS filters on the tile pane — that works on raster
   tiles and ports for free, but cannot restyle data drawn into a GL canvas.
   MapTiler serves raster tiles of the same styles it serves as vector, so the
   provider choice is unchanged. MapLibre remains the phase-2 upgrade path if
   vector crispness/rotation is ever wanted.
2. **Geocoding via a server route, Census primary.** The US Census Bureau
   geocoder is free, keyless, US-only, and public domain — but it does not
   support CORS, so it needs a server-side proxy anyway. A `src/app/api/geocode/route.ts`
   route (specific routes win over the existing `[...path]` catch-all, and the
   middleware matcher password-gates it automatically) tries Census first,
   falls back to MapTiler geocoding, and caches results. The geocoding key then
   never ships to the client.
3. **MapTiler tier is an explicit decision, not an assumption.** MapTiler's
   free plan is limited to non-commercial use and R&D, requires the MapTiler
   logo, and allows 100,000 API requests + 5,000 sessions/month; exceeding
   quota **pauses service until next month** (no overage billing) — i.e. tiles
   die silently mid-demo. Confirm free-tier eligibility with MapTiler in
   writing or budget the Flex tier, and set the dashboard usage alert.
4. **Sharing model is now an explicit v1 decision.** The tool's purpose is to
   communicate *one* network footprint, but localStorage-only persistence gives
   every staff member a different, independently drifting map. Recommended
   middle path (no backend needed): a canonical network JSON checked into the
   repo, loaded read-only as the default view; local edits layer on top;
   "publish" = export JSON and commit it (the app already deploys via git on
   Railway); a "reset to published network" action closes the loop.
5. **Seeding the real network is a deliverable.** Entering the ~8 hosts,
   branches, and investment figures — and validating them against region
   detection — is scheduled work with a named data owner, not an afterthought.
   Without it, launch is an empty map.
6. **Honest, phased estimate.** The draft's full scope (engine work, full
   parity, four themes, five export formats, portable offline HTML, print/PDF,
   a11y pass, browser tests, provider adapter) is 15–25 days, not 8–12. The
   plan below is re-cut into Phase 1 (~5–7 days) / Phase 1.5 (~3–4 days) /
   Phase 2, with Phase 1 alone satisfying the launch criteria.
7. **Portable HTML export moved to Phase 2 with a real mechanism.** The
   prototype exports by cloning `document.documentElement` — impossible in a
   hydrated Next.js app. The port requires a purpose-built self-contained
   export template (see Phase 2). It also *must* embed the county vectors:
   the middleware matcher only exempts image extensions, so a `.geojson` under
   `public/` sits behind the password gate and a `file://` export can't fetch it.
8. **Repo-convention corrections.** AppShell/Sidebar is dead code (never
   imported by any page; the root layout renders bare children) — the draft's
   "add to shared sidebar" step is dropped. The actual conventions: a card in
   the `tools` array of `src/app/page.tsx`, a thin `'use client'` full-screen
   page at `src/app/<route>/page.tsx`, components + per-tool CSS under
   `src/components/<tool>/`, and a `docs/` entry.
9. **Auth claim corrected.** The toolbox *does* have authentication: an
   app-wide `APP_PASSWORD` gate in `src/middleware.ts` with HMAC-signed,
   scoped session cookies. Its matcher covers the new route and any new API
   route with zero changes. What's genuinely missing for a future shared
   workspace is per-user identity and server-side persistence — the shared
   password can't attribute edits.
10. **Naming recommendation.** In v1 the eight regions are fixed — users build
    the *network layer*, not regions. "Region Builder" describes the deferred
    phase-2 territory editor. Recommend shipping as **Network Map**
    (`/network-map`) before the route is baked into URLs and docs; reserve
    "Region Builder" for phase 2. Also rename the prototype's "Atlas"
    appearance (e.g. to "Cartographic") — the toolbox already has an ATLAS
    dashboard tool at `/atlas`.

---

## 0. Decisions to confirm before building

| # | Decision | Recommendation | Owner |
|---|---|---|---|
| D1 | Tool name and route | `Network Map` at `/network-map`; "Region Builder" reserved for the phase-2 territory editor | Aaron |
| D2 | v1 sharing model | Canonical JSON in repo, read-only default + local edits + commit-to-publish | Aaron |
| D3 | MapTiler plan | Written free-tier eligibility confirmation, else Flex tier; org-owned account (not a personal email) | Aaron |
| D4 | Export policy | Confirm whether exports carrying investment figures may leave staff; if not, add an internal-use notice to print/PDF/HTML exports | Data owner |
| D5 | Seed data owner | Who supplies and verifies host/branch addresses and investment figures (schedule dependency) | Data owner |

---

## 1. Verified context

### Prototype (single-file HTML, ~3,240 lines)

- Leaflet 1.x + topojson-client inlined; embedded TopoJSON of **36 counties**
  with `name`, `region` (1–8), and `fips` properties; app logic in one IIFE.
- Basemap failure diagnosis confirmed with one nuance: the `{s}.tile.openstreetmap.org`
  subdomains are *deprecated/discouraged* (not yet dead); the actual 403 cause
  is the missing referrer under `file://`. Either way, OSM public tiles forbid
  distributed production use and carry no SLA — a hosted provider is required.
- Geocoding calls public Nominatim (1 req/s policy, identification required,
  autocomplete banned) — must be replaced in production.
- Data model validated mechanically (script-parsed, both directions):
  - Exactly 36 county geometries; perfect bijection with the `REGIONS` lists;
    zero mismatches. Per-region counts: R1 Redwood Coast 5, R2 North State 9,
    R3 Sacramento 8, R4 San Joaquin 4, R5 North Bay 4, R6 East Bay 2,
    R7 San Francisco 1, R8 Silicon Valley 3.
  - All FIPS codes are valid, unique CA county codes matching their names.
  - Decoded San Francisco centroid lands 1.7 km from the reference point —
    encoding and transform are correct.
  - Quantization grid is fine (~4–6 m), but the geometry is heavily
    *simplified*: 880 total vertices, median border segment ~6 km. Region
    auto-detection near county borders can be off by ~1–3 km, and points
    outside the simplified shoreline (e.g. Treasure Island — SF's island
    piece is a degenerate zero-area ring) return no county. Consequences:
    detection stays advisory (see Phase 1), and centroid/label code must skip
    zero-area rings.
  - Source is US Census TIGER/cartographic-boundary derived — US Government
    work, public domain; record dataset name + vintage in the asset metadata.

### Repo (mysbdc-tools)

- Next.js 15 / React 19 / Tailwind 4 / TypeScript; Railway `standalone` build
  that copies `public/` into the server bundle — static assets work in prod.
- Tool registration = card in the `tools` array of `src/app/page.tsx`.
  Tool pages are standalone full-screen `'use client'` pages; AppShell/Sidebar
  exists but is imported by nothing (dead code).
- `src/middleware.ts` password-gates everything except an explicit exclusion
  list; the new page route and `/api/geocode` are covered automatically, and
  the restricted `inject`/`tfg` scopes are correctly redirected away.
- Specific API routes already coexist with (and win over) the
  `api/[...path]` catch-all proxy — ~20 precedents in the repo.
- `NEXT_PUBLIC_*` vars are inlined at **build** time; Railway exposes service
  variables during build, so the MapTiler key must be set before the first
  build, and key rotation requires a redeploy, not a restart (the repo already
  documents this pitfall class in `src/app/api/[...path]/route.ts`).
- Tests: vitest, node environment only, four pipeline unit suites; **no CI
  workflow runs tests at all**. There is no Playwright/jsdom/testing-library.
- No map library is installed today; `/region-builder` and `/network-map` are
  both free routes. `html2canvas` exists but can't capture a WebGL canvas —
  irrelevant under the Leaflet recommendation (raster tiles are plain DOM).

---

## 2. Production stack

| Capability | Production source | Notes |
|---|---|---|
| Map engine | **Leaflet 1.9.4 + react-leaflet 5** | 1:1 port from prototype; React 19-native; client-only component |
| Basemap | **MapTiler raster tiles** | One style per appearance theme; origin-restricted `NEXT_PUBLIC_MAPTILER_KEY` |
| Address lookup | **`/api/geocode` server route: US Census geocoder primary → MapTiler geocoding fallback** | Census is keyless/public-domain but CORS-less (needs the proxy anyway); results cached; bounded to the NorCal bbox; geocoding key stays server-side |
| County + region polygons | Local versioned GeoJSON asset (converted from the prototype TopoJSON, plus a precomputed region-border mesh) | No API; renders even when tiles fail |
| Region detection, investment math | Browser (pure functions, unit-tested) | Port `detectRegion`, `countyStyle`/`mixColor`, `markerSize`, `metricForRegion`, `formatMoney` verbatim |
| Persistence | localStorage + canonical repo dataset (D2) | Storage module isolated so a backend can replace it later |
| Shared/team workspaces | Future backend phase | Needs per-user identity, not just the shared `APP_PASSWORD` |

Configuration lives in **one config module** (style URLs, keys, bbox, provider
endpoints) — deliberately *not* a full provider-adapter abstraction; with the
engine and geocoder isolated behind small functions, swapping providers later
is a config change, and speculative abstraction isn't warranted for an
internal tool.

**Day-1 spike (half day, before anything else):** create the MapTiler key,
origin-restrict it, and verify tiles load on localhost, a Railway preview URL,
and production. Railway previews get generated hostnames — whether MapTiler's
allowlist accommodates the pattern (wildcard vs a second dev key) determines
the key strategy, and finding out in week two would force rework. Record the
outcome in the docs entry.

---

## 3. Phase 1 — MVP (~5–7 days)

Everything needed for a staff member to see the real network and maintain it.

1. **Foundation**
   - `src/app/network-map/page.tsx` (or `/region-builder` if D1 is declined):
     thin `'use client'` wrapper; full-screen layout per repo convention.
   - Components, logic, and `network-map.css` under `src/components/network-map/`.
   - Landing card in the `tools` array of `src/app/page.tsx`.
   - Leaflet mounted in a client-only component (dynamic import, no SSR);
     replicate map chrome: zoom control bottom-right, imperial scale, min/max
     zoom 5/18, initial fit to county bounds padded 4%, `role="application"` +
     aria-label, and an engine-load failure state.
2. **Data model**
   - Convert the embedded TopoJSON to a versioned GeoJSON asset + precomputed
     region-border mesh (interior boundaries where region ids differ) under
     `public/data/` (note: cookie-gated by middleware — fine for the app,
     load-bearing for Phase 2 exports). Record source + vintage. Prune or
     document SF's degenerate zero-area ring.
   - Typed `Region`, `Location`, `BuilderSettings`, `Workspace` schemas,
     wire-compatible with the prototype's v3 state
     (`{version:3, force, locations[], settings{…}, updatedAt}`).
3. **Core features (parity spec in §6 is normative)**
   - Location CRUD for hosts and branches with toasts, delete confirmation,
     and the live preview marker.
   - Geocode via `/api/geocode` (on-demand only, ≤5-candidate chooser list,
     never auto-picks, prototype's exact failure copy preserved), map-click
     pick mode with full lifecycle, manual coordinates, coordinate status line.
   - Region auto-detection as an **advisory pre-fill**: manual override stays;
     label the detected region "suggested — verify near county lines"; when
     detection returns null (offshore/simplified-coastline points), prompt for
     manual selection instead of failing silently.
   - Choropleth fill modes (territories/total/host/branch), county tooltips +
     hover highlight + click-to-filter, region labels (with the SF center
     override), marker scaling, filters, search, fit-to-network, stats bar,
     regional rollup, legend, data-health panel, empty states.
   - **One** polished theme (Editorial). Remaining themes in later phases.
4. **Persistence + sharing (per D2)**
   - Canonical network JSON in the repo rendered read-only by default; local
     edits layered on top in localStorage (prototype key/schema); "reset to
     published network" action; publish flow = export JSON → commit.
   - Backup nudge: track last-export timestamp; prompt to download a JSON
     backup when stale (>7 days or >N edits).
   - Cross-tab guard: listen to the `storage` event; warn/refresh on external
     writes rather than silently last-write-wins clobbering.
   - JSON export/import, **including prototype v3 backups verbatim** — that's
     the only migration path for prototype users (`file://` localStorage does
     not carry over); document "Export JSON in the old file → Import here."
5. **Seed the real network (per D5)** — hosts, branches, investment figures
   entered, verified against region detection, and committed as the canonical
   dataset. This is the launch payload, not test data.
6. **Tests + docs (fit existing infra)**
   - Vitest node unit tests: `detectRegion` (outside-territory points → null,
     MultiPolygon coastal counties, polygon holes, region-seam points),
     aggregation/`metricForRegion`, `formatMoney` thresholds (9.5M/12M/85K/850
     pin-downs), normalization defaults, JSON round-trip incl. a real
     prototype-export fixture. Per-file `@vitest-environment jsdom` for the
     storage module.
   - A written manual smoke checklist (browser automation is Phase 2 — it
     would require standing up Playwright *and* this repo's first test-running
     CI, out of proportion for MVP).
   - `docs/network-map.md` runbook: key ownership/rotation, allowed origins,
     dev-key policy, usage-alert threshold and cadence, canonical-data update
     workflow, county-data licensing note, prototype-migration instructions.
   - `.env.example`: document `NEXT_PUBLIC_MAPTILER_KEY` (+ build-time-inlining
     caveat) and any server-side geocoding key.

**Phase 1 stop line:** if the schedule slips, everything in Phases 1.5/2 sheds
first; Phase 1 alone must satisfy the launch criteria in §5.

### Phase 1.5 — Reporting & polish (~3–4 days)

- CSV import with the prototype's exact header-alias table
  (name|organization|location; type|"location type"; region|"service region"|territory;
  address|"street address"; investment|"annual investment"|funding;
  latitude|lat; longitude|lon|lng; notes|note), case-insensitive headers,
  currency-symbol stripping — via a real CSV parser (Papa Parse) so quoted
  embedded newlines survive. **Improvements over the prototype:** per-row
  import report (N imported / M skipped and why) instead of silent row drops;
  no silent unknown-region→Region 1 default — derive from coordinates when
  present, otherwise flag "needs region review" in the report and data-health
  panel (a typo'd region name must not silently inflate Redwood Coast's
  investment rollup).
- Replace/append import flow as a real modal (not `window.confirm`), with
  defined semantics for full-state-append (prototype silently discards
  imported settings — keep and document, or ask).
- CSV export with an added `id` column (prototype CSV round-trips are lossy:
  ids regenerate and multi-line notes break), CSV template, GeoJSON export —
  all preserving the prototype's filenames and property schemas.
- Print/PDF styling (prototype's `@media print` is the reference: chrome
  hidden, map full-page) — raster tiles print reliably.
- Night (dark) theme: a MapTiler dark style + a night data palette (the CSS
  variable/filter approach ports, but choropleth ramp, labels, and legend need
  night-specific colors validated for contrast).
- Accessibility regression pass — framed as **preserving** the prototype's
  existing semantics (aria-pressed/selected sync, keyboard-focusable markers,
  focus-visible outlines, aria-live toast, sr-only labels), plus reduced
  motion and touch/narrow-screen checks against the prototype's 980px/560px
  breakpoints.

### Phase 2 — Later, by demand

- **Portable offline HTML export.** Mechanism (the prototype's clone-the-DOM
  trick cannot work in Next.js): ship a purpose-built, self-contained export
  template as a versioned static asset — inlined Leaflet + topojson-client +
  county TopoJSON + viewer script, zero network requests (mandatory: the
  origin-restricted key would be rejected under `file://`, and the cookie-gated
  `public/` GeoJSON would be unreachable). Export = fetch template text,
  inject serialized state with `force:true` into its
  `<script id="network-seed" type="application/json">` block (with `</script`
  escaping), download as Blob. Honor the seed/force contract from the
  prototype: `force:true` beats stored state on first load, then normalizes to
  `force:false` so edits persist. Version the template with the schema; decide
  whether exports are full editors (prototype behavior) or read-only viewers.
  Invariant, also a launch criterion when this ships: **no API key appears in
  any export artifact.**
- Remaining appearance themes (Cartographic née "Atlas", Monochrome — note
  Monochrome grayscales the *data layers* too, which needs a JS palette, not
  just tile filters).
- Playwright browser tests + this repo's first test-running CI workflow.
- MapLibre GL upgrade if vector rendering/rotation is wanted (via
  `@vis.gl/react-maplibre`; same MapTiler styles).
- Territory editor — reassign counties, rename/recolor regions. *This* is the
  feature the name "Region Builder" belongs to.
- Shared multi-user workspaces: requires per-user identity (the shared
  APP_PASSWORD can't attribute edits) and server persistence; the scoped-
  password pattern (`INJECT_PASSWORD`, `tfg`) is the existing precedent a
  backend phase would extend, and the storage-module seam from Phase 1 is the
  integration point.

---

## 4. Reliability

- **Basemap failure is a designed state:** county polygons, region borders,
  labels, markers, popups, and totals all render from local data on a neutral
  background with a non-blocking "basemap unavailable" notice (this matches
  the prototype, where all data layers are tile-independent).
- **Geocoder failure degrades gracefully:** inline error with the prototype's
  copy; map-click and manual coordinates keep working. Two independent
  geocoding providers (Census + MapTiler) behind the server route.
- **Quota:** MapTiler dashboard alert set well below the tier cap (free tier
  *pauses* on overage); usage reviewed on the cadence in the runbook.
- **Data loss:** backup nudges + canonical dataset in git cap the blast
  radius of cleared browser storage; cross-tab guard prevents silent
  clobbering.

## 5. Launch criteria (all falsifiable)

1. Tiles load with no 403/blocked requests on localhost, Railway preview, and
   production (per the day-1 key spike).
2. The **seeded real network** renders on first load with correct regional
   totals — verified against the data owner's figures.
3. A user can create a location by address lookup or map click; the detected
   region matches expectation, and near-border/null-detection cases surface
   the advisory/manual-selection paths.
4. Reloading preserves workspace **including settings** (theme, fill mode,
   filters, search); "reset to published network" restores the canonical map.
5. A JSON backup exported from the original prototype imports cleanly
   (fixture-tested), and JSON export→import round-trips losslessly.
6. With all tile requests blocked (simulated offline/403), the app still
   renders county polygons, region borders, labels, markers, popups, and
   investment totals, and shows the non-blocking notice; geocoder failure
   shows the inline error while map-click and manual entry keep working.
7. MapTiler logo + "© MapTiler © OpenStreetMap contributors" attribution
   visible; usage alert configured; `docs/network-map.md` runbook merged.
8. Verified on current Chrome, Safari, and Firefox, and at one tablet width.
9. `npm run build` and Railway deploy succeed with the key set at build time.

## 6. Parity spec (normative)

The prototype file is the acceptance spec for v1 behavior. The port must
preserve, verbatim where applicable (all verified present in the prototype):

- **Rendering math:** choropleth fill `mix('#eef2f8','#1a3fa3', 0.18 + 0.82·√(value/max))`
  normalized against the max region metric for the active fill mode, zero-value
  counties `#eef1f4`; fill opacity 0.52 (territories) / 0.68 (investment
  modes); "show county boundaries" toggles county stroke only; white 2.6px
  non-interactive region mesh; region labels at county-bounds centers with the
  SF override (37.78, −122.44) and compact investment subtitles; markers —
  host 30px "H" vs branch 20px "B", investment scaling += (18|14)·√(inv/maxVisible)
  over currently *visible* placed markers.
- **Interactions:** county sticky tooltips (region name, county, region-total
  investment) + hover highlight + click-to-filter (sets filter, switches
  panel, toasts); save/list-row flyTo + popup-open behaviors (zoom floors 10
  and 11); popup "Edit location" button; pick-mode lifecycle (crosshair,
  button-state swap, toggle-off, region auto-detect); fit-network over
  *filtered* placed locations with county-bounds fallback; preview marker
  tracking form edits; appearance menu Escape/outside-click dismissal;
  `invalidateSize` on resize and panel switches.
- **Panels & flows:** stats bar (compact total, regions covered n/8, host and
  branch counts), data-health counts with success state, location list sorting
  (region→type→name) with "Needs map position" badges and result counts, both
  empty states, rollup bars `max(1.5, 100·total/max)` in region colors,
  per-mode legend with $0–max gradient, toast for every mutation, confirms for
  delete and clear-workspace (clears locations, keeps settings), clear-filters,
  search across name/address/notes/region-name/type, dual synced host/branch
  toggles (sidebar checkboxes + map chips, aria-pressed).
- **Formatting:** `formatMoney` compact thresholds exactly (≥$1M: 1 decimal if
  ≥$10M else 2, trailing zeros stripped; ≥$1K: 0 decimals if ≥$100K else 1;
  else whole-dollar USD).
- **Export surface:** prototype filenames, CSV header set, template rows, and
  GeoJSON property schema (`{id, type, name, regionId, region, address,
  investment, notes}`, placed locations only, `application/geo+json`) — kept
  drop-in compatible for any workflow users built against the prototype.

## 7. Sources verified during review

- OSM tile usage policy (referrer requirement, no-SLA, distribution ban;
  `{s}` subdomains deprecated): operations.osmfoundation.org/policies/tiles/
- Nominatim policy (1 req/s, identification, autocomplete ban):
  operations.osmfoundation.org/policies/nominatim/
- MapTiler pricing/terms (free tier = non-commercial/R&D, logo required,
  100k requests + 5k sessions/mo, pause-on-overage) and key origin
  restriction: maptiler.com/cloud/pricing/, docs.maptiler.com/cloud/api/authentication-key/
- react-leaflet 5.0.0 React 19 peer deps; measured gzip sizes (leaflet 42.6 KB
  vs maplibre-gl 276 KB): registry.npmjs.org tarballs
- MapLibre WebGL print/capture caveats: maplibre-gl-js discussion #3900
- US Census geocoder (free, keyless, public domain, batch 10k, **no CORS**):
  geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html
- TIGER/cartographic boundary public-domain status: census.gov TIGER/Line
  technical documentation
- County/region data: validated mechanically from the prototype file (36
  counties, two-way region match, FIPS registry check, SF centroid
  reconstruction, quantization/simplification measurement)
