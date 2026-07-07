# ZFIT Motion — moved to the zebs repo

The fitness training video editor for Zeb's Platinum Fitness now lives in
**`aphelps099/zebs`** (branch `zfit-motion-studio`, merged → served by GitHub
Pages at **aphelps099.github.io/zebs/studio/**). Source is `studio-src/`
there; see its README for the feature list and the deploy workflow
(`npm run deploy` rebuilds the committed `studio/` static site).

## What stayed here

The brand-free engine upgrades built for ZFIT remain in this repo's shared
`src/lib/motion/` and benefit `/motion`, `/motion/pro`, and `/motion/tfg`:

- **Video scene template** — uploaded clips cover-fit behind text overlays,
  frame-exact seeking during MP4 export (`render.ts`, `export.ts`)
- **Disclaimer template**, **lower-right alignment**, **gradient-right overlay**
- **Audio engine** (`audio.ts`) — decode uploads; offline mixdown of a looped
  music bed with fade-in/out, per-video-scene clip audio, a play-once
  voiceover track, and coach-cam (PIP) audio
- **MP4 export with sound** — AAC (Opus fallback) track muxed via mp4-muxer
- **Coach-cam picture-in-picture** — small clip thumbnail in the lower third
  of any scene (`pip*` scene fields)
- **Per-scene text scale** (30–100%) and **optional list markers**

The existing studios don't yet expose UI for video/disclaimer scenes (their
Add-Scene grids filter them out) — the fields are there when a studio wants
them. The ZFIT editor in the zebs repo is the reference implementation.

When the engine gains features here, cherry-pick the `src/lib/motion` diff
into `zebs/studio-src/src/lib/motion` — it contains no brand
(see `docs/motion-studio-porting-guide.md`).
