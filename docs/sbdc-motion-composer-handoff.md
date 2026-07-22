# SBDC Motion Composer — MCP Build Handoff

**Goal:** a second MCP video service — sibling of `mcp/motion-studio` (the TFG
Motion Studio) — that composes NorCal SBDC training/event videos from chat:
storyboard → preview frames → H.264 MP4, with SBDC's own brand voice, its own
artistic graphic set, and a Rebrandly layer that turns long training URLs into
`sbdc.events/…` shortlinks on the cards.

The TFG server is the proven reference implementation. This document tells a
fresh session exactly what to reuse, what to build, and where every decision
already has an answer in this repo.

---

## 1. What already exists (reuse, don't rebuild)

| Piece | Where | Notes |
|---|---|---|
| Deterministic canvas engine | `src/lib/motion/render.ts`, `types.ts`, `easings.ts`, `export.ts` | ONE engine, shared by the browser studios and the TFG MCP. `renderFrame` is a pure function of `(doc, timeMs)` — preview and MP4 are pixel-identical. **Keep it shared**; the SBDC composer is a brand layer, not a fork. |
| SBDC brand schemes | `src/lib/motion/types.ts` → `SCHEMES` | `navy #0f1c2e / cream #f0efeb / royal #1D5AA7 / dark / white`, accent `#8FC5D9` + `#1D5AA7`. These are the *current* SBDC palette — will be superseded by the Claude Design tokens (§3). |
| SBDC Pro studio (browser) | `src/components/motion/ProMotionStudio.tsx`, live at `tools.norcalsbdc.org/motion/pro` | The UX the user already likes: training outlines → video cards. Its defaults (`DEFAULT_BRAND`, official logo fetch via `/api/brand-asset`, Typekit kit `pkl5rjs` → proxima-nova/proxima-sera) define the SBDC voice. |
| MCP server pattern | `mcp/motion-studio/` | `server.ts` (tools + zod), `tfg.ts` (brand layer), `guide.ts` (authoring guide returned by a tool), `browser.ts` (headless Chromium driver + static file server), `harness/` (loads the bundled engine + fonts), `transcode.ts` (VP9→H.264 via bundled ffmpeg), `projects.ts` (JSON persistence), `build.mjs`, `test/smoke.mjs`. |
| Rebrandly client | `src/lib/pipeline/rebrandly.ts` + `slug.ts` | Already production-ready: `sbdc.events` domain, slugified slashtags, collision retry (-2/-3…), 429 backoff, UTM appending, link IDs stored for later remapping. Env: `REBRANDLY_API_KEY`, `REBRANDLY_DOMAIN` (defaults to `sbdc.events`). Used by the Marketing Engine (`docs/marketing-engine.md`). |
| Porting guide | `docs/motion-studio-porting-guide.md` | The general "rebrand the studio" playbook. This handoff supersedes it only where they conflict. |
| Session bootstrap | `.claude/hooks/session-start.sh`, `.mcp.json` | Installs + builds the TFG MCP on container start. The SBDC composer must be added to both. |
| SBDC marks | `public/sbdc-white-2026.png`, `public/sbdc-blue-2026.png`, `public/brand/assets/starblue@4x.png`, `starwhite@4x.png` | Lockups for endcards; the SBDC **star** is the brand's equivalent of TFG's ring — use it in the graphic set and the animated endcard. |

**Recent engine features the SBDC composer gets for free** (added during the TFG
Catalyzing Growth work): explicit `\n` line breaks in any wrapped text, list
scenes without index numerals, `weird` intensity flag, `logoText` animated
vector endcard lockup, `imageLayout: 'card'` inset portrait frames (presenter
cards), photo scenes with brand-accent kickers.

---

## 2. Architecture of the new service

Create `mcp/sbdc-composer/` mirroring `mcp/motion-studio/` file-for-file:

```
mcp/sbdc-composer/
  package.json          name: sbdc-motion-composer-mcp
  build.mjs             copy of motion-studio's, same esbuild bundling of the repo engine
  src/
    server.ts           tools: motion_guide, motion_create_project, motion_set_scenes,
                        motion_update_scene, motion_update_doc, motion_add_asset,
                        motion_preview, motion_export, motion_list/get_project
                        + NEW: shortlink_create, shortlink_map (see §5)
    sbdc.ts             brand layer (replaces tfg.ts) — schemes, scene defaults, fonts
    guide.ts            SBDC authoring guide (voice, schemes, backdrops, shortlink rules)
    rebrandly.ts        thin re-export/wrapper of src/lib/pipeline/rebrandly.ts (§5)
    browser.ts          copy — serves repo public/ + registered assets to headless Chromium
    transcode.ts        copy
    projects.ts         copy (separate projects/ dir so TFG and SBDC never collide)
    harness/harness.html  @font-face set for SBDC fonts (§3), SBDC endcard lockups
    harness/harness.ts    copy, with SBDC logo asset ids
  test/smoke.mjs        copy, SBDC storyboard + one shortlink assertion (mocked)
```

