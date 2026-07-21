# TFG Motion Studio — MCP server

Chat with the TFG Motion Studio from Claude Code: describe the video you
want, iterate on preview frames in the conversation, and export a
finished MP4 — **without ever opening the browser studio or logging in**.

Under the hood this is *not* a reimplementation. The server drives the
repo's real engine (`src/lib/motion/render.ts` + `export.ts`) in headless
Chromium, with the real brand fonts (Tobias, GT America Extended) and the
TFG lockups, so previews and exports are pixel-identical to
`/motion/tfg`.

## Setup (one time)

```bash
cd mcp/motion-studio
npm install
npm run build
```

The repo's `.mcp.json` already registers the server, so Claude Code picks
it up automatically when you open this repo. Requirements:

- **Chromium/Chrome** — auto-detected: the Claude Code remote
  environment's bundled Chromium, or your local Chrome install
  (Mac/Linux/Windows paths are probed). Override with
  `MOTION_STUDIO_CHROMIUM=/path/to/chrome` if needed.
- **H.264 output** — everyday Chrome encodes H.264 natively. Chromium
  builds without it (e.g. the remote environment) fall back to VP9, and
  the server automatically transcodes to H.264 + AAC with the bundled
  ffmpeg (`@ffmpeg-installer/ffmpeg`), so exports play everywhere.

## Tools

| Tool | Purpose |
|---|---|
| `motion_guide` | Authoring guide — templates, fields, TFG brand rules, pacing. Read first. |
| `motion_create_project` | New project (TFG defaults), optionally with the full storyboard. |
| `motion_list_projects` / `motion_get_project` | Inspect saved projects. |
| `motion_set_scenes` | Replace the storyboard. |
| `motion_update_scene` | Patch one scene by index. |
| `motion_update_doc` | Aspect, fps, watermark, grain, fonts, music volume/fades. |
| `motion_add_asset` | Register local images / video clips / a music bed by file path. |
| `motion_preview` | Headless PNG frames (one per scene by default), returned inline. |
| `motion_export` | Full MP4 export (music + clip audio mixed in), H.264-normalized. |

Projects are saved as JSON under `projects/` (gitignored); rendered
frames and videos land in `out/` (gitignored).

## Example session

> **You:** Make a 25-second vertical ad for TFG office hours, end on the
> website.
>
> Claude calls `motion_guide`, then `motion_create_project` with a
> storyboard (statement hook → title → agenda list → $70M+ stat on the
> electric-green scheme → end card), shows you `motion_preview` frames,
> you tweak copy with `motion_update_scene`, and `motion_export` drops
> `out/office-hours.mp4`.

## Smoke test

```bash
node test/smoke.mjs
```

Authors a 4-scene vertical ad with a synthesized music bed, renders
previews, exports, and asserts the MP4 is H.264 with an audio track.
