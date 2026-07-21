/* Authoring guide returned by the motion_guide tool — everything an LLM
   needs to write good TFG scene JSON without reading the engine source. */

export const GUIDE = `# TFG Motion Studio — authoring guide

You are writing scenes for a deterministic canvas motion-graphics engine
(the same one behind /motion/tfg). A project holds one MotionDoc: an
ordered list of scenes played back-to-back, plus document settings.
Everything renders exactly the same in preview and export.

## Workflow
1. motion_create_project — start a project (pick the aspect for the platform).
2. motion_set_scenes — write the storyboard (5–9 scenes for a ~20–35s ad).
3. motion_preview — look at the PNG frames; iterate with motion_update_scene.
4. motion_export — produce the MP4.

## Aspects
"16:9" 1920×1080 (YouTube/slides) · "9:16" 1080×1920 (Reels/Stories/TikTok)
· "1:1" 1080×1080 (feed) · "4:5" 1080×1350 (IG feed).

## Scene templates and the fields each uses
- "title" — kicker (small caps label), title (headline), subtitle.
- "statement" — title only: one big line. Great opener/beat. Pairs well with serifTitle:true + anim "mask-reveal".
- "stat" — animated count-up number: statPrefix ("$"), statValue (70), statSuffix ("M+"), attribution (label under the number).
- "list" — kicker + body (newline-separated lines, 3–4 max, each ≤ 6 words). Staggered agenda reveal.
- "quote" — title (the quote, no quotation marks — they're added), attribution ("Name — Role"). serifTitle:true looks best.
- "image" — full-bleed photo (imageId of a registered asset) with text overlay: kicker/title/subtitle + kenBurns + overlay.
- "video" — uploaded clip background (videoId), text overlay optional.
- "disclaimer" — kicker + body fine print.
- "endcard" — closing card: TFG logo renders automatically; title = URL/CTA ("techfuturesgroup.org"), kicker = small CTA ("BOOK A SESSION"), subtitle = fine print. Always end with one.

## Common scene fields
- duration (ms): 2500–5000 typical. statement ~2500–3000, title ~3500–4000, list 4500–5500, stat ~3500, quote ~4500–5000, endcard ~3500.
- tfgScheme: "dark" (#0a0a0a bg, electric-green accent — the default), "charcoal", "green" (electric green bg, black text — use for ONE punch scene), "cream", "white". Vary schemes for rhythm: mostly dark/charcoal, one green hit, maybe a cream/white beat.
- anim (text entrance): "rise", "word-stagger", "letter-cascade", "typewriter", "wipe", "blur-in", "scale-in", "mask-reveal".
- transition (INTO the scene): "cut", "fade", "wipe", "slide". "fade" default; "cut" for hard beats.
- align: "center", "lower-left", "lower-center", "lower-right". Lists/images often read best lower-left.
- backdrop (behind text, scheme colors, only when no image/video): "none", "grid", "starburst" (hero stat), "ring", "arc" — the website-hero set: "hero-ring" (the techfuturesgroup.org thick sage gradient ring, sweeps in on scene start — dark schemes), "star" (fine 24-ray starburst, slow rotation — subtle, great behind stats), "hero" (faint grid + star + ring: the full site hero look) — split compositions: "split-left" / "split-right" / "split-bottom" (hard accent-color block wipes in and holds ~45% of the frame; pair with align lower-right / lower-left so text sits on the base half; weird mode slashes the edge diagonal) — plus the Pattern Studio set: "spirograph" (orbiting rings), "escher" (rotating triangle lattice), "dot-wave" (breathing dot field), "wave-field" (drifting sine lines), "growth-bars" (up-and-right bar chart), "rounds" (concentric ripples), "tfg-type" (drifting TFG wordmark rows).
- weird: true — Pattern Studio "weird" mode: roughly doubles backdrop opacity, triples its motion, adds a slow wobble, and auto-picks a pattern when backdrop is unset. Use on 1–3 punch scenes for rhythm; a whole video of weird slides loses the punch.
- serifTitle: true → Tobias serif for the main line (statements/quotes); false → GT America Extended.
- textScale: 0.3–1 — shrink long URLs/titles to fit.
- Image scenes: kenBurns "zoom-in"|"zoom-out"|"pan-left"|"pan-right"|"none"; overlay "scrim"|"gradient-bottom"|"gradient-left"|"gradient-right"|"brand" + overlayOpacity 0–1 (~0.55–0.7) for text legibility.

## Document settings (motion_update_doc)
aspect, fps (30), watermark (small corner text), showGrain (subtle film
grain, default true), fontHeading ("Tobias"), fontBody ("GT America
Extended"), and music: audioVolume 0–1, audioFadeIn/audioFadeOut (ms).

## Assets (motion_add_asset)
Register local files by absolute path: kind "image" (photo scenes),
"video" (clip scenes), "music" (background bed — becomes the doc's
audio automatically). Reference them from scenes via imageId/videoId
using the id you registered. No assets are required — pure typographic
ads work great and are the TFG house style.

## TFG voice
Tech Futures Group: no-cost specialist advising for tech startups in
Northern California (a specialty program of the NorCal SBDC network).
Confident, founder-to-founder, concrete. Short lines. Real numbers when
possible ($70M+ in SBIR/STTR and grant funding secured by clients).
CTA: techfuturesgroup.org.

## A good 25s vertical ad shape
1. statement (dark, mask-reveal, serif) — the hook
2. title (charcoal) — what/when
3. list (dark, lower-left) — 3 concrete deliverables
4. stat (green or dark + starburst) — the proof
5. quote (charcoal, serif) — social proof
6. endcard (dark) — logo + techfuturesgroup.org
`;
