# Milestone Collection Troubleshooting System — Plan

**Status:** Planning only — no implementation yet.
**Trigger:** Recurring API errors in the milestone collection flow (norcalsbdc.org/success).
Most recent case (7/6/2026, Sophie Konuwa / Carrie Lopez): client Marilyn Zimmers
(mzimmers1207@gmail.com, CHI0017729 "A Second Start") gets "client's email is not valid"
at the lookup step for over a week, even though the record exists in Neoserra with no
duplicates, and reproduces for staff.

---

## 1. The system as it actually runs today

Two parallel implementations exist; the troubleshooting system must cover the one
that's live:

**Live (WordPress):** Gravity Forms two-form flow — Form 38 (Step 1: email/name/phone
lookup) and Form 39 (Step 2: milestone details) — on norcalsbdc.org/success. A custom
WP plugin / GF hook calls the Neoserra JSON API to (a) look up the contact by email and
return their business(es), and (b) create milestone activity records on submit.
Notification emails ("New milestone submission from Norcal SBDC Milestones - Step 2")
go to phelps@, cameronr@jordancrown.com, neoserra@norcalsbdc.org; success notifications
("New Milestone Submitted") go to the counselor + center director. **That plugin code
is not in this repo** — it lives on the WordPress site (Jordan Crown involvement
suggested by the notification recipients).

**In this repo (Next.js rewrite):** `src/components/milestones/` — a consolidated
wizard (`MilestoneWizard.tsx`, `milestones-api.ts`, steps) that calls a FastAPI backend
(`sbdc-advisor`, via `BACKEND_URL` proxy at `src/app/api/[...path]/route.ts`) exposing:

- `POST /api/milestones/lookup` (email → contact + clients)
- `POST /api/milestones/lookup-by-id` (deep-link)
- `POST /api/milestones/submit`
- `GET /api/milestones/log` (feeds the existing admin viewer at `/milestone-log`)

The lookup/validation/matching logic that produces "email is not valid" lives in the
backend (and/or the WP plugin) — **not** in this repo.

**Known Neoserra API behaviors already documented in-repo:**

- `src/lib/validate.ts` — Neoserra hard-rejects malformed emails
  ("Improperly formed email address in list") and kills the whole record creation.
- `docs/session-notes-integration.md` — Neoserra *hangs silently* on malformed payloads;
  the **System Administration → API Audit Trail** in Neoserra shows received vs.
  processed payloads and is the ground truth for what Neoserra actually got.
- The milestone `ContactLookupStep` does **not** run `isValidEmail()` client-side
  (every other public form in this repo does) — malformed input passes through and
  fails downstream.

## 2. Failure taxonomy (what "an API error" can actually be)

Each class needs to be distinguishable in the logs; today they all collapse into
"email is not valid" or silence:

| # | Class | Where it happens | Example |
|---|-------|------------------|---------|
| 1 | **Lookup no-match** | Backend/plugin → Neoserra contact search | Email in Neoserra differs (alias, typo, case, whitespace, secondary contact email vs. client email) |
| 2 | **Lookup match but filtered out** | Backend/plugin business rules | Client status (inactive/pre-client), center scoping, missing counselor, contact-without-client |
| 3 | **Ambiguous match** | Backend/plugin | Multiple contacts/clients on one email; handler picks none |
| 4 | **Neoserra validation rejection** | Neoserra on write | "Improperly formed email address in list" — one bad field kills the record |
| 5 | **Neoserra silent hang** | Neoserra on write | Malformed payload → no response; times out client-side |
| 6 | **Auth / infra** | Any hop | Expired API key, WP plugin update, timeout, 5xx |
| 7 | **Partial success** | Submit creates N of M records | Milestone created, notification failed (or vice versa) |

Sophie's "for the last week or so" suggests a **regression**, not a data problem:
something changed ~June 29 (plugin/WP update, Neoserra release, API key rotation,
lookup query change). The system must make that visible — a failure-rate-over-time
view answers "when did this start?" instantly.

## 3. The troubleshooting system — five layers

### Layer 1 — Capture (correlation-ID structured logging at every hop)

The core deliverable. For **every** lookup and submit, log a structured record:

