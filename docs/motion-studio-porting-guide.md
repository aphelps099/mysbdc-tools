# Porting Motion Studio to an On-Brand Program Repo

**How to rebuild the `/motion` video tool in another repository — with a program's own
branding baked in — and get the same quality results.**

Worked example throughout: **Tech Futures Group** (`techfuturesgroup.org`), whose brand
system already lives in this repo's TFG title-card tool. Swap in any other program's
tokens the same way.

---

## 1. What you're rebuilding

Motion Studio is ~2,500 lines of self-contained TypeScript with **one** npm dependency
beyond Next.js/React (`mp4-muxer`). No video backend, no ffmpeg, no cloud rendering —
everything runs in the browser. That's why it ports cleanly.

```
┌────────────────────────────────────────────────────────────┐
│  ENGINE  src/lib/motion/          (framework-agnostic)     │
│                                                            │
│  types.ts    scene model, templates, schemes, aspects      │
│  easings.ts  easing math                                   │
│  render.ts   renderFrame(ctx, doc, timeMs, assets)         │
│              — a PURE FUNCTION of time. The live preview   │
│              and the exporter call the same function, so   │
│              the MP4 is pixel-identical to the preview.    │
│  fonts.ts    Typekit kit loader + font-file upload         │
│  export.ts   WebCodecs → mp4-muxer (MP4), MediaRecorder    │
│              (WebM fallback), PNG snapshot                 │
├────────────────────────────────────────────────────────────┤
│  EDITOR  src/components/motion/                            │
│                                                            │
│  ProMotionStudio.tsx  scene strip · canvas preview ·       │
│                       timeline · inspector · brand panel · │
│                       script→scenes panel · export panel   │
│  MotionStudio.tsx     the original (no brand/AI panels)    │
│  controls.tsx         small form primitives                │
│  motion-studio.css    all editor styles (ms-* classes)     │
├────────────────────────────────────────────────────────────┤
│  AI (optional)  script → scenes                            │
│                                                            │
│  src/lib/claude.ts                    Anthropic client     │
│  src/lib/prompts/motion-scenes.ts     storyboard prompt    │
│  src/app/api/ai/motion-scenes/route.ts  POST endpoint      │
├────────────────────────────────────────────────────────────┤
│  ROUTES                                                    │
│  src/app/motion/page.tsx        standard studio            │
│  src/app/motion/pro/page.tsx    pro studio                 │
└────────────────────────────────────────────────────────────┘
```

**Key design decision to preserve when porting:** `render.ts` must stay a deterministic
function of `(doc, timeMs)`. Never introduce `Date.now()`, `Math.random()`, or state
that changes between preview and export — that's the property that makes "export
matches preview" true.

---

## 2. Prerequisites

- Node 20.19+ (matches this repo's `engines` field)
- A GitHub repo for the program (e.g. `tfg-motion`)
- The program's brand tokens: 3–5 color schemes, logo files (light + dark versions,
  PNG with transparency), font families
