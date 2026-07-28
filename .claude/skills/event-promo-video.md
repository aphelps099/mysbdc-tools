---
name: event-promo-video
description: The complete "promo video for our next training" pipeline — build a finished MP4 with the sbdc-motion-composer MCP tools, mint a COMPACT verified sbdc.events shortlink, publish a public preview page with social blurbs at tools.norcalsbdc.org/previews/, and draft the marketing handoff email. Triggers on ANY request for an event/training promo video — "I need a promo video for our next training", "make a save-the-date video", "promote [event]", a "set of 3" series reel, or a TFG event ad (tfg-motion-studio). Runs end-to-end with zero questions when the request is the simple one-liner.
user_invocable: true
---

# Event Promo Video — the repeatable pipeline

**The one-liner this skill exists for:** *"I need a promo video for our
next training."* On that prompt (or any variant naming no specifics),
run the FULL SBDC single-event pipeline below with these defaults and
**ask nothing**: next event = `events_upcoming { limit: 1 }`, aspect
1:1, single-event recipe, compact shortlink, preview page, email draft.
If the user names an event, count ("next 3"), aspect, or brand (TFG),
those override the matching default; everything else stays automatic.

**The fixed deliverable set** (report all four at the end, with links):
1. A verified **`sbdc.events/<compact-slug>`** shortlink
2. The final **1:1 MP4** (sent as a file)
3. The **preview page URL** on tools.norcalsbdc.org/previews/ — live and
   verified, carrying the video, download button, and social blurbs
4. A **Gmail draft** (never auto-sent) to the marketing team

This pipeline is *verified-or-reported*: every stage has an acceptance
gate that is CHECKED, not assumed. Success claims without their check
are bugs. If a gate can't pass because an external service is down, stop
and report exactly what's blocked and the scripted recovery — never ship
unverified output and never invent data.

## Servers & surfaces

- **SBDC** → `sbdc-motion-composer` MCP tools (calendar feed +
  Rebrandly). **TFG** → `tfg-motion-studio` (no feed, no shortlinks —
  user supplies event facts and a display-ready URL).
- Works in any surface with this repo attached: **Claude Code (web/CLI)**
  and **Cowork**. Plain claude.ai chat cannot run it (the servers are
  local to the repo). In every case the trigger is the same plain-English
  prompt; the SessionStart hook builds the servers automatically.
- Always read the server's `motion_guide` first — it is the authority on
  templates, schemes, and voice.

## Stage 0 — Pre-flight (gate: hard stop, no placeholders)

1. `REBRANDLY_API_KEY` present in env (`REBRANDLY_DOMAIN` optional,
   default sbdc.events).
2. `https://www.norcalsbdc.org` returns 200.

Either failing → STOP and report what's missing. Never fabricate events,
dates, links, or stats — a stopped run is correct; an invented one is not.

## Stage 1 — Event data (gate: real facts only)

- Series: `events_upcoming { limit: N }` (each event ships a ready
  `suggestedScene`; the set ships one `agendaScene`).
- Single: `events_upcoming { limit: 1 }` (or match the user's named
  event against a larger limit / their URL). **Also fetch the event's
  detail page** and pull the real venue, city, and agenda rows — they
  feed the subtitle, the agenda scene, and the blurbs.
- TFG: collect per-event title, date, weekday+time, format/location,
  display-ready URL from the user.

## Stage 2 — Storyboard

Project name `<slug>-<mmmYY>` style; names are permanent (rework an
existing project with `motion_set_scenes`, never re-create).

- **Single (~15–20s):** statement hook (navy, serif, mask-reveal,
  cornerMark) → calendar 1d (navy, lower-left, `textScale: 0.9`) →
  agenda list (cream 3b, rows `"topic | time"`) → endcard (navy,
  dot-grid).
- **Series (~20–25s):** title 2a (navy) → one calendar 1d per event
  (dark schemes ONLY — navy → cobalt → navy) → agendaScene (paper) →
  endcard (navy, dot-grid).
- Durations: statement 2800 · calendar 3500 · list 4500–5000 ·
  endcard 3500. TFG recipes: see `tfg-motion-studio`'s motion_guide.

**Non-negotiable renderer facts** (violating these produced real defects):
- The 1d calendar layout — the ONLY one with the link footer — requires
  a DARK scheme + `align: "lower-left"`. Paper/cream silently switch to
  footerless day sheets. Light "rhythm" beats belong on the agenda/title
  scenes, never on cards that must carry the link.
