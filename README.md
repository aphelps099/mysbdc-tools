# Handoff: Partnership CRM → tools.norcalsbdc.org/partnerships

## Overview
An internal tool for NorCal SBDC staff to track partner organizations (banks, CDFIs, chambers,
EDCs, funders, event partners) through a relationship pipeline: who owns each relationship, what
stage it's in, how many client referrals it has produced, and what follow-up is due. Four views —
Dashboard, Pipeline board, Partners table, Activity log — plus three modals.

Target: a new tool in the mysbdc tools repo, served at `tools.norcalsbdc.org/partnerships`.

## About the design files
Everything in `reference/` is a **design reference created in HTML** — a prototype of the intended
look and behavior, **not production code to copy**. `Partnership CRM.dc.html` is written in a
bespoke streaming-template format ("Design Components": `<x-dc>`, `<sc-for>`, `renderVals()`,
`<x-import>`) that does not exist in the target repo. Do not port that machinery.

The task is to **recreate this design in the tools repo's existing environment** — its framework,
router, styling approach, and data layer. Repo conventions win on structure; this document wins on
visual detail.

`Partnership CRM Video.dc.html` + `crm-video.jsx` are a 60-second marketing walkthrough animation.
They are **not part of the application**. Included only so the motion/brand treatment is on record.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions are final. Recreate pixel-accurate
using the repo's own libraries and patterns. Every value below is exact.

---

## Design system: FAV NorCal SBDC

### Colors (exact — `reference/tokens/colors.css`)
| Token | Hex | Use |
|---|---|---|
| `--navy` | `#0f1c2d` | ink, dark surfaces, app header |
| `--navy-soft` | `#253247` | data series: Community & events |
| `--cobalt` | `#1b5faf` | primary action, links, data series: Referral |
| `--cobalt-dark` | `#144b8c` | primary hover |
| `--pool` | `#8fc5d9` | brand tint, CTA on dark, focus ring, active tab underline |
| `--pool-pale` | `#dcecf2` | chips, avatars, row hover (`#dcecf24d`) |
| `--berry` | `#c23c3c` | accent rules + overdue/alert **only — never a button** |
| `--evergreen` | `#00675c` | positive deltas, data series: Funding & host |
| `--paper` | `#fdfdfd` | page background |
| `--white` | `#ffffff` | card/panel surfaces |
| `--slate` | `#2c3240` | body copy |
| `--slate-light` | `#687080` | secondary copy, inactive labels |
| `--silver` | `#d8d8d8` | Dormant stage bar |
| `--line` | `#0f1c2d29` | every hairline border/divider |

Max two background colors per view: paper/white, punctuated by navy.

### Typography (`reference/tokens/typography.css`)
- Display: `--sera` = `"proxima-sera", Georgia, "Times New Roman", serif`, weight **400**,
  letter-spacing **−.05em** (−.04em at ≤40px), line-height .93–1.02.
- UI/body: `--nova` = `"proxima-nova", Arial, Helvetica, sans-serif`, weights 400/500/700/800.
- Adobe Typekit kit **`pkl5rjs`** (`https://use.typekit.net/pkl5rjs.css`). Licensed; hot-linked, do
  not self-host. Keep the Georgia/Arial fallbacks.
- **Micro-labels are everywhere:** 10–12px, weight **800**, letter-spacing **.13em**, UPPERCASE,
  `--slate-light` (or `--navy` when active). Eyebrows use .17em plus a 33×3px `--berry` bar before
  the text.
- Headlines are **sentence case**, never title case, never all-caps.

Applied scale:
| Element | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Page headline ("Partnerships") | sera | `clamp(46px,4.6vw,66px)` | 400 | ls −.05em, lh .93 |
| Metric value | sera | 58px | 400 | lh .9, ls −.05em |
| Modal title | sera | 34px | 400 | lh 1.02, ls −.04em |
| Panel label | nova | 11px | 800 | ls .13em, caps |
| Table header | nova | 10px | 800 | ls .13em, caps, `border-bottom: 2px solid --navy` |
| Table cell | nova | 13.5px | 400 | 700 for org name |
| Body / notes | nova | 14px | 400 | lh 1.55 |
| Secondary line | nova | 12–13px | 400 | `--slate-light` |
| Button | nova | 14px (sm) / 15px | 700 | |

