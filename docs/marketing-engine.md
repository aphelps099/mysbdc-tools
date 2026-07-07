# Marketing Engine — setup & operations

The event promo pipeline: `norcalsbdc.org/events` → shortlink → copy → Google
Sheet (system of record + human QC gate) → Motion Pro video.

```
scan (hourly cron) ─→ new event? ─→ detail page ─→ Rebrandly shortlink
      │                                              │
      │                                              ▼
      │                                    Claude promo copy (tweet/linkedin/email)
      │                                              │
      ▼                                              ▼
   Sheet row  status=copy_ready  ──[HUMAN sets approved]──→  (Phase 3: render worker)
```

Status flow: `new → copy_ready → approved → video_ready → posted`.
Automation may set `copy_ready` and (Phase 3) `video_ready`. Only humans set
`approved` and `posted`.

## One-time setup (Aaron)

1. **Google Sheet.** Create a spreadsheet with a tab named exactly `Events`.
   Share it (Editor) with the service-account email — find it inside the JSON
   in `GOOGLE_SERVICE_ACCOUNT_KEY` (`client_email`). Put the spreadsheet ID in
   the `SHEET_ID` env var. The header row is written automatically on first
   scan. Recommended manual touch: Data → Data validation on the `status`
   column with the five states as a dropdown.
2. **Rebrandly.** Verify the `sbdc.events` domain is attached to the account,
   create an API key, set `REBRANDLY_API_KEY` (+ `REBRANDLY_DOMAIN=sbdc.events`).
3. **Service token.** `openssl rand -hex 32` → `PIPELINE_SERVICE_TOKEN` env var
   on Railway.
4. **Cron.** Add two GitHub repo secrets — `PIPELINE_APP_URL`
   (e.g. `https://tools.norcalsbdc.org`) and `PIPELINE_SERVICE_TOKEN` (same
   value as Railway) — and the included workflow
   (`.github/workflows/scan-events.yml`) scans hourly and refreshes click
   counts daily. Alternative: a Railway cron service running
   `curl -X POST $URL/api/pipeline/scan-events -H "Authorization: Bearer $TOKEN"`.
5. **First-run validation (important).** The scraper was built against a
   fixture, not the live theme. Before trusting output, open `/pipeline` and
   click **Dry run (parse only)** — it fetches the real events page and returns
   what it parsed without writing anything. If titles/dates/centers look wrong,
   the listing selectors in `src/lib/pipeline/scraper.ts` (and the fixture in
   `tests/fixtures/`) need a one-time adjustment to the real markup. Detail
   pages parse via JSON-LD Event schema, which is theme-independent.

## Routes (all under `/api/pipeline/`, service-token or admin-session auth)

| Route | What it does |
|---|---|
| `POST /scan-events` | Full run: discover → shortlink → copy → append rows |
| `POST /scan-events?dryRun=1` | Parse the live page, write nothing, return findings |
| `POST /refresh-clicks` | Pull Rebrandly click counts into `click_count` |
| `POST /ingest` | Stub: validates a NormalizedEvent payload (future push sources) |

Manual controls live at `/pipeline` (behind the normal app login).

## Sheet columns

`slug · center · title · start_date · start_time · end_time · format · language ·
event_url · rebrandly_link_id · shortlink · copy_tweet · copy_linkedin ·
copy_email · status · motion_deeplink · video_16x9 · video_9x16 · video_1x1 ·
project_json_url · click_count · approved_by · posted_at · notes · created_at ·
updated_at`

`motion_deeplink` opens Motion Pro with the storyboard pre-generated for that
event (`/motion/pro?url=…&generate=1`). The video columns stay empty until
Phase 3.

## Failure behavior

An event is never silently dropped: if the shortlink or copy step fails, the
row is still written with `status=new` and the error in `notes`. Re-runs are
idempotent — existing slugs are skipped, and slashtag collisions get `-2`/`-3`
suffixes. A partial run is a success with logged failures.

## Phase 3 (not built yet — do not start until 0–2 are stable in production)

Headless Chromium render worker: rows with `status=approved` → three MP4s
(16:9, 9:16, 1:1) + ProjectFile JSON → Drive folder per event → links written
back, `status=video_ready`. Known gotchas already documented in the porting
guide: Typekit domain allowlist, `--autoplay-policy=no-user-gesture-required`,
serial rendering only.
