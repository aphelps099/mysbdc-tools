---
name: event-promo-video
description: Build a finished promo MP4 for events using the motion MCP servers — an SBDC "next 3 trainings" series reel or single-event save-the-date (sbdc-motion-composer), or a TFG series/single-event ad (tfg-motion-studio). Use when the user asks for an event video, promo video, save-the-date, "set of 3" events reel, training calendar video, or an MP4 promoting SBDC or TFG events/workshops.
user_invocable: true
---

# Event Promo Video — SBDC & TFG

Produce a finished MP4 promoting events, using the repo's two motion MCP
servers (registered in `.mcp.json`; the SessionStart hook builds both):

- **SBDC** → `sbdc-motion-composer` tools. Has a live calendar feed
  (`events_upcoming`) and Rebrandly shortlinks (`shortlink_map` /
  `shortlink_create` → `sbdc.events/slug`).
- **TFG** → `tfg-motion-studio` tools. **No calendar feed, no shortlink
  tools** — every event fact must come from the user, and URLs must
  already be short/display-ready (`techfuturesgroup.org`, an Eventbrite
  vanity link, etc.).

Both servers expose the same core: `motion_guide`, `motion_create_project`,
`motion_set_scenes`, `motion_update_scene`, `motion_update_doc`,
`motion_add_asset`, `motion_preview`, `motion_export`. **Always read the
server's `motion_guide` first** — it is the authority on templates,
schemes, and voice; this skill adds the required inputs, the recipes, and
the gotchas the guides don't cover.

## What you need from the user — the exact checklist

### SBDC — series ("next N trainings", N ≤ 5)
Nothing per-event. Required:
1. `REBRANDLY_API_KEY` in the environment (check it; `REBRANDLY_DOMAIN`
   optional, defaults `sbdc.events`).
2. `https://www.norcalsbdc.org` reachable (the feed source).
3. Aspect / platform (default `1:1` feed; `4:5` LinkedIn/IG, `9:16` Stories).

Everything else comes from `events_upcoming { limit: N }`: each event
arrives with a ready `suggestedScene` (the 1d save-the-date card,
registration URL in `attribution`) plus one `agendaScene` covering the set.
If either pre-flight fails, **stop and say what's missing — never invent
placeholder events.**

### SBDC — single event
1. Which event — a norcalsbdc.org event URL/slug or a title to match
   against `events_upcoming` (fetch with a generous limit and pick it).
2. Same pre-flight as the series (key + site).
3. Aspect, plus optionally 2–4 bullet takeaways ("what you'll learn") and
   a speaker photo (register via `motion_add_asset`) for a deeper video.

If the event isn't in the feed, ask the user for: title, date, time,
center name, format (online/in person), and the **registration URL**
(mint the shortlink with `shortlink_create`).

### TFG — series (no feed: the user supplies everything)
For **each** event: title · date (day + short month, e.g. 12 / "AUG") ·
weekday + time · format/location · registration or info URL
(display-ready). Plus: aspect, and optionally a program label for kickers
(e.g. "TFG WORKSHOP") and a music bed / photos (`motion_add_asset`).

### TFG — single event
Same per-event fields for the one event, plus 2–4 concrete deliverables
for a list scene, an optional stat for a proof beat ($70M+ SBIR/STTR is
the house number), an optional quote + attribution, and the CTA
(default `techfuturesgroup.org`).

## Workflow (both brands)

1. Read `motion_guide`. SBDC only: verify `REBRANDLY_API_KEY` + site, then
   `events_upcoming`.
2. `motion_create_project` with the aspect (project names are permanent —
   pick `<brand>-<thing>-<mmmyyyy>` style; reworking an existing name
   needs `motion_set_scenes`, not create).
3. `motion_set_scenes` with a recipe below.
4. SBDC only: `shortlink_map { name }` **before the first preview** — no
   raw registration URL may ever appear on a card. Then **verify every
   minted link**: fetch `https://sbdc.events/<slug>`, follow redirects,
   and check the destination page title matches the event. Report a
   before/after table.
5. `motion_preview` → inspect **every** frame image. Check the wrap rules
   below; fix with `motion_update_scene`, re-preview only changed scenes
   (`times_ms`), repeat until clean.
6. `motion_export` → send the MP4 (and final frames) to the user.

## Storyboard recipes

Durations: statement 2500–3000 · title 3500–4000 · calendar 3500 ·
list 4500–5500 · stat 3500 · quote 4500–5000 · endcard 3500.

