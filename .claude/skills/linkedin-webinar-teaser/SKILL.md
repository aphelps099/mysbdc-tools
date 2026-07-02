---
name: linkedin-webinar-teaser
description: Produce branded NorCal SBDC teaser videos for webinars and workshops, sized for LinkedIn and other social feeds. Use when asked to promote an event with video — "teaser for our webinar", "promo video for the workshop", "LinkedIn video for this event", "social video for our training". Renders 15-second MP4s from a ready-made Remotion template; each new event only needs new props (no new code).
user_invocable: true
---

# LinkedIn Webinar/Workshop Teaser

Renders a 15-second, on-brand teaser MP4 from the parameterized `WebinarTeaser`
Remotion composition in `videos/`. Four scenes: hook question → title + date/time
chips + speaker → "you'll walk away with" bullets → logo + register CTA, with an
accent progress bar throughout. Everything is text-driven, so it reads perfectly
with LinkedIn's muted autoplay. For general Remotion guidance (or edits to the
template itself), see the **remotion-video** skill.

## Step 1: Gather event details

Collect from the user's message, a pasted flyer/description, or an event page.
Ask only for what's missing:

- **Title** — exact event name
- **Date / time / location** — e.g. "Thu, July 24" / "12:00–1:00 PM PT" / "Live on Zoom"
- **Speakers** — 0–2, name + role
- **2–4 takeaway bullets** — what attendees will learn
- **Registration URL** — short display form, e.g. `norcalsbdc.org/events`

Then write the **hook** yourself (see copy rules) and confirm details with the
user only if something looks ambiguous.

## Step 2: Write the copy (brand voice)

- **Hook**: a pain-point question or bold promise, ≤ ~45 characters.
  Good: "Is your business ready for funding?" / "Your first hire, done right".
  It renders in all-caps display type — keep it punchy.
- **Bullets**: concrete outcomes, ≤ ~50 characters each, 3 is ideal.
  Lead with specifics ("The 5 numbers lenders check first"), not vague themes.
- **Eyebrow**: "Free webinar" / "Free workshop" / "Live training".
- **CTA**: "Register free" (default). URL in short display form.
- Brand terminology: "no-fee advising" (not "free consulting"), "entrepreneurs"
  (not "clients"), "expert advisors" (not "counselors"), "NorCal SBDC".
- **Accent color**: Pool `#8FC5D9` (default), Brick `#a82039` for urgency
  ("last chance to register"), Royal `#1D5AA7` as an alternative. Chip/button
  text contrast adapts automatically.

## Step 3: Set up and fill props

```bash
cd videos
[ -d node_modules ] || npm install
npm run assets   # copies brand fonts + logo from ../public (idempotent)
```

Save the event's props as `videos/props/<event-slug>.json` — copy the shape of
`videos/props/example-webinar.json` (all fields required; `speakers` may be `[]`).

## Step 4: Verify with stills, then render

In remote/Claude Code sessions, set the browser flag first (local machines don't
need it — Remotion downloads its own headless Chrome):

```bash
BF="--browser-executable=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)"
```

Spot-check one still per scene and view the images before committing to a full render:

```bash
for f in 40 150 280 400; do
  npx remotion still TeaserSquare out/check-$f.png --frame=$f --props=props/<slug>.json $BF
done
```

Check: nothing clipped or overflowing, chips fit on ≤ 2 lines, speaker line fits.
The template auto-shrinks long hooks/titles, but if a title needs > 4 lines,
tighten the copy instead. Then render:

```bash
npx remotion render TeaserSquare out/<slug>-square.mp4 --props=props/<slug>.json $BF
```

### Formats

| Composition | Size | Use for |
|---|---|---|
| `TeaserSquare` | 1080×1080 | LinkedIn feed (default), Instagram |
| `TeaserVertical` | 1080×1350 (4:5) | LinkedIn/IG feed, takes more screen space |
| `TeaserWide` | 1920×1080 | YouTube, event pages, email embeds |

Default to **TeaserSquare** for LinkedIn unless asked otherwise; render extra
formats on request — same props file, different composition id.

## Step 5: Deliver

Send the MP4(s) to the user, plus a thumbnail still (frame 150 shows title +
details — also useful as the event graphic). Offer to draft the accompanying
LinkedIn post: 2–3 short lines, hook first, date/time + registration link,
end with 3–5 hashtags (e.g. #SmallBusiness #NorCalSBDC + topic tags).

## LinkedIn video notes

- MP4/H.264 (Remotion's default codec) uploads directly; 15 s is the sweet spot
  for feed teasers.
- Videos autoplay **muted** — this template needs no soundtrack. If the user
  wants music anyway, generate a 15 s track with the **elevenlabs-music** skill,
  drop it in `videos/public/`, and add `<Audio src={staticFile('track.mp3')} volume={0.4} />`
  inside the template's root `AbsoluteFill`.
- Post natively (upload the file) rather than linking to YouTube — native video
  gets far better reach in the feed.

## Customizing the template

The template lives at `videos/src/WebinarTeaser.tsx`; brand palette + fonts in
`videos/src/brand.ts`. Scene timing is set by `HOOK_END` / `TITLE_END` /
`LEARN_END` constants (450 frames total @ 30 fps — change the `durationInFrames`
in `videos/src/Root.tsx` alongside them). Preview interactively with
`npm run studio` on a local machine.
