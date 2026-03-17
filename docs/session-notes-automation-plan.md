# Session Notes Automation Plan

## Vision: Zoom Meeting → Neoserra (Zero Manual Entry)

After a counseling session on Zoom, the session note should be auto-generated and submitted to Neoserra with minimal counselor intervention — ideally a single "Approve" click.

---

## Current State (Manual)

```
Counselor finishes Zoom call
  → Opens mysbdc-tools session notes wizard
  → Types client email
  → Selects client / business
  → Fills session metadata (date, duration, type, area, funding)
  → Pastes Zoom AI summary or raw notes
  → AI formats into 4 SBDC sections
  → Reviews and submits to Neoserra
```

**Pain points:** Repetitive data entry. Most of the metadata (date, duration, client, contact type) is already known from the Zoom meeting itself.

---

## Target State (Automated)

```
Counselor finishes Zoom call
  → Zoom fires "meeting.ended" webhook
  → System auto-fetches transcript + meeting metadata
  → AI identifies client from participant emails
  → AI determines counseling area from transcript content
  → AI generates 4-section session notes
  → Draft queued for counselor review (notification sent)
  → Counselor opens dashboard → reviews → clicks "Approve"
  → Record submitted to Neoserra via existing API
```

**What changes:** The counselor reviews and approves instead of building from scratch.

---

## Architecture: 3 Phases

### Phase 1: Zoom Webhook + Transcript Fetch

**Goal:** Automatically capture meeting data when a counseling session ends.

**Zoom Setup:**
- Create a Zoom Server-to-Server OAuth app (or Webhook-only app) in the Zoom Marketplace
- Subscribe to the `meeting.ended` event
- Optionally subscribe to `recording.completed` for cloud recordings

**What the webhook provides:**
| Data | Source | Maps to |
|------|--------|---------|
| Meeting date/time | `meeting.ended` payload | `date` |
| Duration (minutes) | `meeting.ended` payload | `contact` (converted to decimal hours) |
| Participant emails | `meeting.ended` payload → participant list | Client lookup via existing Neoserra search |
| Host email | `meeting.ended` payload | Counselor mapping |
| Contact type | Always Zoom | `contactType: "VC"` (hardcoded) |
| Transcript | Zoom Cloud Recording API or AI Companion | Raw input for AI formatting |

**New files:**
```
src/app/api/webhooks/zoom/route.ts     — Webhook receiver + verification
src/lib/zoom.ts                        — Zoom OAuth client, transcript fetch
```

**New env vars:**
```
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_WEBHOOK_SECRET_TOKEN=
```

**Webhook flow:**
1. Zoom POSTs to `/api/webhooks/zoom`
2. Verify webhook signature (Zoom provides a secret token)
3. Extract meeting metadata (date, duration, participants, host)
4. If cloud recording exists, fetch transcript via Zoom API
5. Store as a "pending draft" for processing

---

### Phase 2: AI Pipeline (Transcript → Structured Notes)

**Goal:** Automatically generate complete session note drafts from Zoom data.

**Processing steps:**
1. **Client identification** — Match participant emails against Neoserra contacts (reuse existing `/api/milestones/lookup` endpoint). If multiple clients in the meeting, create separate drafts.

2. **Counselor mapping** — Map Zoom host email to Neoserra counselor ID. Maintain a simple lookup table (env var or config file):
   ```json
   {
     "aaron@mysbdc.org": { "counselorId": "6623", "centerId": "107" },
     "jane@mysbdc.org": { "counselorId": "7890", "centerId": "15" }
   }
   ```

3. **Metadata inference** — AI reads the transcript and determines:
   - **Counseling area** (`sbaArea`) — What topics were discussed? Map to nearest SBA code.
   - **Session type** — Check if client has prior counseling records → `F` (Follow-up) or `I` (Initial).
   - **Subject line** — One-line summary of the session.

4. **Note generation** — Pass transcript through existing `/api/session-notes/ai-format` endpoint to produce the 4 SBDC sections (Description, Analysis, Actions Taken, Follow-Up).

5. **Draft creation** — Store the complete draft with all fields pre-filled:
   ```json
   {
     "status": "pending_review",
     "clientId": "402570",
     "contactId": "510560",
     "counselorId": "6623",
     "centerId": "107",
     "sessionDate": "2026-03-17",
     "contactDuration": 60,
     "sessionType": "F",
     "contactType": "VC",
     "counselingArea": "2",
     "fundingSource": "S",
     "subject": "AI-generated subject",
     "sections": { ... },
     "zoomMeetingId": "abc123",
     "createdAt": "2026-03-17T18:00:00Z"
   }
   ```