- Sentence-case titles, ALL-CAPS only in kickers, no emoji/icons/
  exclamation marks, `dot-grid` is SBDC-only.

## Stage 3 — Shortlink (gate: compact + verified, IMPORTANT)

1. Run `shortlink_map { name }` BEFORE the first preview. No raw
   Neoserra/Localist/WordPress URL may ever appear on a card — cards
   show `sbdc.events/slug`, no scheme.
2. **Compactness is required, not cosmetic.** Auto-slugs cap at ~22
   chars on a word boundary (`stockton-probiz`). If a minted slug reads
   long anyway, re-mint with an explicit short `slug` via
   `shortlink_create` and update the scenes.
3. **Same event, new project → seed the cache first**: copy the event's
   entry from the old project's `projects/<name>.json` `shortlinks` map
   into the new project file, then map (expect `reusedCache: true`).
   Skipping this mints an ugly `-2` duplicate on the taken slashtag.
4. **VERIFY every link**: fetch `https://sbdc.events/<slug>` following
   redirects; require HTTP 200 AND the destination page `<title>`
   matches the event (event sites recycle stale slugs — URL text proves
   nothing). Include a before/after link table in the final report.

## Stage 4 — Preview frames (gate: eyes on every frame, real fonts)

1. `motion_preview` and **inspect every frame image**.
2. If the harness logged a `use.typekit.net` resource error, fonts fell
   back to stand-ins — the frames are NOT final. The browser launch must
   pass `HTTPS_PROXY` through (already in `browser.ts`); fix the network
   rather than shipping approximate type.
3. Wrap checks (brand fonts are tighter than fallbacks): titles poking
   past the right margin (long words can't wrap), one-word-per-line
   wraps, footer text colliding with the link. Fix with `textScale`
   0.85–0.9 or shorter copy, re-preview ONLY changed scenes
   (`times_ms`), repeat until clean.

## Stage 5 — Export (gate: codec + duration)

`motion_export` → H.264 MP4 (the server transcodes automatically).
Confirm the reported duration matches the storyboard total. Send the MP4
and the final frames to the user.

## Stage 6 — Publish the preview page (gate: live 200, not "pushed")

1. Drop three files in `public/previews/`: `<slug>.html` (copy the
   structure of `stockton-probiz.html` — player + poster, Download MP4
   button, event facts, registration button, **newsletter blurb and
   social blurb in copy-paste panels**, SBA line), `<slug>.mp4`,
   `<slug>-poster.png` (the save-the-date frame). The `previews/*`
   middleware exemption already exists — no code changes needed.
2. Blurbs are written from Stage 1's real facts and always end with the
   sbdc.events link. Voice: plain, second person, no exclamation marks.
3. Commit and push. The page is live only after merge + Railway deploy:
   **poll `https://tools.norcalsbdc.org/previews/<slug>.html` until it
   returns 200** (background poll, ~10 min budget) and only then report
   it as live. Known platform hiccups and fixes: deployment queued on
   "upstream GitHub issues" → it starts by itself, keep polling;
   orchestrator errors (ListRegions / region rejected) → redeploy or an
   empty commit to main retriggers; still down → report, don't claim.

## Stage 7 — Email draft (gate: draft only, after the page is live)

Gmail `create_draft` — NEVER send: to `emily@norcalsbdc.org` +
`training@norcalsbdc.org`, subject `video for training promotion`, body:
preview-page link, registration shortlink, social blurb, newsletter
blurb, full event-page URL. Create it after the live-200 gate (or state
plainly that the link goes live on merge).

## Final report (the contract)

One message containing: ① the link table (long → short, verified ✅),
② the MP4 attached with specs, ③ the live preview URL, ④ the draft's
recipients/subject, ⑤ anything that deviated and why. If any gate
failed, the report says which, what was tried, and what's needed —
never a silent partial success.

## Why this is repeatable (read once, then trust the gates)

The renderer is deterministic — same storyboard in, same pixels out —
and every input that ISN'T deterministic (live calendar, Rebrandly,
fonts, Railway) sits behind a gate above with a scripted recovery
learned from real failures. The skill guarantees "verified or clearly
reported", which is the only honest guarantee an automated pipeline can
make. Costs ~10 minutes end to end.