### Radii, rules, shadows, focus (`reference/tokens/effects.css`)
- Radii: **buttons 4px, chips 3px, cards 5px, modals 10px**, avatars 50%. Nothing else is rounded.
  No pills.
- Rules: `5px solid --berry` on the top edge of the metric strip, the pipeline board, the activity
  panel, and every modal. `3px solid --navy` under the page hero. `1px solid --line` everywhere else.
- **Shadows only on modals**: `0 42px 85px #0e1a2b4d, 0 12px 28px #0e1a2b1a`. Cards and panels use
  1px borders, never shadows.
- Focus: `outline: 3px solid --pool; outline-offset: 4px`.
- Motion: `.18s` on color/transform; entrances `.3s cubic-bezier(.2,.75,.25,1)`. Button hover =
  `translateY(-2px)` + darker fill. No bounces.

### Buttons
| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| primary | `--cobalt` → `--cobalt-dark` on hover | white | none | Save, Add partner |
| secondary | `#ffffff14` → `#ffffff80` | `--navy` | `1px #0e1a2b5c` → `--navy` | Cancel, View pipeline |
| pool | `--pool` → white | `--navy` | none | on the navy header |

Height 50px, 43px small; padding `0 23px` (`0 18px` small); radius 4px; weight 700.

### "Bordered columns, not gaps"
The signature layout motif: a grid container with `background: var(--line); gap: 1px` and white
children, so panels are separated by hairlines rather than floating. Used by the metric strip
(4 cols), the dashboard panel block (2×2), the pipeline board (6 cols), and the modal field grid.

### Iconography
**There is none, by design.** No icon font, no SVG glyph set, **no emoji**. Substitutes in use:
caps labels, initials in circles (22px, `--pool-pale` fill, 9px/800 navy text), colored dots
(9px circles), `↑`/`↓` for sort direction, `▾` for select chevrons.

---

## Screens / views

Shell: sticky navy header (74px) + `max-width: 1400px` centered content, `padding: 0 34px 90px`.

### Header (all views)
- `position: sticky; top: 0; z-index: 40; height: 74px; background: --navy; padding: 0 34px;`
  `display: flex; align-items: center; gap: 34px;` shadow `0 12px 40px #0e1a2b1f`.
- **Brand lockup** (typographic; the real America's SBDC lockup is hot-linked elsewhere but not used
  here): "NorCal **SBDC**" in sera 20px, ls −.035em, white, `SBDC` at weight 700; below it a 5px gap,
  `border-top: 1px solid #ffffff33`, 5px padding-top, then `PARTNERSHIP CRM` in nova 8.5px/800,
  ls .19em, `--pool`.
- **Tabs**: Dashboard / Pipeline / Partners / Activity. nova 11px/800, ls .13em, caps,
  `margin: 0 10px`, full header height. Inactive `#ffffffa8`, active white with
  `border-bottom: 2px solid --pool`. Hover transitions color in .18s.
- Right side: `SAMPLE DATA` chip (nova 9.5px/800, ls .17em, `--pool`, `1px solid #8fc5d959`,
  6px 11px, radius 3) — hide it when wired to real data — then a **pool** "Add partner" button (43px).

### 1. Dashboard
1. **Hero** — `padding: 52px 0 26px; border-bottom: 3px solid --navy;` flex, space-between, items
   flex-end. Left: eyebrow (33×3 berry bar + `NORCAL SBDC NETWORK`), `Partnerships` in the display
   size, then `{n} partner organizations · Updated {date}` at 15px `--slate`. Right: primary
   "Add partner" + secondary "View pipeline" (with the CSS arrow).
