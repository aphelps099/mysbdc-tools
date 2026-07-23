# Run the SBDC video generator locally with Claude Cowork

This guide takes a blank desktop (macOS or Windows) to a working,
brand-perfect training-video generator driven entirely from Claude
Cowork chat: you type "make a 4:5 LinkedIn promo for the Stockton
procurement event," Claude runs the `training-video` skill, and a
finished H.264 MP4 lands on disk.

Everything ships in this repo:

| Piece | Where | What it does |
| --- | --- | --- |
| MCP server | `mcp/sbdc-composer/` | Calendar feed, storyboards, Rebrandly shortlinks, headless-Chromium rendering, MP4 export |
| Render engine | `src/lib/motion/` | The exact canvas engine behind tools.norcalsbdc.org/motion — previews are pixel-identical to exports |
| Skill | `.claude/skills/training-video/SKILL.md` | The operating procedure Claude follows (workflow, recipes, verification checklist) |
| MCP registration | `.mcp.json` | Registers both motion servers for any session opened in this folder |
| First-run bootstrap | `.claude/hooks/session-start.sh` | Installs deps + builds the servers automatically on the first session |

## 1 · Prerequisites

- **Claude Cowork** (or the Claude Code desktop app / CLI) — signed in.
- **Node.js ≥ 20.19** — check with `node --version`; install from
  https://nodejs.org (LTS) if missing.
- **Git** — `git --version`; on macOS the Xcode CLT prompt installs it.
- **Google Chrome** (recommended) — the renderer auto-detects desktop
  Chrome and uses its native H.264 encoder, which skips the ffmpeg
  transcode entirely. No Chrome? Run
  `npx playwright install chromium` once inside `mcp/sbdc-composer/`
  and the server finds it (exports then auto-transcode via the bundled
  ffmpeg — still fully automatic, just slower).
- **Internet access** for three hosts: `www.norcalsbdc.org` (event
  feed), `use.typekit.net` (Adobe fonts — proxima-nova/proxima-sera are
  kit-delivered, never shipped as files), and `api.rebrandly.com`
  (shortlinks). No corporate proxy shenanigans on a normal home/office
  network — it just works.

## 2 · Clone and configure

```bash
git clone https://github.com/aphelps099/mysbdc-tools.git
cd mysbdc-tools
```

Create `.env.local` in the repo root (this file is gitignored — it never
gets committed):

```bash
# .env.local
REBRANDLY_API_KEY=your-key-from-app.rebrandly.com/account/api
REBRANDLY_DOMAIN=sbdc.events
```

The MCP server reads `.env.local` / `.env` itself, so the key works even
though Cowork launches the server outside your shell profile. Without a
key everything still runs — cards just keep their long URLs and the
tools warn instead of minting `sbdc.events` links.

