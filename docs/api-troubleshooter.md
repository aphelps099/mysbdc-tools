# API Troubleshooter — Operations Guide

**Live:** https://tools.norcalsbdc.org/api-troubleshooter (main tools login)
**Shareable gated link:** https://tools.norcalsbdc.org/api-troubleshooter/login — password
`Troubl3shoot3r` (env `TROUBLESHOOTER_PASSWORD`) opens ONLY the troubleshooter.
**Design history:** `milestone-delivery-watchdog-design.md`. **Code:**
`src/app/api-troubleshooter/`, `src/app/api/api-troubleshooter/`, `src/lib/api-troubleshooter/`.

## What it is

Observe-only diagnostics for the milestone (EI) submission pipeline
(norcalsbdc.org/success → Gravity Forms → Neoserra API → notifications). It reads three
sources — the Gravity Forms entries ledger, the Neoserra API (GET only), and pasted
notification/error emails — cross-checks them, and produces a plain-English verdict plus
a copy-ready email. It writes nothing, anywhere, ever: the GF key is created with READ
permission, every Neoserra call is a GET, and no code touches the live form.

## How a lookup works

1. **Input:** client email, business (client) ID, contact ID — or paste a notification
   email / GF entry / "Neoserra API Error" email. Deep links: `?email=`, `?business=`.
2. **WordPress:** searches form 39 entries by the mapped field ID; if the keyed search
   misses, scans the 100 most recent entries client-side. Flags likely double
   submissions (same client within 10 minutes — a confirmed real pattern).
3. **Neoserra:** contact by email → `relationships/{contactId}` → every linked client
   record (name, center, status) → milestone probes.
4. **Verdict:** delivered / will-not-post / rejected / missing / needs-manual-check /
   "Neoserra is not responding right now" — each with What happened / Likely issue /
   The fix, and a Copy-email button.

## Confirmed failure rules (the playbook)

| Rule | Symptom | Verdict | Source |
|---|---|---|---|
| **Zero/negative EI does not post** (Attribution Handbook p.19) | Client sees confetti; no Neoserra record; no advisor email | "Will not post — zero or negative EI change" | Carrie Lopez 8/6/26; proved by the Woody's Brewing case |
| **Neoserra validation rejection** | "Neoserra API Error (Milestones - Step 2)" email, e.g. `[update_client][primaryNaics] is a required value` | "Neoserra rejected this submission" (paste the error email) | June 2026 error emails |
| **Double submission** | Two GF entries seconds apart | 🔁 flag on the entries table | ~50% of Aug 2026 notifications |
| **Lookup no-match** | "Email is not valid" at Step 1 | "No Neoserra contact has this exact email" | Zimmers case, July 2026 |
| **Malformed email/values** | Whole record creation killed | Value anomaly flags | `src/lib/validate.ts` history |

**Case study #1 — Woody's Brewing (Aug 5–6, 2026).** Advisor watched the client submit
(confetti); director saw nothing in Neoserra; deliverability was suspected. Actual chain:
GF entry 42340 captured → staff numbers entered inverted (15→6 = −9) → Handbook p.19
suppressed the post → no record, no notification. Resolution: confirm real figures with
the advisor (intent was +10 per Zack), enter the milestone manually. Time to diagnose
with the troubleshooter: one lookup + one paste.

## Neoserra API map (verified live, Aug 2026)

Works: `contacts?email=`, `contacts/{id}`, `relationships/{contactId}` (→ client links),
`clients/{id}`, `counselors?columns=`, `events?startDate=`.
Does NOT work with this key: any milestone read (`milestones?clientId=` hangs,
`clients/{id}/milestones` → 500 "Unrecognied link type", `milestones/{id}` → 404).
Notes: no trailing slashes (404); hangs = malformed/unsupported query; bursts of
parallel requests appear to trip rate limiting (the tool now chunks probes ×3 and caches
reads 10 min). **API contact: Colette Williams <colw@outreachsystems.com>** — responsive,
lifted the 100-record limit, fixed the trailing-slash 404. The open ask for her: the GET
syntax to list milestone records for a client (would make delivered/missing verdicts
fully automatic).

## Setup / env (all on Railway)

| Var | Purpose |
|---|---|
| `NEOSERRA_BASE_URL`, `NEOSERRA_API_KEY` | Neoserra reads (GET only) |
| `GRAVITY_FORMS_BASE_URL`, `GRAVITY_FORMS_KEY`, `GRAVITY_FORMS_SECRET` | GF entries ledger — key must be READ permission; requires Forms → Settings → REST API enabled |
| `GRAVITY_FORMS_STEP2_ID` | Step 2 form ID (default 39) |
| `TROUBLESHOOTER_PASSWORD` | Scoped-access password (default `Troubl3shoot3r`) |

## Endpoint explorer (advanced)

`POST /api/api-troubleshooter/probe` `{ "path": "/api/v1/..." }` (authenticated) tests a
single GET against Neoserra — for discovering query shapes without a deploy. Restricted
to `/api/v1/`, GET only, response truncated.

## What's deliberately NOT automated yet

- **Milestone read verdicts** — blocked on the read syntax (ask Colette).
- **Scheduled reconciliation + alerting** (design doc §4.1–4.4) — the daily sweep that
  classifies every submission and emails a digest; build on the pieces above once
  milestone reads work.
- **WP-side fixes** — honest error screen instead of confetti on failure, submit-button
  double-click guard, notification BCC. Needs WordPress/Jordan Crown; the troubleshooter
  only observes.
