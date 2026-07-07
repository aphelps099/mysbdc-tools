# ZFIT Motion — Zeb's Fitness Training Video Editor

**Route:** `/motion/zebs` · **Component:** `src/components/motion/ZebsMotionStudio.tsx`

The video editor for Zeb's Platinum Fitness "10-Minute Series" training modules.
Zeb films the exercise content; you upload it here, wrap it in the on-brand series
package, and export a finished MP4 — all in the browser, no video backend.

Built on the shared Motion Studio engine (`src/lib/motion/*`) that also powers
`/motion`, `/motion/pro`, and `/motion/tfg`, with these additions:

## What's new in the engine (brand-free, shared)

| Feature | Where |
|---|---|
| **Video scene template** — uploaded clip cover-fit behind text overlays | `types.ts` (`video` template + `videoId`/`videoTrimStart`/`videoMuted`/`videoVolume`), `render.ts` (`drawVideoCover`) |
| **Disclaimer template** — kicker + fine-print paragraph | `types.ts`, `render.ts` (`drawDisclaimerScene`) |
| **Lower-right alignment** + right-aligned text/kickers everywhere | `types.ts`, `render.ts` |
| **Gradient → (right) overlay** for text legibility over footage | `types.ts`, `render.ts` (`drawOverlay`) |
| **Background music bed** — doc-level `audioId`, `audioVolume`, `audioFadeIn`, `audioFadeOut` | `types.ts` |
| **Audio engine** — decode uploads, offline mixdown (music envelope + per-video-scene clip audio) | `audio.ts` (new) |
| **MP4 export with sound** — frame-exact video seeking + AAC (Opus fallback) track muxed via mp4-muxer | `export.ts` |

Determinism is preserved: `renderFrame(doc, t)` stays a pure function of time.
For video scenes the exporter *seeks* each clip to the exact source frame before
rendering every output frame (`syncVideosForFrame`), so the MP4 matches the
preview. The preview loop keeps the clip's `<video>` element in step with the
playhead (`syncMedia` in the studio) and plays clip audio + the music bed live —
`musicGainAt()` is the single fade curve used by both the preview and the export
mix, so what you hear is what ships.

## The ZFIT editor

- **Brand baked in:** black `#000` / near-black `#0a0a0a` / yellow `#fdea01` /
  gold `#ffcc00` / white schemes; Futura Book + Futura Extra Black self-hosted
  (`public/fonts/Futura-*.ttf`, from the zebs repo brand kit). "X Black" heading
  weight is the default on title-ish scenes.
- **Module Builder wizard:** fill in module #, title, subtitle, circuit lines, and
  the disclaimer → one click seeds the full series skeleton:
  1. ZFIT brand sting (statement + starburst)
  2. Series title ("Zeb's Platinum Fitness · The 10-Minute Series")
  3. Disclaimer (fine print)
  4. Circuit index (numbered agenda)
  5. Module title card (yellow)
  6. **Exercise video scene** (upload Zeb's clip here)
  7. End card (ZFIT wordmark + CTA)
- **Video scenes:** upload MP4/WebM/MOV, pick start-trim, "Match scene length to
  clip", clip audio on/mute + volume, text overlay (kicker/title/subtitle) at
  lower-left / lower-center / lower-right / center with scrim or gradient fades
  (↓ ← →) and adjustable strength. All text uses the animation presets
  (rise, word-stagger, mask-reveal, …).
- **Music:** upload MP3/WAV/M4A — loops under the whole timeline with fade-in and
  fade-out sliders and a volume control.
- **Export:** MP4 (H.264 + AAC in Chrome/Edge; VP9 + Opus fallback in browsers
  without those encoders), WebM (silent realtime fallback), PNG frame snapshot.
  Long clips export slower than realtime because every source frame is seeked
  exactly — a 10-minute module takes a few minutes.

## Tomorrow's workflow (making a module)

1. Open `/motion/zebs` (Chrome or Edge).
2. Module Builder → set module #/title/subtitle, paste the circuit list, tweak the
   disclaimer if needed → **Build module scenes**.
3. Click scene 6 (Video) → **Upload video** → drop Zeb's clip. Duration snaps to
   the clip length; set trim if his slate needs cutting. Wait for
   "clip audio will be in the export" if you want his voice in the mix.
4. Set the overlay text/position per section of the workout (duplicate the video
   scene and trim each copy to a different start point to chapterize one long
   clip with different overlays).
5. Music → upload the bed, set volume (~60–70% under a voiced clip) and fade-in.
6. Play through once (space = play/pause), then **Export MP4 (with audio)**.

## Verified

- `npm run build` clean; page hydrates.
- Headless Chromium E2E: built the module skeleton, uploaded a 5s test clip
  (with audio track) + a 10s music WAV, exported MP4 → 1920×1080, 29.00s,
  video + audio tracks present; frame-exact video seeking confirmed (clip
  timestamp matches timeline position); music fade-in/out measured in the
  exported audio (RMS ramp); all seven scene types render on-brand.

## Known limits / next steps

- **WebM fallback is silent** and video scenes in it are best-effort (realtime,
  not frame-exact). MP4 in Chrome/Edge is the real path.
- **Refresh loses work** — the doc lives in memory (same as the other studios).
  Export before closing. localStorage doc persistence is a good next feature.
- **Voiceover:** planned — ElevenLabs (see `SKILL-eleven-labs.md` in repo root)
  or custom VO; the audio engine already mixes arbitrary buffers, so a VO track
  is "one more clip source" in `renderMixdown`.
- **Zeb direct access:** mirror the `/motion/tfg/login` pattern (scoped session
  in `src/middleware.ts`) if Zeb should reach the tool without the admin password.
- **Porting to the zebs repo:** follow `docs/motion-studio-porting-guide.md` —
  copy `src/lib/motion/*` (now including `audio.ts`), `ZebsMotionStudio.tsx`,
  `controls.tsx`, both CSS files, the Futura `@font-face` rules, and the fonts.
  No Typekit needed (fonts are self-hosted).
