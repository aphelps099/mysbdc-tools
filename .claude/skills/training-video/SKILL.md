---
name: training-video
description: Produce a finished, brand-perfect SBDC training/event promo video (MP4) end-to-end with the sbdc-motion-composer MCP server — save-the-date, single-event promo, or next-N-trainings reel, for LinkedIn/Instagram/Stories. Use whenever the user asks for a training video, event video, promo video, save-the-date, event reel, or an MP4 promoting SBDC trainings or events. Covers the full pipeline — live calendar feed, storyboard, sbdc.events shortlinks, font-verified preview, H.264 export — and the desktop (Claude Cowork) checks that keep local renders correct.
user_invocable: true
---

# Training Video — the SBDC promo generator

Build a finished MP4 promoting SBDC trainings with the
`sbdc-motion-composer` MCP tools (registered in `.mcp.json`; the
SessionStart hook installs deps and builds the servers on first run).
This skill is the operating procedure; the server's `motion_guide` is the
authority on scene templates, schemes, and brand voice — **read it first,
every session.**

For TFG-brand videos use the `event-promo-video` skill instead
(tfg-motion-studio has no calendar feed and no shortlinks).

## Pre-flight (do these before promising anything)

1. **Read `motion_guide`.**
2. **Rebrandly key** — call `shortlink_map` on a throwaway or check env:
   without `REBRANDLY_API_KEY` the tools warn and leave URLs unchanged.
   Locally the server also reads the repo's `.env.local` / `.env`, so the
   key belongs there (see `docs/cowork-local-setup.md`).
3. **Feed reachable** — `events_upcoming { limit: 3 }` should return real
   events from norcalsbdc.org. If it fails, stop and report; **never
   invent events, dates, or URLs.**
4. **Date sanity** — compare each event's date to today. If the event is
   today or past, say so and ask whether to reframe the CTA
   ("Happening today · walk-ins welcome") or pick a future event.

## Inputs to collect

- Which event(s): a norcalsbdc.org event URL/slug, a title to match in
  `events_upcoming` (fetch with a generous limit), or "next N trainings".
- Platform → aspect: `4:5` LinkedIn/IG feed (default for LinkedIn),
  `1:1` feed, `9:16` Stories/Reels, `16:9` YouTube/slides.
- Optional: 2–4 takeaway bullets, a speaker photo (`motion_add_asset`),
  a music bed.
- If an event isn't in the feed: title, date, time, center, format, and
  the registration URL — then mint the link with `shortlink_create`.

For richer facts than the feed carries (venue, agenda, "lunch included"),
fetch the event's detail page and use what it actually says.

## Workflow

1. `motion_create_project` — aspect per platform. Names are permanent;
   use `<event>-<purpose>` style (`stockton-procurement-promo`). To
   rework an existing project use `motion_set_scenes`, never re-create.
2. `motion_set_scenes` — recipes below.
3. `shortlink_map` — **always before the first preview.** Cards must
   show `sbdc.events/slug` (no scheme). Slug tails are hard-capped at
   20 characters (`stockton-probiz`, never
   `stockton-probiz-procurement-summit-2`). If a slug still reads long
   or ugly, re-mint with an explicit short `slug` via `shortlink_create`.
4. **Verify every minted link**: fetch `https://sbdc.events/<slug>`,
   follow redirects, confirm the destination matches the event.
5. `motion_preview` — inspect **every frame**, checklist below. Fix with
   `motion_update_scene`, re-preview changed scenes via `times_ms`.
6. `motion_export` → deliver the MP4 + final frames, note the project
   name for re-edits, and offer the shortlink click report
   (`shortlink_clicks`).

## Storyboard recipes

Durations: statement 2500–3000 · title 3500–4000 · calendar 3500–4000 ·
list 4500–5500 · stat 3500 · quote 4500–5000 · endcard 3500.

**Single event (~15–25s)** — the shape that shipped for Stockton:
1. `statement`, navy, serif + mask-reveal, `cornerMark: true` — the hook
   (what the training unlocks, not the event title).
2. `calendar`, navy, `align: "lower-left"` (the 1d editorial-columns
   card) — date tile, title, `subtitle` "Weekday · time · venue",
   registration URL in `attribution`. Long titles auto-fit (≤3 lines);
   long venue names still read better shortened ("Robert Cabral Ag
   Center").
3. `list`, navy — either 3 takeaways, or a **day agenda** with
   time-first lines (`"9:00 AM | Registration and breakfast"`) which
   render as a two-column schedule: big serif time left, description
   right. Put "FREE · LUNCH INCLUDED"-type facts in the kicker's right
   label.
4. Optional `stat` (cobalt) or `quote` (cream, serif) beat.
5. `endcard`, cobalt or navy — "Register today", the sbdc.events link,
   SBA line in `subtitle`.

**Series / next-N trainings (~20–25s)**:
1. `title`, navy — kicker `"THIS MONTH | FREE TRAININGS"`.
2. One `calendar` per event — pass each `suggestedScene` from
   `events_upcoming` through (they're pre-formatted for the 1d card).
3. The returned `agendaScene` (`list`) as the recap.
4. `endcard`, navy + `dot-grid` — `"norcalsbdc.org/events"`.

## Preview checklist (every frame, every time)

- **Fonts are real.** Titles must be Proxima Sera (modern, low-contrast
  serif), kickers Proxima Nova. If the serif looks like Georgia/Times or
  the harness logged an error for `use.typekit.net`, the Adobe kit
  didn't load — the render is a stand-in, not a deliverable. Fix the
  network and re-render; never ship fallback type.
- **URLs are short** — `sbdc.events/<tail ≤20 chars>`, no `https://`,
  no raw registration URLs anywhere.
- **No cramped text** — titles ≤3 lines, nothing touching the frame
  edge, no one-word-per-line wraps, no line opening with a dangling "·".
  Fix with shorter copy or `textScale` 0.85–0.9.
- **Brand marks present** — footer lockup on editorial cards, star
  `cornerMark` on 1–2 dark scenes only.
- **Voice** — sentence-case titles, ALL-CAPS only in kickers, no
  emoji/icons/exclamation marks, real numbers only.

## Hard-won rules

- **1d calendar needs a dark scheme.** Only navy/cobalt +
  `align: "lower-left"` renders the link footer; paper/cream silently
  switch variants and the registration link vanishes. Vary rhythm on the
  agenda/title scenes instead.
- **Day-agenda lines on light schemes:** the paper (3c) list expects
  calendar dates in its tiles — time-first day agendas belong on navy
  (3a), where they get the two-column treatment.
- **Same event, new project → seed the shortlink cache** from the old
  project's `projects/<name>.json` before `shortlink_map`, or the taken
  slashtag mints an ugly `-2` duplicate. If a duplicate slips through,
  reuse the original link and delete the dup in Rebrandly.
- **After pulling renderer/composer changes: rebuild and restart.**
  `cd mcp/sbdc-composer && npm run build`, then restart the Cowork/Claude
  session — MCP servers keep the old bundle in memory, and a stale
  server produces stale renders (wrong fonts, old layouts) while looking
  perfectly healthy.
- **Real data only.** Unreachable feed, missing key, event not found —
  stop and report. No placeholder events, stats, or quotes.

## Deliverables

Attach the MP4, render the final frames inline, report the shortlink
before/after (with verification), name the project for future re-edits,
and flag anything the user should decide (event date today/past, venue
name shortened, copy trade-offs).