- If the program uses Adobe Fonts: a **Typekit kit ID** whose *allowed domains* include
  the new deployment domain (see §7 — this is the #1 "fonts look wrong in prod" cause)
- Optional, for script→scenes: an `ANTHROPIC_API_KEY`

---

## 3. Bootstrap the new repo

```bash
npx create-next-app@latest tfg-motion \
  --typescript --app --tailwind --no-src-dir=false --src-dir \
  --import-alias "@/*" --no-eslint
cd tfg-motion
npm install mp4-muxer
```

Copy these files from `mysbdc-tools` (paths identical in the new repo):

```
src/lib/motion/types.ts
src/lib/motion/easings.ts
src/lib/motion/render.ts
src/lib/motion/fonts.ts
src/lib/motion/export.ts
src/components/motion/ProMotionStudio.tsx
src/components/motion/controls.tsx
src/components/motion/motion-studio.css
src/app/motion/pro/page.tsx        → move to src/app/page.tsx (make it the home page)
```

For the AI feature, also copy:

```
src/lib/claude.ts
src/lib/prompts/index.ts           (trim to just SBDC_CONTEXT + motion-scenes export)
src/lib/prompts/motion-scenes.ts
src/app/api/ai/motion-scenes/route.ts
```

**Recommendation: copy `ProMotionStudio.tsx`, not `MotionStudio.tsx`.** It already has
custom colors, logo upload, and script→scenes. In a single-program repo you then *bake
the brand in as defaults* (§5) and keep the panels for one-off overrides.

Two small fixups after copying:

1. **Remove the ThemeProvider.** The page imports `ThemeProvider` from
   `@/context/ThemeContext` — that's mysbdc-tools site chrome. Delete the import and
   the wrapper element. All the header styles use CSS-var fallbacks
   (`var(--p-sand, #f0efeb)`), so nothing breaks visually.
2. **Root layout + Typekit.** In `src/app/layout.tsx`, add the program's kit:

   ```tsx
   <head>
     <link rel="stylesheet" href="https://use.typekit.net/pkl5rjs.css" />
   </head>
   ```

   (TFG uses the same kit as NorCal — `pkl5rjs` serves `proxima-nova` and
   `proxima-sera`. Another program would substitute its own kit ID.)

Run `npm run dev` — the studio should come up at `/` looking exactly like
mysbdc-tools' `/motion/pro`. **Get to this checkpoint before touching brand tokens**;
it separates "port broke something" from "rebrand broke something."

---

## 4. The rebrand map — every place brand lives

This is the complete list. Nothing else in the codebase carries brand.

| # | What | File | Where |
|---|------|------|-------|
| 1 | Color schemes (the preset swatches) | `src/lib/motion/types.ts` | `SCHEMES` array |
| 2 | Default scene copy (placeholder text) | `src/lib/motion/types.ts` | `defaults` map inside `makeScene()` |
| 3 | Default fonts | `src/lib/motion/types.ts` | `defaultDoc()` → `fontHeading`, `fontBody` |
| 4 | Font picker suggestions | `src/lib/motion/fonts.ts` | `builtinFonts()` |
| 5 | Default Typekit kit | `src/lib/motion/fonts.ts` | `DEFAULT_KIT_ID` |
| 6 | End-card logos | `ProMotionStudio.tsx` | the `useEffect` that loads `__logo-white` / `__logo-blue` from `/public` |
| 7 | Brand panel defaults | `ProMotionStudio.tsx` | `DEFAULT_BRAND` constant |
| 8 | Export filename | `ProMotionStudio.tsx` | `handleExportVideo` (`'sbdc-motion'` base) |
| 9 | Editor chrome palette | `motion-studio.css` | `.ms-root` CSS variables |
| 10 | Page header / titles | `src/app/page.tsx` (was `motion/pro/page.tsx`) | header JSX + `metadata` |
| 11 | AI brand voice | `src/lib/prompts/index.ts` | `SBDC_CONTEXT` → program context |
| 12 | AI defaults | `src/lib/prompts/motion-scenes.ts` | `brandName` default |

The renderer (`render.ts`), easings, and exporter contain **zero** brand — don't edit
them except to add features.

---

## 5. Worked example: TFG Motion

TFG's system (from `techfuturesgroup.org/brand`, already encoded in this repo's
`TFGTitleCard.tsx`): near-black `#0d0d0d`, slate `#131316`, off-white text `#e2e6eb`,
electric green accent `#4eff00`, gray muted `#6e7681`, Proxima Nova (+ Proxima Sera
for serif moments), lightning-bolt mark, terse uppercase kickers.

### 5.1 Schemes — `types.ts`

Replace the `SCHEMES` array wholesale:

```ts
export const SCHEMES = [
  { id: 'dark',  label: 'Dark',  bg: '#0d0d0d', fg: '#e2e6eb', accent: '#4eff00', muted: 'rgba(226,230,235,0.4)',  line: 'rgba(255,255,255,0.1)' },
  { id: 'slate', label: 'Slate', bg: '#131316', fg: '#e2e6eb', accent: '#4eff00', muted: 'rgba(226,230,235,0.35)', line: 'rgba(255,255,255,0.08)' },
  { id: 'green', label: 'Green', bg: '#4eff00', fg: '#0d0d0d', accent: '#0d0d0d', muted: 'rgba(13,13,13,0.45)',    line: 'rgba(13,13,13,0.15)' },
  { id: 'white', label: 'White', bg: '#ffffff', fg: '#0d0d0d', accent: '#4eff00', muted: 'rgba(13,13,13,0.35)',    line: 'rgba(0,0,0,0.08)' },
  { id: 'navy',  label: 'Navy',  bg: '#0f1c2e', fg: '#e2e6eb', accent: '#4eff00', muted: 'rgba(226,230,235,0.4)',  line: 'rgba(255,255,255,0.12)' },
] as const;
```

Rules of thumb when adapting for any program:
- Keep **4–6 schemes**; each needs `bg`/`fg` contrast ≥ WCAG AA at large-text sizes.
- `muted` ≈ fg at 35–55% alpha; `line` ≈ fg at 8–16% alpha.
- Include at least one light scheme — end cards on white read well in email embeds.
- Scheme `id`s are free-form, but if you keep the AI endpoint, update the scheme names
  in `motion-scenes.ts`'s prompt AND the `SCHEMES` allowlist in
  `api/ai/motion-scenes/route.ts` to match, or generated scenes fall back to defaults.

