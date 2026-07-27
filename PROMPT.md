# Copy-paste prompt for Claude Code

Run this from the root of the **mysbdc tools repo** (the one that deploys `tools.norcalsbdc.org`).
Paste the whole block as your first message, with this `design_handoff_partnership_crm/` folder
placed at the repo root (or adjust the path in step 0).

---

I'm adding a new tool to this repo: the **Partnership CRM**, to be served at
`tools.norcalsbdc.org/partnerships`. A complete design handoff is in
`./design_handoff_partnership_crm/`.

Work in this order and stop for my confirmation at the end of step 2.

**Step 0 — read the handoff.**
Read `design_handoff_partnership_crm/README.md` in full, then skim
`design_handoff_partnership_crm/reference/Partnership CRM.dc.html`. That HTML file is a
**design reference prototype**, not code to copy. It is written in a bespoke streaming-template
format ("Design Components") that does not exist in this repo — do not try to port the
`<x-dc>` / `<sc-for>` / `renderVals()` machinery. Recreate the UI in whatever framework
this repo already uses, following this repo's existing patterns.

**Step 1 — inventory the repo.** Report back:
- framework, router, build tool, package manager, Node version
- how existing tools under `tools.norcalsbdc.org` are registered/routed and how a new one is added
- existing styling approach (CSS modules / Tailwind / styled-components / plain CSS) and whether
  NorCal SBDC design tokens already exist anywhere in the repo
- whether the Adobe Typekit kit `pkl5rjs` (proxima-nova / proxima-sera) is already loaded
- existing data layer (REST, tRPC, Supabase, Prisma, static JSON?) and auth/session model
- test setup, lint config, CI, and how deploys to tools.norcalsbdc.org happen

**Step 2 — propose a plan.** File-by-file: routes, components, data model, token strategy,
and where the seed data lives. Flag anything in the handoff that conflicts with repo
conventions — repo conventions win on structure; the handoff wins on visual detail.
**Wait for my approval before writing code.**

**Step 3 — build, in this order.**
1. Design tokens: add the CSS custom properties from
   `design_handoff_partnership_crm/reference/tokens/*.css` in whatever form this repo uses.
   Load the Typekit kit if it isn't already loaded; keep the Georgia/Arial fallbacks.
2. Data layer against the schema in README §"Data model", with the 14 seed records from
   README §"Seed data" behind a `SAMPLE_DATA` flag so the tool runs before the real backend exists.
3. Shell + routing: `/partnerships` with the four views (Dashboard, Pipeline, Partners, Activity)
   as tabs. Use this repo's routing, not local component state, if other tools do.
4. Views, in order: Dashboard → Partners table → Pipeline board → Activity log.
5. The three modals (partner detail, add partner, log activity).
6. Accessibility pass: focus trap in modals, Esc to close, `aria-modal`, keyboard-sortable table
   headers, 3px `--pool` focus ring at 4px offset.

**Step 4 — verify.**
- `npm run lint && npm run build` (or this repo's equivalents) must pass clean.
- Compare each finished view side by side with the reference HTML at 1440×900 and fix drift in
  spacing, type scale, and color.
- Confirm the tool appears wherever this repo lists its tools, and that the deploy target really
  is `tools.norcalsbdc.org/partnerships`.

**Constraints — do not deviate without asking:**
- No new UI/component/icon library. This design system deliberately has **no icons and no emoji** —
  "icons" are typographic (caps labels, initials in circles, colored dots).
- Only the colors, type, radii, and shadows listed in README §"Design tokens".
- Do not port the `.dc.html` format, and do not add a dark mode (the system is light-only).
- The animated walkthrough (`Partnership CRM Video.dc.html`, `crm-video.jsx`) is **marketing
  material, not part of the app** — ignore it unless I ask for it.
