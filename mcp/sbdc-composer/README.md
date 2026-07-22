# SBDC Motion Composer — MCP server

Chat with the SBDC Motion Composer from Claude Code: describe the
training/event video you want, iterate on preview frames in the
conversation, and export a finished MP4 — **without ever opening the
browser studio or logging in**.

Sibling of `mcp/motion-studio` (the TFG Motion Studio). Under the hood
this is *not* a reimplementation and *not* an engine fork: the server
drives the repo's real engine (`src/lib/motion/render.ts` + `export.ts`)
in headless Chromium, so previews and exports are pixel-identical to the
browser studios, and every visual improvement lands in both brands.

What's SBDC-specific here:

- **Brand layer** (`src/sbdc.ts`) — the five design-system schemes
  (Navy / Paper / Cream / Cobalt / Pool Pale from the FAV NorCal SBDC
  token set), SBDC scene copy defaults, proxima-sera/proxima-nova.
- **Graphics** — flat color by design, with exactly four approved
  elements: the official America's SBDC star (scene `cornerMark`, small
  static sign-off), the official white and color NorCal SBDC lockups
  (endcards pick by scheme), and the `dot-grid` backdrop (the website's
  halftone motif). Official marks are served from
  `public/brand/assets/` when vendored there, otherwise fetched once
  from the official URLs and cached — never drawn or approximated in
  code.
- **Shortlinks** (`src/rebrandly.ts`) — wraps the Marketing Engine's
  production Rebrandly client. `shortlink_map` scans storyboard text and
  rewrites long registration URLs to `sbdc.events/slug` before preview;
  links are cached per project so re-exports never mint duplicates.
  Needs `REBRANDLY_API_KEY` (and optionally `REBRANDLY_DOMAIN`, default
  `sbdc.events`); without the key everything still previews/exports,
  just with the URLs unchanged.

## Setup (one time)

```bash
npm install            # repo root first — the bundle needs mp4-muxer
cd mcp/sbdc-composer
npm install
npm run build
```

Order matters: the build bundles the repo's real export engine
(`src/lib/motion/export.ts`), which resolves `mp4-muxer` from the root
`package.json`, so the root install must run before `npm run build`.

In Claude Code on the web this happens automatically — the repo's
SessionStart hook (`.claude/hooks/session-start.sh`) installs and builds
both motion MCP packages when a fresh container starts, and `.mcp.json`
registers the server as `sbdc-motion-composer`.

## Fonts

The SBDC faces (proxima-nova, proxima-sera) are Adobe Typekit kit
`pkl5rjs` — the kit link is the only legal delivery (no self-hosted
files, per the Adobe EULA). The harness loads the kit when the network
allows and falls back to system serif/sans stand-ins otherwise; the
authoring guide (`motion_guide`) says the same to the model.

## Test

```bash
node test/smoke.mjs
```

Storyboard → shortlink_map (against a local **mock** Rebrandly API —
tests never touch the network) → preview PNGs → H.264 export with an
audio bed.