2. **Metric strip** — `margin-top: 34px; border: 1px solid --line; border-top: 5px solid --berry;`
   4-col hairline grid. Each cell `padding: 26px 26px 28px`: caps label → 58px sera value (14px
   margin) → 13px sub (12px margin). Values: Active partnerships `8` / "▲ 2 vs. last quarter"
   (evergreen); In pipeline `5` / "2 at agreement stage" (slate-light); Client referrals YTD `70` /
   "▲ 18% vs. same period 2025" (evergreen); Overdue follow-ups `3` / "Needs attention" (berry).
   All derived from the data — see §Derived metrics.
3. **Panel block** — `margin-top: 26px; border: 1px solid --line;` 2×2 hairline grid, cells
   `padding: 26px 28px 30px`. Each panel header: caps label left, 12px slate-light note right,
   `padding-bottom: 16px; border-bottom: 1px solid --line`.
   - **Needs attention** / "Overdue and stalling" — rows: 9px dot (berry = overdue, pool = going
     stale), name 14px/700, detail 12.5px slate-light, right-aligned tag chip (10px/800 caps,
     berry on `#c23c3c14`, or slate on `--pool-pale`), `padding: 14px 0`, hairline between,
     row hover `#dcecf24d`, whole row opens the partner. Empty state: "All caught up — nothing
     needs attention."
   - **Pipeline stages** / "All partners" — one bar row per stage (6).
   - **Top referral sources** / "Jan–Jul 2026" — top 6 partners by referrals, bar rows, clickable.
   - **Partners by type** / "Excludes dormant" — 3 bar rows.

   **Bar row**: `grid-template-columns: {labelW}px 1fr 28px; gap: 14px; padding: 7px 0`. Label
   13px slate, right-aligned, ellipsised. Track: 14px tall, `border-left: 2px solid --line`, fill is
   absolutely positioned, `min-width: 2px`, `border-radius: 0 2px 2px 0`, width transitions
   `.35s cubic-bezier(.2,.75,.25,1)`. Value 13px/700, tabular-nums.

### 2. Pipeline (board)
Filter row (`padding: 34px 0 20px`): eyebrow "PIPELINE", type select, owner select,
right-aligned count in caps 12px/800 slate-light ("{n} of {total} partners").
Board: `border: 1px solid --line; border-top: 5px solid --berry;`
`grid-template-columns: repeat(6, minmax(180px,1fr)); gap: 1px; background: --line;` horizontal
scroll below ~1200px. Column: white, `padding: 16px 14px 20px`, `min-height: 220px`; header =
caps 10px name + count, `border-bottom: 1px solid --line`, then cards in a `gap: 8px` column.
Card: `background: --paper; border: 1px solid --line; border-left: 3px solid {typeColor};`
`border-radius: 3px; padding: 13px 14px;` name 13.5px/700, meta 12px slate-light, footer row with
next-follow-up date (11.5px/700, berry when overdue) and the initials avatar. Hover:
`border-color: #0f1c2d5c`.

### 3. Partners (table)
Filter row: search input (min-width 300), type / stage / owner selects, right-aligned count.
Inputs: 43px min-height, `1px solid --line`, radius 4, `padding: 11px 13px`, 13.5px.
Table: white, `border: 1px solid --line`, `border-collapse: collapse`, `min-width: 1000px`,
overflow-x auto. Header cells: caps 10px/800, `padding: 14px 16px`,
`border-bottom: 2px solid --navy`, click to sort (active column goes navy and shows `↑`/`↓`;
clicking the active column flips direction). Rows: `border-bottom: 1px solid --line`, cell padding
`15px 16px` (compact: `9px 14px`), hover `#dcecf24d`, click opens the detail modal.
Columns: Organization (3px type-color bar + name 13.5/700 + "subtype · city" 12px) · Type (chip in
the type color on `{color}14`) · Stage (chip, navy on `--pool-pale`) · Primary contact (name + title) ·
Owner · Referrals YTD (tabular) · Last contact · Next follow-up (berry + 700 when overdue).
Chips: `inline-flex; gap: 7px; font-size: 11.5px; font-weight: 700; radius: 3px; padding: 4px 10px`.
Empty state: centered "No partners match these filters." at 13px slate-light, 44px padding.

