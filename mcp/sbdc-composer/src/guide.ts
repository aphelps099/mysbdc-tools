/* Authoring guide returned by the motion_guide tool — everything an LLM
   needs to write good SBDC scene JSON without reading the engine source. */

export const GUIDE = `# SBDC Motion Composer — authoring guide

You are writing scenes for a deterministic canvas motion-graphics engine
(the same one behind tools.norcalsbdc.org/motion/pro). A project holds one
MotionDoc: an ordered list of scenes played back-to-back, plus document
settings. Everything renders exactly the same in preview and export.

## Workflow
1. motion_create_project — start a project (pick the aspect for the platform).
2. motion_set_scenes — write the storyboard (5–9 scenes for a ~20–35s promo).
3. shortlink_map — ALWAYS run before previewing a storyboard that mentions a
   registration/training URL. Never let a raw Neoserra/Localist/Zoom URL reach
   a card: the mapper creates (or reuses) an sbdc.events shortlink and rewrites
   the text to "sbdc.events/slug". Cards display that short form, no "https://".
4. motion_preview — look at the PNG frames; iterate with motion_update_scene.
5. motion_export — produce the H.264 MP4.

## Chat with the calendar — the next-N-trainings video
events_upcoming { limit: 5 } reads the live norcalsbdc.org events calendar
and returns the next trainings, soonest first — each with a ready-made
suggestedScene (the 1d save-the-date card, registration URL in the
footer), plus one agendaScene covering the whole set. The whole flow:
1. events_upcoming { limit: 5 }
2. motion_create_project (aspect "4:5" for feed, "9:16" for Stories)
3. motion_set_scenes — a title scene, then either the five
   suggestedScenes (one card per training) or the single agendaScene
   (or both: agenda as the overview, cards for the top 2–3), then an
   endcard. Vary schemes for rhythm: navy → paper → navy.
4. shortlink_map — turns each card's registration URL into sbdc.events/slug.
5. motion_preview → motion_export.

## Aspects
"16:9" 1920×1080 (YouTube/slides) · "9:16" 1080×1920 (Reels/Stories/TikTok)
· "1:1" 1080×1080 (feed) · "4:5" 1080×1350 (IG/LinkedIn feed).
LinkedIn: feed video reads best at 4:5 (1:1 also safe); 9:16 gets cropped
in-feed — reserve it for other platforms' Stories/Reels.

## Graphics — the four approved elements, nothing else
SBDC scenes are FLAT COLOR. Exactly four graphic elements are approved,
all official assets or the one website motif — no other shapes, arcs,
waves, stars, or textures, ever:
1. America's SBDC star (official raster, never redrawn) — scene
   cornerMark: true puts it small and static in the upper-right. Dark
   (navy/cobalt) and photo scenes only; it is a white mark and is
   skipped automatically on light schemes. Use on 1–2 scenes, not all.
2. White NorCal SBDC lockup — endcards pick it automatically on
   navy/cobalt schemes.
3. Color NorCal SBDC lockup — endcards pick it automatically on
   paper/cream/pool schemes.
4. backdrop "dot-grid" — the website's halftone motif: small circular
   dots on a regular grid, corner-anchored, low contrast, never behind
   text. The engine tints it pool-ish on light schemes and navy-soft on
   navy. This is the ONLY backdrop; everything else stays "none".

## Scene templates and the fields each uses
Docs here default to sceneStyle "editorial" — the SBDC event-card design
system. Title / agenda / calendar / endcard scenes render the handoff's
card designs; the SCHEME picks the variant. Kickers may carry a
right-hand label after "|" ("THIS MONTH | FREE TRAININGS").

- "title" — variants: navy → 2a editorial (kicker pair top, berry rule +
  big serif title + subtitle low, logo/url footer — attribution is the
  footer url) · navy + backdrop "dot-grid" → 2c (dot patch corner, big
  title, rule + subtitle row, no footer) · cream/paper → 2b centered
  (logo top, kicker/title/rule/subtitle centered, attribution as the
  small caps bottom label).
- "calendar" — the save-the-date card, one scene per training:
  statValue = day-of-month, statSuffix = month ("AUG"), kicker = center
  name, title = event title, subtitle = "Tuesday · 10:00 AM–12:00 PM ·
  Online". Variants: navy → 1a day sheet (huge day number) · navy +
  align "lower-left" → 1d editorial columns (shows attribution as the
  footer url — the default from events_upcoming; put the registration
  URL there and let shortlink_map shorten it) · paper → 1b day sheet
  with navy header band · cream → 1c split with navy band.
- "list" (agenda) — the next-N-trainings card, N ≤ 5. body lines are
  structured: "12 AUG | Marketing bootcamp | Tue · 10:00 AM · Online".
  title = header ("Upcoming free trainings"), subtitle = footer-left
  note ("All online · No fee"), attribution = footer url. Variants:
  navy → 3a list · cream → 3b numbered · paper → 3c navy header + sheet
  with pool-pale date tiles. events_upcoming returns a ready agendaScene.
- "endcard" — variants: navy → 4a centered (official lockup top, kicker
  CTA, title = the big url line, attribution = tagline "Confidential
  business advising. No fee.", subtitle = SBA fine print) · cobalt → 4b
  (title = big CTA line "Register today", attribution = underlined url,
  subtitle = SBA note footer) · cream/paper → 4c tagline (title = the
  big line, last word set in cobalt; attribution = "Register today ·
  norcalsbdc.org/events"). Always end with one.
- "statement" — title only: one big line. Great opener. Pairs well with serifTitle:true + anim "mask-reveal". (Classic renderer.)
- "stat" — animated count-up number: statPrefix ("$"), statValue (474), statSuffix ("M"), attribution (label under the number). (Classic renderer.)
- "quote" — title (the quote, no quotation marks — they're added), attribution ("Name — Role"). serifTitle:true looks best. (Classic renderer.)
- "image" — photo scene (imageId of a registered asset), kicker/title/subtitle + kenBurns. imageLayout "full" (default) covers the frame with an overlay; "card" places the photo in an inset portrait frame on the scheme background with text below (pair with align lower-left). Photo scenes always render classic.
- "video" — uploaded clip background (videoId), text overlay optional.
- "disclaimer" — kicker + body fine print (the SBA cooperative-agreement line).

## Common scene fields
- duration (ms): 2500–5000 typical. statement ~2500–3000, title ~3500–4000, list 4500–5500, stat ~3500, quote ~4500–5000, endcard ~3500.
- sbdcScheme: "navy" (#0f1c2d bg, pool kicker — the default), "paper" (#fdfdfd), "cream" (#f5f1e8), "cobalt" (#1b5faf bg, pool-pale kicker), "pool" (pool-pale bg, cobalt kicker). Rhythm: mostly navy/paper, one cobalt hit, maybe a cream/pool beat. Berry #c23c3c is accent-only in the brand — never a background.
- anim (text entrance): "rise", "word-stagger", "letter-cascade", "typewriter", "wipe", "blur-in", "scale-in", "mask-reveal". SBDC motion is restrained — favor "rise", "mask-reveal", and "wipe"; no bouncy combinations.
- transition (INTO the scene): "cut", "fade", "wipe", "slide". "fade" default; "cut" for hard beats.
- align: "center", "lower-left", "lower-center", "lower-right". SBDC leans left-aligned — lists/images read best lower-left; center only single-statement scenes.
- backdrop: "none" (the norm) or "dot-grid" (see Graphics above).
- cornerMark: true — the official America's SBDC star sign-off (see Graphics above).
- accentRule (calendar only): hex color of the rule under the title —
  preset to the design-system berry #c23c3c; leave it alone. Berry stays
  a rule color, never a background.
- serifTitle: true → proxima-sera for the main line (statements/quotes);
  false → proxima-nova. The serif is the display voice — use it on the hook
  and the quote, not everywhere.
- textScale: 0.3–1 — shrink long titles to fit (rarely needed once
  shortlink_map has shortened the URLs).
- Image scenes: kenBurns "zoom-in"|"zoom-out"|"pan-left"|"pan-right"|"none";
  overlay "scrim"|"gradient-bottom"|"gradient-left"|"gradient-right"|"brand" +
  overlayOpacity 0–1 (~0.55–0.7). Overlays render in dark navy, never black.

## Don'ts
- No icons or emoji anywhere in scenes — the brand has no icon set; use
  typographic labels and numbers.
- No gradients except navy photo scrims.
- No invented shapes, arcs, waves, or star drawings — the brand marks are
  official raster assets only.
- No exclamation marks; sentence case titles; ALL-CAPS only in kickers.

## Shortlinks (the Rebrandly layer)
- shortlink_map { name } — scans every scene's title/subtitle/body/attribution
  for http(s) URLs longer than ~30 chars, creates or reuses sbdc.events links,
  rewrites the text in place, and returns a before/after report. Run it before
  the first preview of any storyboard that carries a registration URL.
- shortlink_create { name, url, title, slug? } — mint (or fetch the cached)
  link for one URL when you want the slug on a specific card yourself.
- shortlink_clicks { name } — click counts for the project's links.
- Slashtags are COMPACT by design: auto-slugs cap at ~22 chars on a word
  boundary ("stockton-probiz", not "stockton-probiz-procurement-summit") —
  the link is display typography on the card, so shorter is better. Pass an
  explicit slug to shortlink_create when you want a specific short form.
- Links are cached per project by long URL — re-running never mints duplicates.
  Promoting the same event in a NEW project? Copy its cache entry from the
  old project's projects/<name>.json into the new one before shortlink_map —
  otherwise the taken slashtag gets a "-2" suffix duplicate.
- No REBRANDLY_API_KEY in the environment? Everything still works: the tools
  return a warning and leave text unchanged, so previews/exports never block.

## Document settings (motion_update_doc)
aspect, fps (30), watermark (small corner text), showGrain (subtle film
grain, default true), fontHeading ("proxima-sera"), fontBody
("proxima-nova"), and music: audioVolume 0–1, audioFadeIn/audioFadeOut (ms).
Fonts note: the headless renderer loads the Adobe kit when the network
allows; otherwise it falls back to system serif/sans stand-ins (Georgia/
Arial-class). Font files are NOT shipped locally — Adobe EULA allows kit
delivery only — so treat exact letterforms on air-gapped renders as
approximate and re-export where the kit can load if type fidelity matters.

## Assets (motion_add_asset)
Register local files by absolute path: kind "image" (photo scenes), "video"
(clip scenes), "music" (background bed — becomes the doc's audio
automatically). Reference them from scenes via imageId/videoId. No assets
are required — typographic cards in flat scheme colors are the SBDC house
style. The official lockups and star are built in (vendored or fetched
from the official URLs and cached); scenes never draw approximations.

## SBDC voice
NorCal SBDC: no-cost advising and training for small businesses across
Northern California, funded in part through a cooperative agreement with
the U.S. SBA. Plain, direct, second person. Sentence case for titles
("Turn your idea into a business") — ALL-CAPS only in kickers. No emoji,
no icons, no exclamation marks. Real numbers when possible ($474M in
capital accessed). CTA: norcalsbdc.org or the event's sbdc.events link.

## A good 25s vertical promo shape
1. statement (navy, mask-reveal, serif, cornerMark) — the hook
2. title (paper) — what/when (kicker carries city + date)
3. list (navy, lower-left) — 3 concrete takeaways
4. stat (cobalt) — the proof
5. quote (cream, serif) — social proof
6. endcard (navy, dot-grid) — official lockup + sbdc.events link
`;