**New files:**
```
src/lib/session-notes-pipeline.ts        — Orchestrates the full pipeline
src/app/api/session-notes/pending/route.ts — CRUD for pending drafts (GET, PATCH, DELETE)
```

---

### Phase 3: Review Dashboard + One-Click Approve

**Goal:** Give counselors a clean UI to review and approve AI-generated drafts.

**Dashboard features:**
- List of pending session note drafts, sorted by date
- Each card shows: client name, date, duration, AI confidence, subject
- Click to expand → see full 4-section notes + all metadata
- **Approve** → submits to Neoserra via existing `/api/session-notes/submit`
- **Edit** → inline edit any field or section before approving
- **Reject** → discard the draft (with optional reason)

**Notification options (pick one or more):**
- Email via Resend (already integrated) — "You have 3 session notes ready for review"
- Dashboard badge/count on the main nav
- Slack webhook (if the team uses Slack)

**New files:**
```
src/components/session-notes/PendingDashboard.tsx   — Dashboard UI
src/components/session-notes/PendingCard.tsx         — Individual draft card
```

---

## Alternative Input Sources

The pipeline should be modular — Zoom is the first input, but the same AI formatting + review flow works for any source:

| Source | Trigger | What it provides | Phase |
|--------|---------|-----------------|-------|
| **Zoom** | `meeting.ended` webhook | Transcript, duration, date, participant emails | Phase 1 |
| **Google Meet** | Google Calendar API / Workspace event | Meet transcript via Google Workspace API | Future |
| **Phone call** | Dialpad/RingCentral webhook, or manual trigger | Call recording → transcription | Future |
| **Email thread** | Forward to a dedicated inbox (e.g., `notes@mysbdc.org`) | Email body parsed as raw notes | Future |
| **Manual paste** | Current wizard (already built and working) | Raw text from any source | Done |

Each source feeds into the same pipeline at the "raw text + metadata" stage:

```
[Zoom webhook]  ──┐
[Google Meet]   ──┤
[Phone call]    ──┼──→  Raw transcript + metadata  ──→  AI pipeline  ──→  Pending draft  ──→  Review  ──→  Neoserra
[Email forward] ──┤
[Manual paste]  ──┘  (already built)
```

---

## Storage Decision

Pending drafts need to be stored somewhere between webhook receipt and counselor approval. Options:

| Option | Pros | Cons |
|--------|------|------|
| **JSON files on volume** | Simple, no DB setup, works with Railway volumes | No querying, no concurrency safety |
| **SQLite** | Single file, SQL queries, good for low volume | Needs a volume, not great for multiple instances |
| **Postgres** | Proper DB, scales, concurrent access | Requires a managed DB service |
| **Neoserra draft status** | Keep everything in CRM | Neoserra may not support draft/pending states |

**Recommendation:** Start with JSON files on the existing Railway volume (`TFG_DATA_DIR`). Move to SQLite or Postgres when the volume of pending drafts justifies it.

---

## Decisions to Make Before Starting

1. **Zoom plan** — Does the org have Zoom Pro (or higher) with cloud recording and/or AI Companion enabled? This determines whether transcripts are available via API.

2. **Counselor mapping** — How many counselors? Can we maintain a simple config file mapping Zoom email → Neoserra counselor ID + center ID?

3. **Funding source logic** — Can funding source be inferred from the counselor/center, or does it vary per session?

4. **Approval flow** — Dashboard only? Email notification? Both?

5. **Fallback for no transcript** — If Zoom recording is off, should the system still create a draft with metadata pre-filled (date, duration, client) and leave the notes blank for manual entry?

6. **Multiple clients per meeting** — Group counseling sessions have multiple clients. Create one draft per client, or one combined draft?

---

## Quick Win: Pre-Fill from Zoom AI Summary (No Webhook Needed)

Before building the full webhook pipeline, there's a simpler intermediate step:

1. Counselor copies the **Zoom AI Meeting Summary** after the call (Zoom already generates this)
2. Paste into the existing session notes wizard
3. The wizard auto-detects it's a Zoom summary and pre-fills metadata:
   - Date → from the summary header
   - Duration → from the summary header
   - Contact type → `VC` (it's a Zoom meeting)
   - Session type → `F` (default, editable)
4. AI formats the summary into 4 SBDC sections

This requires **zero new infrastructure** — just smarter parsing in the existing AI format step.

---

## Implementation Priority

```
Now     → Quick Win: Parse Zoom AI summary in existing wizard (no new infra)
Phase 1 → Zoom webhook + transcript fetch (needs Zoom app setup)
Phase 2 → AI pipeline + pending drafts storage
Phase 3 → Review dashboard + one-click approve
Future  → Google Meet, phone, email inputs
```