- Correlation ID (GF entry ID on the WP path; generated UUID on the backend path)
- Timestamp, flow step (`lookup` / `lookup-by-id` / `submit`), source (WP vs. wizard)
- Input as submitted (email/name/phone, normalized + raw)
- Exact Neoserra request: URL, method, payload
- Exact Neoserra response: status, body, latency (or "timeout after Ns")
- Outcome classification from the taxonomy above (1–7)
- What the end user was shown (the error string they saw)

WP side: enable Gravity Forms logging, and add request/response logging to the plugin's
Neoserra calls (WP DB table or forward to the backend's log endpoint so both paths land
in one place). Backend side: extend the existing milestone log schema
(`MilestoneLogEntry` already has `errors[]` and `details[]`) to include the raw
Neoserra exchange and the taxonomy class.

### Layer 2 — Single store

One queryable log for both paths (the FastAPI backend's existing milestone log is the
natural home; WP posts into it). Retention ≥ 90 days. Searchable by email, client ID,
date, outcome class.

### Layer 3 — Dashboard (extend `/milestone-log`)

The admin viewer already shows recordsCreated, a "With Errors" KPI, and per-entry
errors. Extend it with:

- **Lookup failures** — today only submissions are logged; failed lookups (the Marilyn
  Zimmers case!) never reach the log because the user never gets past step 1. This is
  the single biggest visibility gap.
- Failure-rate-over-time chart (spot regressions), breakdown by taxonomy class
- Search by client email → full trace of every attempt with raw request/response
- Link out to the Neoserra client record and API Audit Trail entry

### Layer 4 — Alerting

- Immediate email/Slack on outcome classes 4–6 (validation rejection, hang, auth/infra)
  with the correlation ID and raw response attached
- Daily digest of class 1–3 lookup failures (these are often data issues, not bugs, but
  a spike means a regression)
- Threshold alert: lookup failure rate > X% over 24h → page Aaron. Centers should
  never be the monitoring system — today Sophie discovered the outage, a week in.

### Layer 5 — Self-serve diagnostic tool ("why can't this client get in?")

A password-gated admin page (alongside `/milestone-log`): enter a client email →
runs the real lookup chain live and shows each step's raw result:

1. What Neoserra returns for that email (contacts found, each contact's client links)
2. Which business rules pass/fail (status, center, counselor) with the specific reason
3. Verdict in plain language: "No contact record has this exact email — Neoserra has
   m.zimmers1207@gmail.com" or "Contact found but client 289551 status is Inactive"

This turns Carrie's "there are no duplicates in Neo so I'm not sure what the issue
could be???" into a 30-second self-serve answer, and doubles as the playbook engine
for center staff tickets.

## 4. Immediate triage of the Zimmers case (Phase 0, and the design probe)

Working the live case first validates the design — whatever steps are needed manually
here are exactly what Layer 5 automates:

1. Neoserra: pull the contact + client record for CHI0017729 / mzimmers1207@gmail.com.
   Check: exact email on the **contact** record (not just the client record), leading/
   trailing whitespace, client status, center assignment, multiple contact records.
2. Neoserra API Audit Trail: find the lookup requests from the last week — what was
   received, what was returned.
3. Reproduce the lookup directly against the Neoserra API with the same query the
   plugin/backend issues; compare with a known-good email.
4. Check what changed ~June 29: WP plugin updates, Neoserra release notes, API key.
5. Classify the failure against the taxonomy; that becomes the first documented
   playbook entry.

## 5. Access needed (blockers to confirm)

- WordPress admin + the GF/Neoserra plugin source (or confirmation Jordan Crown owns it)
- `sbdc-advisor` FastAPI backend repo (lookup/submit handlers)
- Neoserra admin access for the API Audit Trail
- Read-only Neoserra API key for the diagnostic tool / manual repro
- Confirmation of which path is authoritative going forward (GF vs. Next.js wizard) —
  if the wizard is replacing GF soon, Layers 1–5 build on the backend only and WP gets
  minimal instrumentation

## 6. Phasing

| Phase | Scope | Outcome |
|-------|-------|---------|
| 0 | Manual triage of Zimmers case | Root cause + first playbook entry |
| 1 | Layer 1 + 2: capture failed lookups + raw Neoserra exchanges into one log | Every future ticket is diagnosable from the log |
| 2 | Layer 3 + 4: dashboard extensions + alerting | Regressions surface in hours, not weeks |
| 3 | Layer 5 + playbook: self-serve diagnostic page + documented failure classes | Carrie/centers resolve most tickets without engineering |
