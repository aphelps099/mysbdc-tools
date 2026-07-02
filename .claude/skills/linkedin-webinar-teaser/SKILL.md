---
name: linkedin-webinar-teaser
description: Produce branded NorCal SBDC teaser videos for webinars and workshops, sized for LinkedIn and other social feeds. Use when asked to promote an event with video — "teaser for our webinar", "promo video for the workshop", "LinkedIn video for this event" — and ESPECIALLY when the user pastes a "render request" or props JSON from the Event Teaser Builder. Renders 15-second MP4s from a ready-made Remotion template; each new event only needs new props (no new code).
user_invocable: true
---

# LinkedIn Webinar/Workshop Teaser

Renders a 15-second, on-brand teaser MP4 from the parameterized `WebinarTeaser`
Remotion composition in `videos/`. Four scenes: hook question (optional photo
background) → title + date/time chips + speaker → "you'll walk away with"
bullets → logo + register CTA, with an accent progress bar throughout. All
text-driven, so it reads perfectly with LinkedIn's muted autoplay. For general
Remotion guidance (or template edits), see the **remotion-video** skill.

## Two entry points

**A. Builder handoff (preferred).** Staff use the self-serve builder at
`public/brand/video/teaser-builder.html` (served at `/brand/video/teaser-builder.html`)
to paste event info, proof the script, pick theme/accent/motion/format, and
click "Copy render request". If the user pastes that request (composition id +
props JSON), the copy is already proofed: save the JSON to
`videos/props/<slug>.json` **verbatim**, then jump to *Verify & render*. Only
flag genuine problems (e.g. a bullet that will clip).

**B. From a description.** If the user just describes the event (or pastes a
flyer/URL), gather what's missing and write the copy yourself:

- **Title, date, time, location** — e.g. "Thu, July 24" / "12:00–1:00 PM PT" / "Live on Zoom"
- **Speakers** — 0–2, name + role
- **2–4 takeaway bullets** — concrete outcomes, ≤ ~50 chars each
- **Registration URL** — short display form, e.g. `norcalsbdc.org/events`
- **Hook** — write it: pain-point question or bold promise, ≤ ~45 chars
- Brand terms: "no-fee advising", "entrepreneurs", "expert advisors", "NorCal SBDC"

## Props reference (schema in `videos/src/WebinarTeaser.tsx`)

Besides the text fields above:

| Prop | Values | Notes |
|---|---|---|
| `theme` | `navy` (default) / `cream` | navy = dark + white logo; cream = light + color logo |
| `accent` | hex | Pool `#8FC5D9` default, Brick `#a82039` urgency, Royal `#1D5AA7` |
| `motion` | `classic` / `energetic` / `bold` | spring feel + stagger speed |
| `image` | URL, data URI, or filename in `videos/public/`, `''` = none | photo behind the hook scene (navy scrim added) |
| `logo` | usually `''` | override the theme logo |

Copy the shape of `videos/props/example-webinar.json` — all keys required.

## Setup

```bash
cd videos
[ -d node_modules ] || npm install
npm run assets   # fonts + logos into videos/public/ (idempotent)
```

**Logos:** the legacy marks (`americas-sbdc-norcal-white-180h.png` / `-400w.png`)
are downloaded from norcalsbdc.org by `copy-assets.sh`. In network-restricted
sessions the download fails — the script prefers committed copies at
`public/brand/logos-legacy/` if present. If neither exists, tell the user renders
need those two files and ask them to commit them there once.

**Fonts:** Proxima Nova / Proxima Sera load from Adobe Fonts kit `pkl5rjs`
(domain-restricted). Where the kit refuses (sandboxes; domains not on the kit's
allowlist), the render falls back to the bundled GT America/Tobias files — still
on-brand, never a failed render.

## Verify & render

Browser flag for remote/Claude Code sessions (local machines don't need it):

```bash
BF="--browser-executable=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)"
```

Spot-check one still per scene and **view the images**:

```bash
for f in 40 150 280 400; do
  npx remotion still <CompId> out/check-$f.png --frame=$f --props=props/<slug>.json $BF
done
```

Check: nothing clipped, chips fit ≤ 2 lines, photo scrim keeps hook readable,
cream theme text is navy. Long hooks/titles auto-shrink, but if a title needs
> 4 lines, tighten the copy. Then render:

```bash
npx remotion render <CompId> out/<slug>.mp4 --props=props/<slug>.json $BF
```

| Composition | Size | Use for |
|---|---|---|
| `TeaserSquare` | 1080×1080 | LinkedIn feed (default), Instagram |
| `TeaserVertical` | 1080×1350 (4:5) | LinkedIn/IG feed, takes more screen space |
| `TeaserWide` | 1920×1080 | YouTube, event pages, email embeds |

Builder requests name the composition; otherwise default to `TeaserSquare`.

## Deliver

Send the MP4(s) plus a thumbnail still (frame 150 doubles as the event
graphic). Offer to draft the LinkedIn post: 2–3 short lines, hook first,
date/time + registration link, 3–5 hashtags (#SmallBusiness #NorCalSBDC +
topic). Post natively — uploaded video far outperforms links in the feed.
Videos autoplay muted; if music is requested anyway, generate a 15 s track with
the **elevenlabs-music** skill, drop it in `videos/public/`, and add
`<Audio src={staticFile('track.mp3')} volume={0.4} />` to the template root.

## Customizing

Template: `videos/src/WebinarTeaser.tsx` · palette/fonts/motion presets:
`videos/src/brand.ts` · scene timing: `HOOK_END`/`TITLE_END`/`LEARN_END`
constants (450 frames @ 30 fps; also update `durationInFrames` in
`videos/src/Root.tsx`) · builder UI: `public/brand/video/teaser-builder.html`
(its `/api/event-fetch` helper lives at `src/app/api/event-fetch/route.ts`).
Keep builder motion/format constants in sync with `brand.ts` when editing either.
