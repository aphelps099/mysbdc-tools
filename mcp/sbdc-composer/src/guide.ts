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
- "title" — kicker (small caps label, e.g. "STOCKTON · JUL 7"), title (headline), subtitle.
- "statement" — title only: one big line. Great opener. Pairs well with serifTitle:true + anim "mask-reveal".
- "stat" — animated count-up number: statPrefix ("$"), statValue (474), statSuffix ("M"), attribution (label under the number).
- "list" — kicker + body (newline-separated lines, 3–4 max, each ≤ 6 words). Staggered agenda reveal.
- "quote" — title (the quote, no quotation marks — they're added), attribution ("Name — Role"). serifTitle:true looks best.
- "image" — photo scene (imageId of a registered asset), kicker/title/subtitle + kenBurns. imageLayout "full" (default) covers the frame with an overlay; "card" places the photo in an inset portrait frame on the scheme background with text below — the presenter-card look (pair with align lower-left).
- "video" — uploaded clip background (videoId), text overlay optional.
- "disclaimer" — kicker + body fine print (the SBA cooperative-agreement line).
- "endcard" — closing card: the OFFICIAL NorCal SBDC lockup (white on
  dark schemes, color on light — automatic); title = URL/CTA
  ("norcalsbdc.org" or an sbdc.events link), kicker = small CTA
  ("REGISTER TODAY"), subtitle = SBA fine print. Always end with one.

## Common scene fields
- duration (ms): 2500–5000 typical. statement ~2500–3000, title ~3500–4000, list 4500–5500, stat ~3500, quote ~4500–5000, endcard ~3500.
- sbdcScheme: "navy" (#0f1c2d bg, pool kicker — the default), "paper" (#fdfdfd), "cream" (#f5f1e8), "cobalt" (#1b5faf bg, pool-pale kicker), "pool" (pool-pale bg, cobalt kicker). Rhythm: mostly navy/paper, one cobalt hit, maybe a cream/pool beat. Berry #c23c3c is accent-only in the brand — never a background.
- anim (text entrance): "rise", "word-stagger", "letter-cascade", "typewriter", "wipe", "blur-in", "scale-in", "mask-reveal". SBDC motion is restrained — favor "rise", "mask-reveal", and "wipe"; no bouncy combinations.
- transition (INTO the scene): "cut", "fade", "wipe", "slide". "fade" default; "cut" for hard beats.
- align: "center", "lower-left", "lower-center", "lower-right". SBDC leans left-aligned — lists/images read best lower-left; center only single-statement scenes.
- backdrop: "none" (the norm) or "dot-grid" (see Graphics above).
- cornerMark: true — the official America's SBDC star sign-off (see Graphics above).
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
- Links are cached per project by long URL — re-running never mints duplicates.
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