### SBDC series (~20–25s): title → cards → agenda → endcard
1. `title`, navy — kicker `"THIS MONTH | FREE TRAININGS"`, sentence-case
   title, `attribution: "norcalsbdc.org/events"` (renders as the footer).
2. One `calendar` per event — pass each `suggestedScene` through
   unchanged except scheme (see the 1d rule below). Transition `wipe`.
3. The returned `agendaScene` (`list`) as the recap — `paper` gives the
   light rhythm beat (3c has the footer url; cream 3b works too).
4. `endcard`, navy (+ `backdrop: "dot-grid"`), kicker `"REGISTER TODAY"`,
   title `"norcalsbdc.org/events"`, attribution tagline, SBA line in
   subtitle.

### SBDC single (~20–25s): hook → card → takeaways → endcard
1. `statement`, navy, serif + mask-reveal — the hook (what the training
   unlocks, not the title).
2. `calendar` 1d (navy, lower-left) — the save-the-date with the
   `sbdc.events` link in `attribution`.
3. `list`, paper — 3 takeaways, lines ≤ 6 words.
4. Optional `image` presenter card (`imageLayout: "card"`, lower-left).
5. `endcard`, navy — the event's `sbdc.events` link as the big line.

### TFG series (~20–25s)
1. `title`, dark — kicker `"THIS QUARTER | TFG WORKSHOPS"` style.
2. One `calendar` per event (dark/charcoal; date tile via
   `statValue`/`statSuffix`, time in subtitle, URL in subtitle or title
   per guide — keep it short).
3. `list`, charcoal, lower-left — the series as one agenda.
4. `endcard`, dark — animated lockup, title `"techfuturesgroup.org"`,
   kicker `"BOOK A SESSION"`.

### TFG single (~25s): the guide's ad shape
statement (dark, serif hook) → `calendar` or `title` (charcoal,
what/when) → `list` (dark, lower-left, 3 deliverables) → `stat` (green
punch or dark + starburst) → optional `quote` (charcoal, serif) →
`endcard` (dark). One `green` scene max; `weird: true` on 1–3 punch
scenes only.

## Hard-won rules (violating these produced real defects)

- **SBDC 1d footer needs a dark scheme.** The engine picks the calendar
  variant from the background: the 1d editorial-columns card — the ONLY
  calendar variant that renders the link footer — requires a **dark**
  bg (`navy`/`cobalt`) + `align: "lower-left"`. Paper/cream silently
  switch to 1b/1c day sheets and the registration link vanishes. So if
  every card must carry its link (the norm), vary rhythm with
  navy → cobalt → navy and put light beats on the agenda/title scenes
  instead. Never "fix" this with a dark customScheme masquerading as
  paper.
- **shortlink_map before preview, always** (SBDC). Cards must show
  `sbdc.events/slug`, no scheme, never a raw Neoserra/Localist/WordPress
  URL. Links are cached per project — re-running never mints duplicates.
- **Verify the links you mint.** Fetch each `sbdc.events/...`, follow the
  redirect, confirm the destination page title matches the event (event
  sites reuse stale slugs — the Localist URL text proves nothing).
- **Inspect every preview frame at real fonts before exporting.** The
  brand faces (proxima / GT America / Tobias) are tighter than the
  system fallbacks; text that fit in a fallback render can overflow or
  one-word-wrap with the kit loaded. Look for: titles poking past the
  right margin (long single words like "Procurement" can't wrap), 4+
  line one-word-per-line wraps, agenda lines touching the frame edge.
  Fix with `textScale` (0.85–0.9 usually; it scales the whole scene's
  type, keeping proportions) or shorten the title, then re-preview.
- **Fallback-font renders are not final.** If the preview logs a harness
  resource error for `use.typekit.net`, the kit didn't load and the
  frames are stand-ins — fix the network (the servers pass `HTTPS_PROXY`
  through to Chromium) rather than shipping approximate type.
- **Brand separation.** `dot-grid` is SBDC-only; the hero-ring/starburst/
  Pattern-Studio backdrops are TFG-only. No icons/emoji/exclamation marks
  in either brand; ALL-CAPS only in kickers; sentence-case titles.
- **Real data only.** No invented events, dates, stats, or quotes. An
  unreachable feed or missing key is a stop-and-report, not a
  make-something-up.

## Deliverables

Send the user: the preview frames (render inline), the exported MP4
(attach), and — for SBDC — the shortlink before/after report with
verification results. Note the project name so re-edits reuse it.