Optional but recommended (pre-builds so your first chat doesn't wait):

```bash
npm install
cd mcp/sbdc-composer && npm install && npm run build && cd ../..
cd mcp/motion-studio && npm install && npm run build && cd ../..
```

If you skip this, the SessionStart hook does the same thing
automatically the first time you open the folder in Cowork (it detects
the missing `dist/` and builds; later sessions start instantly).

## 3 · Open in Cowork

1. In Claude Cowork, open the `mysbdc-tools` folder as the project.
2. First session: approve the **SessionStart hook** and the two
   **project MCP servers** (`sbdc-motion-composer`, `tfg-motion-studio`)
   when prompted — they're registered by the repo's `.mcp.json`, and
   `.claude/settings.json` already opts the project into them.
3. That's it. The `training-video` skill loads from
   `.claude/skills/training-video/` automatically.

## 4 · Smoke test

Paste into a fresh Cowork chat:

> Use the training-video skill. Run the pre-flight only: read the motion
> guide, confirm the Rebrandly key is available, fetch the next 3
> upcoming trainings, and render a one-scene test preview so we can
> verify the fonts are real Proxima (not Georgia/Arial fallbacks).

Pass criteria:

- 3 real events come back from the calendar.
- No `REBRANDLY_API_KEY` warning.
- The preview frame's serif is Proxima Sera — a modern, low-contrast
  serif. If it looks like Georgia/Times, the Typekit kit didn't load
  (see Troubleshooting).

Then make a real video:

> Make a single-event promo for [event URL] in 4:5 for LinkedIn.

Claude will build the storyboard, shorten the registration URL to a
`sbdc.events/...` link (≤20-char tail), preview every frame, and export
`mcp/sbdc-composer/out/<project>.mp4`.

## 5 · Day-to-day use

- **"Next 3 trainings reel, 9:16 for Stories"** — series recipe, one
  save-the-date card per event.
- **"Redo the Stockton promo with a new hook"** — projects persist in
  `mcp/sbdc-composer/projects/`; Claude reworks scenes in place and
  re-exports. Give the project name if you remember it.
- **"How many clicks did the Stockton link get?"** — `shortlink_clicks`
  reads live Rebrandly counts.
- Outputs land in `mcp/sbdc-composer/out/` (gitignored). Copy what you
  want to keep.

## 6 · Updating

```bash
git pull
cd mcp/sbdc-composer && npm install && npm run build && cd ../..
cd mcp/motion-studio && npm install && npm run build && cd ../..
```

**Then restart the Cowork session.** MCP servers hold their build in
memory — a running server keeps serving the old code after a rebuild,
and a stale server produces subtly wrong output (fallback fonts, old
layouts) while looking healthy. Rebuild → restart, always, in that
order.

## 7 · Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Serif looks like Georgia/Times; sans looks like Arial | Typekit kit (`use.typekit.net/pkl5rjs.css`) unreachable from Chromium | Check network/firewall for `use.typekit.net`; behind a corporate proxy set `HTTPS_PROXY` (the server passes it into Chromium, capping that hop at TLS 1.2). Re-export after fixing — fallback-font renders are never final |
| "REBRANDLY_API_KEY is not set" warning | Key missing from env and `.env.local`/`.env` | Add it to `.env.local` in the repo root; restart the session |
| MCP tools missing from the session | Servers not built (fresh clone) or not approved | Let the SessionStart hook run (or build manually per §2), approve the project MCP servers, restart the session |
| `events_upcoming` fails | norcalsbdc.org unreachable or feed changed | Verify the site loads in a browser; Claude should stop and report, never invent events |
| Export plays in Chrome but not on iPhone/LinkedIn | Rare: no desktop Chrome AND bundled ffmpeg missing, so the export stayed VP9/AV1 | Install Chrome, or `npm install` inside `mcp/sbdc-composer` (restores `@ffmpeg-installer/ffmpeg`), rebuild, re-export |
| Renders changed after `git pull` but look old | Stale server bundle in memory | Rebuild + restart the session (§6) |
| Ugly `-2` slug on a card | Same event re-minted from a new project | Reuse the original link (seed the new project's `shortlinks` cache from the old project JSON), delete the duplicate in Rebrandly |

## 8 · What "perfected" means here (the built-in guarantees)

These are enforced in code, not just convention:

- **Shortlink tails are hard-capped at 20 characters** — the mapper
  prefers the event's own slug only when it fits, otherwise compresses
  the title on a word boundary (`sbdc.events/stockton-probiz`).
- **Long titles auto-fit** on the editorial calendar card (≤3 lines,
  stepping down from 88px, floor 54px) and meta lines re-wrap on their
  "·" separators so a line never opens with a dangling dot.
- **Day agendas render as a two-column schedule** — time-first body
  lines (`"9:00 AM | Registration and breakfast"`) get big serif times
  left, descriptions right, on a shared grid.
- **Preview = export**, pixel for pixel — both run the same engine in
  the same headless Chromium.
- **Brand rules live in `motion_guide`** (served by the MCP server) and
  the skill makes Claude verify every frame against them before
  exporting: real Proxima loaded, short URLs, ≤3-line titles, marks
  present, sentence case, no emoji/exclamation marks.