### 4. Activity
Filter row: eyebrow "ACTIVITY LOG", activity-type select, right-aligned "{n} logged activities".
Panel: `border: 1px solid --line; border-top: 5px solid --berry;` white, `padding: 8px 30px 22px`.
Rows: `grid-template-columns: 92px 108px 1fr; gap: 20px; padding: 16px 0;`
`border-bottom: 1px solid --line`. Date 12.5px slate-light tabular · type caps 10px/800 `--cobalt` ·
partner name 13.5/700 over note 13px slate. Whole row opens that partner. Sorted date desc.

### Modals (all three)
- Scrim: `position: fixed; inset: 0; background: #0f1c2d8c; backdrop-filter: blur(7px);`
  `display: flex; align-items: flex-start; justify-content: center; padding: 56px 20px;`
  `overflow-y: auto;` fades in .18s. Click scrim or Esc closes; clicks inside must not bubble.
- Window: white, `border-radius: 10px`, `border-top: 5px solid --berry`, `overflow: hidden`,
  shadow `0 42px 85px #0e1a2b4d, 0 12px 28px #0e1a2b1a`, entrance
  `.3s cubic-bezier(.2,.75,.25,1)` from `opacity 0, translateY(20px) scale(.99)`.
- Head: `padding: 30px 34px 24px`, caps eyebrow → sera 34px title → 13.5px slate sub. Close button
  is a 36×36 square, `1px solid --line`, radius 4, `✕`; hover `--pool-pale` fill + `--pool` border.
- Footer: `display: flex; justify-content: flex-end; gap: 10px; padding: 18px 34px;`
  `border-top: 1px solid --line`; sticky to the bottom on the detail modal.
- Form fields: caps 10px/800 label, 7px gap, control full width, 43px min-height, radius 4.
  Textareas `min-height: 78px`, `resize: vertical`, lh 1.5.

**Partner detail** (max-width 720). Eyebrow = type label; title = org name; sub =
"{subtype} · {city} · {center}". Then a 2-col hairline field grid: Primary contact (+title) ·
Reach (email as cobalt link, + phone) · Referrals YTD (value in sera 30px) · Last contact
("{n} days ago") · Next follow-up (berry + "Overdue" hint when overdue) · Service center.
Below: Stage and Owner selects (editable), Notes, then
"Activity history ({n})" — rows `grid-template-columns: 88px 1fr; gap: 18px; padding: 13px 0`,
hairline between, type as an inline caps 10.5px/800 navy label before the note. Footer:
secondary "Log activity" + primary "Save changes".

**Add partner** (max-width 680). 2-col form: Organization name (required, full width) · Type ·
Category · City · Service center · Stage · Owner · Contact name · Contact title · Email · Phone ·
Next follow-up (date) · Notes (full width). Footer: secondary "Cancel" + primary "Add partner".
On submit: default subtype "Organization", city "—", center "Lead Center", contact "—",
referrals 0, lastContact = today, and seed one activity `{today, "Email", "Partner added to CRM."}`.