Update `makeScene()`'s per-template `defaults` and `scheme: 'navy'` base to TFG copy
so a blank scene already looks like the program:

```ts
scheme: 'dark',
// ...
title: {
  kicker: 'TFG OFFICE HOURS',
  title: 'Scale Your Tech Startup',
  subtitle: 'No-cost advising from Tech Futures Group',
},
endcard: {
  title: 'techfuturesgroup.org',
  kicker: 'BOOK A SESSION',
  subtitle: 'A specialty program of the NorCal SBDC network',
  ...
},
```

### 5.2 Fonts — `types.ts` + `fonts.ts`

TFG shares NorCal's kit, so for TFG only the defaults change:

```ts
// defaultDoc() in types.ts — TFG leads with the sans
fontHeading: 'proxima-nova',
fontBody: 'proxima-nova',
```

For a program with different fonts:
- `DEFAULT_KIT_ID` in `fonts.ts` → their kit ID.
- `builtinFonts()` → list their families (these seed the font-picker datalist; the
  names must match the `font-family` strings the kit declares).
- Self-hosted fonts instead of Typekit? Drop the files in `public/fonts/`, declare
  `@font-face` in `globals.css`, and list the family in `builtinFonts()` with
  `source: 'local'`. The canvas renderer only cares that `document.fonts` can resolve
  the family name.

### 5.3 Logos — `ProMotionStudio.tsx`

Put the marks in `public/` (e.g. `tfg-bolt-green.png`, `tfg-bolt-dark.png`) and point
the built-in loader at them:

```ts
for (const [id, url] of [
  ['__logo-white', '/tfg-bolt-green.png'],  // shown on dark backgrounds
  ['__logo-blue',  '/tfg-bolt-dark.png'],   // shown on light backgrounds
] as const) {
```

(The `__logo-white`/`__logo-blue` keys are just "for dark bg" / "for light bg" slots —
renderer picks by background luminance. The Brand-panel upload still overrides them at
runtime via `__logo-brand-*`.)

### 5.4 Brand panel defaults + export filename — `ProMotionStudio.tsx`

```ts
const DEFAULT_BRAND: CustomScheme = { bg: '#0d0d0d', fg: '#e2e6eb', accent: '#4eff00' };
// handleExportVideo:
const base = brandName ? ... : 'tfg-motion';
```

### 5.5 Editor chrome — `motion-studio.css`

The editor UI itself (panels, buttons) is brandable via the `.ms-root` variables.
For TFG's dark editor:

```css
.ms-root {
  --ms-sand: #0d0d0d;   --ms-cream: #131316;  --ms-white: #1b1b1f;
  --ms-ink: #e2e6eb;    --ms-mid: #9aa2ab;    --ms-muted: #6e7681;
  --ms-line: rgba(255,255,255,0.09);
  --ms-royal: #4eff00;  --ms-pool: #4eff00;
  --ms-sans: 'proxima-nova', sans-serif;
}
```

Two hard-coded exceptions to also change for a dark editor: `.ms-btn.is-primary` and
`.ms-seg-btn.is-active` use `#fff` text — flip to `#0d0d0d` when the accent is a light
color like TFG green. Everything else derives from the variables.

### 5.6 Page chrome — `src/app/page.tsx`

Header title ("TFG Motion"), the top-right tagline, the back-link target, and the
Next.js `metadata` in `layout.tsx`. Search the two page files for `SBDC` and `Motion
Studio` — that's all of it.

### 5.7 AI context — `src/lib/prompts/index.ts`

Rewrite `SBDC_CONTEXT` for the program. Keep the same shape (identity → key facts →
voice → audience); it materially changes output quality. TFG sketch:

```ts
export const SBDC_CONTEXT = `You are a marketing copywriter for Tech Futures Group,
the NorCal SBDC specialty program for technology startups.

KEY FACTS:
- No-cost, confidential advising for tech founders
- Specialists in fundraising (VC, angel, SBIR/STTR), product, and go-to-market
- Part of the NorCal SBDC network, funded by the SBA

BRAND VOICE:
- Sharp, technical, founder-to-founder — never fluffy
- Short sentences. Concrete numbers. No exclamation points.
- Confident understatement; the electric-green accent does the shouting

AUDIENCE:
- Startup founders and technical CEOs in Northern California
- Skeptical of "free" — lead with specialist credibility` as const;
```

Also set the default in `motion-scenes.ts`: `brandName = 'Tech Futures Group'`.

---

## 6. The AI endpoint in the new repo

- Copy the four files listed in §3. Trim `prompts/index.ts` to just the context
  constant plus the `motion-scenes` re-export (the other prompt builders are
  mysbdc-tools features).
