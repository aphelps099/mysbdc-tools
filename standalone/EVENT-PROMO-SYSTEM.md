# Event Promo Design System

A small, strict design system for event promotion videos and graphics,
built by the NorCal SBDC. It powers **Promo Studio** (`promo-studio.html`
— a single-file video editor that runs in Chrome) and renders four card
families from one set of **brand tokens**. Customize the tokens and the
whole system re-skins itself.

Load this file into Claude Design (or Claude/Cowork) and work through the
**Exploration workflow** below to design a version for your own network.

---

## 1. The brand tokens (everything customizable lives here)

An identity for this system is exactly this JSON — nothing more:

```json
{
  "name": "your-network",
  "headingFont": "Lora",
  "bodyFont": "Inter",
  "dark":  { "bg": "#0f1c2e", "fg": "#ffffff", "accent": "#8fc5d9" },
  "light": { "bg": "#f0efeb", "fg": "#0f1c2e", "accent": "#1d5aa7" },
  "rule": "#c23c3c",
  "logoLight": "https://…/logo-white.png",
  "logoDark": "https://…/logo-color.png",
  "eventUrlExample": "yoursite.org/events"
}
```

- **headingFont / bodyFont** — Google Fonts family names. Heading is the
  display voice (serifs read editorial; heavy sans reads bold); body does
  kickers, labels, times, links.
- **dark / light** — the two scheme poles. Most slides run dark; light
  is the rhythm beat. `accent` colors kickers and highlights — it must
  pass contrast on its background.
- **rule** — the short underline stroke on cards (NorCal uses berry red).
  One saturated color, used ONLY as a thin rule, never a background.
- **logoLight** goes on dark slides; **logoDark** on light slides.
  Transparent PNGs.

## 2. The card families (fixed anatomy — do not redesign the bones)

1. **Save-the-date** — huge day-of-month numeral, month label, hairline
   column, event title, weekday+time line, footer: logo left, short
   event link right.
2. **Title card** — kicker pair top (left label | right label), rule,
   big headline low, subtitle, same logo/link footer.
3. **Agenda** — header + rule, 3–5 rows ("topic | time" or
   "day MON | title | meta"), hairlines between rows, logo/link footer.
4. **End card** — logo centered top, small CTA kicker, ONE big line (the
   short event link), rule, tagline, fine print at the bottom.

Plus supporting slides: **statement** (one big serif line — the hook),
**quote**, **big number**, **photo slide** (image + overlay + text).

## 3. Voice & typography rules (what makes it look designed)

- Sentence case titles. ALL-CAPS only in the small kicker labels.
- No exclamation marks. No emoji. No icons.
- Real facts only: real dates, real times, real links.
- Links are display typography: SHORT links only ("sbdc.events/name",
  never a long registration URL).
- Flat color fields. No gradients, no drop shadows, no clip art.
- One accent color working per slide.

## 4. Exploration workflow (do this in Claude Design)

An **exploration** is one candidate identity: a filled-in token JSON plus
re-rendered sample cards. To run one:

1. Tell Claude about your network: name, website, logo files or URLs,
   any existing brand colors, and the feeling you want (institutional,
   warm, modern, editorial…).
2. Ask Claude to propose **2–3 token sets** (JSON above), each with a
   one-line rationale and a Google-Fonts pairing.
3. For each candidate, have Claude mock the four card families — as
   HTML/CSS cards in Claude Design using the anatomy in section 2 —
   with your real event as sample content.
4. Compare, react, iterate ("warmer background", "heavier headline
   face", "our green reads too neon on dark — desaturate it").
5. When one wins, ask Claude for **the HANDOFF** (section 5).

Judging tips: check the accent on both poles, check a LONG event title
(does the headline face stay elegant at 4 lines?), and check the link
footer at small size.

## 5. The HANDOFF (how a winning exploration becomes real)

Ask Claude: *"Give me the handoff for this exploration."* The handoff is
the final token JSON from section 1. It has three landing spots — pick
by audience:

- **A. Straight into Promo Studio (no tools needed).** Open
  `promo-studio.html`, and enter the tokens in the Brand panel: the two
  fonts, the three dark-pole colors, both logos, your event link.
  That's the entire integration — the studio's Brand panel IS the token
  schema. Save a screenshot of the panel as your "brand card."
- **B. Cowork / Claude Code (for the design-system keepers).** Give a
  Cowork session this repo and the JSON and ask it to: add the file
  under `standalone/brands/<name>.json`, run the card renderer to
  regenerate that network's sample cards, and sync them into the shared
  Claude Design project as a new exploration group — so the system
  library grows one identity per network.
- **C. A branded ZIP (nicest hand-back).** Same Cowork session can bake
  the tokens in as the ZIP's defaults and produce
  `promo-studio-<network>.zip` — the network's team opens it already
  wearing their identity.

## 6. What stays fixed

Card anatomy, motion (restrained rises and reveals), pacing defaults,
and the voice rules. Explorations change tokens, not bones — that
discipline is why every network's output still looks like it came from
a design system instead of a template mill.