Registration:

```jsonc
// .mcp.json
"sbdc-motion-composer": { "command": "node", "args": ["mcp/sbdc-composer/dist/server.mjs"] }
```

and extend `.claude/hooks/session-start.sh` to `npm install && npm run build`
the new package (same ordering rule: repo root install first — the bundle
resolves `mp4-muxer` from root).

**Naming:** keep the tool names identical (`motion_*`) — MCP namespacing
(`mcp__sbdc-motion-composer__motion_preview`) already disambiguates, and the
muscle memory from the TFG server carries over.

**Do not fork the engine.** Anything visual the SBDC brand needs (new
backdrops, new layouts) goes into `src/lib/motion/` behind neutral scene
fields, exactly as TFG's did — the browser studios pick it up automatically.

---

## 3. Design tokens from Claude Design (the user will supply)

The user will import a token set from Claude Design. Until it lands, build
against the current `SCHEMES` palette; structure `sbdc.ts` so tokens drop in
without touching the engine:

```ts
// sbdc.ts — mirror of TFG_SCHEMES; fill from the Claude Design export
export const SBDC_SCHEMES: Record<string, CustomScheme & { label: string }> = {
  navy:  { label: 'Navy',  bg: '#0f1c2e', fg: '#ffffff', accent: '#8FC5D9' },
  cream: { label: 'Cream', bg: '#f0efeb', fg: '#0f1c2e', accent: '#1D5AA7' },
  royal: { label: 'Royal', bg: '#1D5AA7', fg: '#ffffff', accent: '#8FC5D9' },
  // + whatever the token set defines (names from the tokens, not invented)
};
```

**What to ask for / extract from the token import:**