- `.env`: `ANTHROPIC_API_KEY=sk-ant-...` — the route already degrades gracefully
  (returns a clear 503 message the UI surfaces) when unset.
- `claude.ts` defaults to `claude-haiku-4-5-20251001`. Storyboarding is the one call
  in this stack where model quality is visible; if results feel flat, pass a stronger
  model via the route: `callClaude({ ...promptOptions, model: 'claude-sonnet-5' })`.
- The route sanitizes/allowlists everything the model returns before it reaches the
  editor — if you rename schemes/templates, update the allowlist sets at the top of
  `route.ts`.

---

## 7. Deployment

Any Next.js host works. Matching this repo's Railway setup:

1. `next.config.js`: keep `output: 'standalone'` and the start script
   `node .next/standalone/server.js`. **Gotcha we hit in dev:** standalone output does
   not include static assets — the deploy step must copy `.next/static` →
   `.next/standalone/.next/static` and `public` → `.next/standalone/public` (Railway's
   nixpacks build or a `postbuild` script). Symptom if you forget: page loads but
   nothing is interactive (chunks 404, React never hydrates).
2. Env vars: `ANTHROPIC_API_KEY` (optional), plus an app password gate if the program
   wants one (mysbdc-tools' `middleware.ts` + `/login` is copyable).
3. **Adobe Fonts domain allowlist** — in the Adobe Fonts dashboard, edit the kit and
   add the production domain (e.g. `tfg-motion.up.railway.app` and/or
   `motion.techfuturesgroup.org`). Symptom if you skip: editor works, but canvas
   text renders in fallback sans and exports look off-brand. `localhost` is allowed on
   kits by default, so this only bites in production.
4. Browser support note for users: MP4 export needs WebCodecs (Chrome/Edge; Safari 16.4+
   usually works). Firefox users get the WebM fallback button.

---

## 8. QA checklist (run before calling it done)

- [ ] `npm run build` clean; page hydrates (buttons enabled, canvas resizes to 1920×…)
- [ ] Every scheme swatch: readable text, correct accent, end-card logo variant swaps
      correctly between light/dark backgrounds
- [ ] Fonts: canvas titles render in the program font (compare against a styled DOM
      element; if canvas differs, the family name string doesn't match the kit's)
- [ ] All 7 templates × a few animation presets play and settle to a fully-visible frame
- [ ] Image scene: upload, Ken Burns, overlay legibility at 65%
- [ ] Export MP4 at 16:9 and 9:16; scrub the file in QuickTime/Chrome — first frame,
      transitions, and last frame match the preview; file plays in Slack/YouTube upload
- [ ] Script→scenes with a real transcript: scenes load, durations sane, brand colors
      apply when toggled on
- [ ] Production only: Typekit domain allowlisted (see §7.3)

---

## 9. Fastest path: have Claude Code do the port

This guide doubles as a prompt. In a Claude Code session on the **new, empty repo**:

> Rebuild the Motion Studio video tool from `aphelps099/mysbdc-tools` in this repo for
> **Tech Futures Group**, following
> `docs/motion-studio-porting-guide.md` from that repo exactly. Copy the engine
> (`src/lib/motion/*`), the Pro editor, and the AI script-to-scenes endpoint, then apply
> the full rebrand map in §4 with the TFG tokens in §5 (dark `#0d0d0d`, slate
> `#131316`, text `#e2e6eb`, accent `#4eff00`, proxima-nova via Typekit kit `pkl5rjs`,
> TFG bolt logos). Make the studio the home page, dark editor chrome, verify with the
> §8 checklist including a real MP4 export in a headless browser, and push.

(Add `aphelps099/mysbdc-tools` as a second source/repo in the session so the files are
readable, or paste the five engine files if not.)

Quality levers when directing Claude on a rebuild — the things that made this tool
good, worth restating in any prompt:

1. **Deterministic renderer** — demand "a pure function of time; export must be
   pixel-identical to preview," not "record the preview."
2. **Reference frames** — screenshots of motion you like (start frame + end frame,
   with a sentence about what moves) get dramatically better animation design than
   adjectives do.
3. **Real brand tokens** — paste exact hexes and family names from the program's brand
   page; never let the model guess "a nice green."
4. **A verification bar** — require an actual exported MP4 checked frame-by-frame in a
   browser before the work is called done.

---

## 10. Keeping ports in sync (later)

Each program repo owning a copy is the right call today: engine churn is low and brand
divergence is the point. If the number of ports grows past ~3, extract `src/lib/motion`
into a private npm package (`@norcal-sbdc/motion-engine`) — it has no React or brand
imports, so it publishes cleanly — and let each repo own only its editor + tokens.
Until then: when the engine gains a feature here, cherry-pick the `src/lib/motion`
diff; it never contains brand.