**Log activity** (max-width 580). Eyebrow = partner name. Fields: Type (select, default Meeting) ·
Date (defaults to today, required) · What happened (textarea, required, placeholder "Summary of the
conversation") · Next follow-up (date). Footer: secondary "Cancel" + primary "Save activity".
On submit: append the activity; if its date > `lastContact`, update `lastContact`; if a follow-up
date was given, overwrite `nextFollowUp`.

**Toast**: `position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%);` navy fill,
white 13px/700, `padding: 14px 24px`, radius 4, shadow `0 18px 40px #0e1a2b52`, rises in over
`.28s cubic-bezier(.2,.75,.25,1)`, auto-dismiss at **2600ms**. Messages: `Saved {name}`,
`Activity logged for {name}`, `Added {name}`.

---

## Interactions & behavior
- Tabs switch views; only one view mounted/visible at a time.
- Any row, board card, referral bar, attention item, or activity row opens that partner's detail modal.
- Table sort: click a header to sort asc; click the active header to flip. Default `name` asc.
  Stage sorts by pipeline order, not alphabetically.
- Filters are AND-combined. Search matches `name + contact + city + subtype + center`, case-insensitive.
- Esc closes any modal; scrim click closes; the detail modal's "Log activity" swaps to the log modal
  for the same partner.
- Focus trap inside modals; return focus to the invoking element on close; `role="dialog"`,
  `aria-modal="true"`.
- Responsive: below ~1150px the board scrolls horizontally; below ~860px the dashboard 2×2 becomes
  1 column; below ~560px modal form grids become 1 column.
- **No dark mode.** The design system is light-only.

## State management
Per-view UI state: `view`, `q`, `fType`, `fStage`, `fOwner`, `pipeType`, `pipeOwner`, `actType`,
`sortKey`, `sortDir`, `modal` (`null | 'detail' | 'add' | 'log'`), `currentId`, `toast`.
Detail modal holds draft `stage`/`owner` until "Save changes" commits them.
Data: a `partners` collection (below). The prototype is in-memory; in the repo, back it with
whatever the tools repo already uses, and keep a `SAMPLE_DATA` flag that serves the seed set so the
UI runs before the backend exists.

## Data model
```ts
type Partner = {
  id: number;
  name: string;
  type: 'Referral' | 'Funding' | 'Community';
  subtype: string;          // "Community bank", "CDFI", "Chamber", "Host institution"…
  city: string;
  center: string;           // "North Coast SBDC", "Butte College SBDC", "Lead Center"…
  contact: string;
  contactTitle: string;
  email: string;
  phone: string;
  stage: 'Prospect' | 'Outreach' | 'In Discussion' | 'MOU / Agreement' | 'Active' | 'Dormant';
  owner: string;            // "Aaron" | "Gustavo" | "Scott" | "Preet" | "Eric"
  referrals: number;        // client referrals YTD
  lastContact: string;      // "YYYY-MM-DD"
  nextFollowUp: string;     // "YYYY-MM-DD" | ""
  notes: string;
  activities: { date: string; type: ActivityType; note: string }[];
};
type ActivityType = 'Meeting' | 'Call' | 'Email' | 'Event' | 'Referral' | 'Agreement';
```

Type colors — Referral `--cobalt`, Funding `--evergreen`, Community `--navy-soft`.
Type labels — "Referral partner", "Funding & host", "Community & events";
short labels "Referral", "Funding", "Community".
Stage bar ramp, in stage order: `#dcecf2, #b9d9e6, #8fc5d9, #4f8fc4, #1b5faf, #d8d8d8`.

### Derived metrics
- Active partnerships = `stage === 'Active'`.
- In pipeline = stage not in `['Active','Dormant']`; sub-line counts `stage === 'MOU / Agreement'`.
- Client referrals YTD = sum of `referrals`.
- Overdue = `nextFollowUp && nextFollowUp < today && stage !== 'Dormant'`.
- "Going stale" = not overdue and `lastContact` more than **45 days** ago; excluded when Dormant.
- Partners by type excludes Dormant. Top referral sources = referrals > 0, desc, first 6.
- Dates render as `MMM d` (`Jul 22`), with the year appended when it isn't the current year.
- The prototype pins "today" to `2026-07-27`; use the real current date.

### Seed data
14 records, verbatim, in `reference/Partnership CRM.dc.html` — search for `seed = [`. All of it is
fictional sample data (`*.example.com` addresses, `555-01xx` phones). Copy it as-is into the
`SAMPLE_DATA` fixture.

## Copy rules
Second person, plain, no hype, no emoji, no exclamation marks. Sentence-case headlines.
ALL-CAPS only for micro-labels. Keep the exact strings above — they are the approved voice.

## Assets
None to copy. Fonts come from Typekit `pkl5rjs`. No images, no icon set. The brand lockup in the
header is typographic CSS, not an image file.

## Files
- `reference/Partnership CRM.dc.html` — the app design reference (layout, copy, seed data, logic).
- `reference/tokens/colors.css`, `typography.css`, `effects.css` — token source of truth.
- `reference/Partnership CRM Video.dc.html`, `reference/crm-video.jsx` — 60s marketing walkthrough.
  **Not part of the app.**
- `PROMPT.md` — the prompt to paste into Claude Code.