1. Scheme colors — bg/fg/accent per named scheme (muted/line are derived by
   the engine's `resolveScheme`).
2. Typography — heading + body families. Current SBDC stack is Typekit
   `pkl5rjs` (proxima-nova, proxima-sera). The headless harness **cannot use
   Typekit** (no network guarantee) — get font *files* licensed for this use
   into `public/fonts/` and declare them in `harness.html` `@font-face`,
   exactly like Tobias/GT America/Michroma were for TFG. If only Typekit is
   available, pick the closest bundled fallback and note it in `guide.ts`.
3. Logo lockups — confirm `sbdc-white-2026.png` / `sbdc-blue-2026.png` are
   current; wire them as `__logo-*` ids in `harness.ts` (same selection logic:
   light mark on dark bg, dark mark on light).
4. Endcard `logoText` — decide the animated-lockup wordmark text and which
   glyph anchors it. Recommended: redraw the **SBDC star** (from
   `starblue@4x.png` geometry) as the vector element the way TFG's ring was
   drawn from its SVG, animating stroke-in then the wordmark. That code lives
   in `drawEndcardScene` — gate the mark choice on a scene/doc field, not the
   brand package, so both studios keep working.

The Claude Design import may arrive as a `DesignSync` payload or a tokens
JSON in chat — either way, transcribe values into `sbdc.ts` and
`harness.html` and record the mapping in the guide.

---

## 4. Task 1 — the SBDC graphic set

TFG owns: star, hero ring (sage/purple gradient), grid paper, splits, escher,
spirograph, dot-wave, wave-field, growth-bars, rounds, tfg-type, and "weird"
mode. **SBDC should not reuse the TFG-flavored ones** (hero-ring, star,
tfg-type) — it needs its own artistic family. The engine's `BACKDROPS` list is
shared, so:

- Add new ids to `src/lib/motion/types.ts` + `render.ts` `drawBackdrop`
  (same deterministic-in-`t`, scheme-colored, `A()`/`spd` weird-aware pattern
  used by every existing backdrop — read the TFG Pattern Studio port commits
  as the template).
- Document brand ownership in each server's `guide.ts` ("SBDC set: … · TFG
  set: …"). Enforcement-by-guide is enough; both servers can technically
  render everything.

**Proposed SBDC set** (design intent: civic, editorial, optimistic — "atlas &
almanac" rather than TFG's "terminal & neon"; final call belongs to the user
with the token set in hand):

| id | Look | Notes |
|---|---|---|
| `star-field` | scattered SBDC four-point stars, varied scale/alpha, slow parallax drift | THE brand mark; deterministic positions from a hashed index, never `Math.random()` |
| `contour` | topographic contour lines (nested wobbly rings, 1px, low alpha) | NorCal terrain; animate a slow phase drift |
| `halftone` | newspaper halftone dot gradient rising from a corner | editorial texture; pairs with cream/white |
| `blueprint` | fine grid + dashed construction circles/crosshairs | "business plan" energy; the SBDC answer to grid paper |
| `ribbon` | 2–3 wide flowing bezier bands in accent, low alpha | motion analog of the wave/coast; good hero-card energy |
| `atlas-arc` | a big soft-gradient arc low in frame (SBDC-colored) | direct sibling of TFG's hero-ring; reuse that conic + wedge-sweep code with SBDC stops |

Also mirror the TFG endcard: animated star + "NORCAL SBDC" (or token-specified
wordmark) via `logoText`.

`weird` already works for any backdrop — in the SBDC guide, brand it
"expressive mode" and recommend it for 1–2 scenes max (same rule that worked
for TFG).

---

## 5. Task 2 — the Rebrandly shortlink layer

Purpose: trainings carry long registration URLs (Neoserra/Localist/Zoom).
Cards should always show `sbdc.events/<slug>` instead.

**Reuse `src/lib/pipeline/rebrandly.ts`** — bundle it into the MCP via
`build.mjs` (esbuild already pulls repo `src/` for the engine; add this
module). Do not reimplement retry/collision logic.

New MCP tools in `server.ts`:

1. `shortlink_create` — `{ url, title, slug? }` → calls `createShortlink`,
   returns `{ shortlink, slashtag, id }`. Cache in the project JSON
   (`project.shortlinks: Record<longUrl, Shortlink>`) so re-renders and
   re-exports never mint duplicates.
2. `shortlink_map` *(the auto layer)* — `{ name }`: scans every scene's
   `title/subtitle/body/attribution` for `https?://` URLs longer than ~30
   chars, creates/reuses shortlinks, rewrites the text in place, and returns
   a before/after report. Call it from the storyboard flow right before
   preview, and say so in `guide.ts` ("never let a raw registration URL reach
   a card — run shortlink_map").
3. Optional: `shortlink_clicks` — wraps the existing `getClicks` for quick
   performance checks in chat.

Behavior rules:

- Env: `REBRANDLY_API_KEY` (required — fail with a clear message, don't
  crash), `REBRANDLY_DOMAIN` default `sbdc.events`.
- Slashtag = event title slug (existing `slug.ts` logic), UTM appended to the
  destination (existing `withUtm`).
- **Display text**: cards render `sbdc.events/slug` (no `https://`), matching
  how TFG cards render `techfuturesgroup.org`.
- Offline/dev mode: if the key is unset, `shortlink_map` returns the text
  unchanged with a warning instead of erroring — previews must still work.
- `test/smoke.mjs`: mock `fetch` for the Rebrandly API (assert slashtag +
  rewrite), never hit the network in tests.

---

## 6. Build order (checklist)

1. [ ] Scaffold `mcp/sbdc-composer/` by copying `mcp/motion-studio/`, rename
       package, point `projects/`/`out/` paths, wipe TFG-specific code.
2. [ ] `sbdc.ts`: schemes (current palette now, tokens when supplied), scene
       defaults in the SBDC voice (see `ProMotionStudio` defaults + the
       standard studio's `types.ts` template defaults — "free hands-on
       webinar from NorCal SBDC", `norcalsbdc.org` endcards, disclaimer
       "Funded in part through a cooperative agreement with the U.S. SBA").
3. [ ] `harness.html`/`harness.ts`: SBDC fonts + lockups.
4. [ ] Engine: add the SBDC backdrop set (§4) + SBDC endcard mark; typecheck;
       confirm the TFG studio and both browser studios still render (backdrop
       additions are purely additive).
5. [ ] `guide.ts`: SBDC voice, scheme rhythm, backdrop ownership table,
       shortlink rules, LinkedIn 4:5 guidance (same advice as TFG's guide).
6. [ ] Rebrandly tools (§5) + project-JSON caching.
7. [ ] `.mcp.json` + `session-start.sh` + root README note.
8. [ ] `test/smoke.mjs` green (storyboard → preview → export H.264 + audio,
       shortlink rewrite with mocked API).
9. [ ] Author one real training promo end-to-end as the acceptance demo
       (pick any upcoming NorCal SBDC training; 4:5; verify: SBDC backdrops,
       endcard mark animation, `sbdc.events` link on the register card).

Definition of done = checklist complete + the demo MP4 approved by the user.

---

## 7. Open questions for the user (ask before step 2 if not yet answered)

1. Claude Design tokens — paste/import when ready; which scheme names are
   canonical?
2. Font files — can proxima-nova/-sera files be shipped in `public/fonts/`
   (license), or should the composer standardize on other faces from the
   token set?
3. Rebrandly — confirm the API key in the environment belongs to the
   workspace that owns `sbdc.events`; UTM defaults still
   `utm_source=sbdc.events` per the Marketing Engine?
4. Graphic set — react to the §4 proposals (keep/kill/add) before they're
   built; "artistic styles" is the user's explicit ask, so show preview
   frames of each backdrop for sign-off before wiring them into templates.
5. Endcard wordmark text and whether the animated mark should be the star,
   the full lockup, or both variants.
