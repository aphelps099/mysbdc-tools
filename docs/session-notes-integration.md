# Session Notes → Neoserra Integration

## What We Built

A 5-step wizard that takes raw counseling session notes and submits structured records directly to Neoserra CRM — replacing the manual copy-paste workflow.

### The Flow

```
1. Client Lookup     → Counselor enters client email, system finds Neoserra contact
2. Select Client     → Pick the correct business from linked client records
3. Session Details   → Date, duration, type, counseling area, funding source
4. AI Formatting     → Paste raw notes or transcript → Claude structures into 4 SBDC sections
5. Review & Submit   → Edit if needed → POST to Neoserra counseling API
```

### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/session-notes/submit/route.ts` | Neoserra counseling POST (the core integration) |
| `src/app/api/session-notes/ai-format/route.ts` | Claude Haiku formats raw notes into 4 sections |
| `src/components/session-notes/types.ts` | All Neoserra coded values, form types, step definitions |
| `src/components/session-notes/SessionNotesWizard.tsx` | Main wizard container |
| `src/components/session-notes/steps/` | Individual step components |
| `src/components/session-notes/session-notes-api.ts` | Client-side API helpers |

---

## Neoserra Counseling API — What Actually Works

The Neoserra REST API documentation describes field types and valid codes, but **does not clearly document the exact payload format**. Here's what we learned through trial and error.

### Endpoint

```
POST {NEOSERRA_BASE_URL}/api/v1/counseling/new
Authorization: Bearer {NEOSERRA_API_KEY}
Content-Type: application/json
```

### Correct Payload Format

```json
{
  "clients": "402570",
  "contacts": "510560",
  "counselors": [
    {
      "counselor": "6623",
      "prep": "0.2",
      "travel": "0"
    }
  ],
  "contact": "1.0",
  "date": "2026-03-16",
  "type": "F",
  "contactType": "VC",
  "sbaArea": "2",
  "text": "Session subject line",
  "fundarea": "S",
  "centerId": "107",
  "nbrpeople": "1",
  "memo": "Full session notes go here...",
  "isReportable": "true",
  "language": "EN",
  "covid19": "false"
}
```

### Critical Format Details

These are the things that **broke the integration** when we got them wrong. Neoserra silently hangs on malformed payloads — no error, no response, just "Incoming" status in the audit trail forever.

| Field | What the docs imply | What actually works |
|-------|---------------------|---------------------|
| `clients` | "ClientsList" → suggests array | **Plain string** `"402570"` |
| `contacts` | "ContactsList" → suggests array | **Plain string** `"510560"` |
| `counselors` | "CounselorList" → suggests array of IDs | **Array of objects** `[{counselor, prep, travel}]` |
| Duration | `contactDuration` in H:MM | Field is actually **`contact`** in **decimal hours** (`"1.0"` = 1 hour) |
| URL path | `/api/v1/counseling` | Must be **`/api/v1/counseling/new`** |

### Relationship Linking

Before creating a counseling record, ensure the client↔contact relationship exists:

```
POST {NEOSERRA_BASE_URL}/api/v1/relationships/{clientId}/{contactId}
Body: {}
```

This is idempotent — calling it when the relationship already exists returns success.

### Mandatory Fields

| Neoserra Field | Type | Description | Example |
|----------------|------|-------------|---------|
| `contact` | Decimal hours | Session duration | `"1.0"` |
| `date` | Date | Session date | `"2026-03-16"` |
| `type` | Selection | Session type: `I` (Initial), `F` (Follow-up), `A` (Administrative) | `"F"` |
| `contactType` | Selection | Contact method: `VC`, `PH`, `ON`, `AT`, `EM` | `"VC"` |
| `sbaArea` | Selection | Counseling area (see coded values in `types.ts`) | `"2"` |
| `text` | String | Session subject line | `"Business plan review"` |
| `fundarea` | Selection | Funding source (see coded values in `types.ts`) | `"S"` |
| `centerId` | String | SBDC center ID | `"107"` |
| `nbrpeople` | String | Number of attendees | `"1"` |

### All Coded Values

All valid codes for selection fields (session type, contact type, counseling area, funding source) are maintained in:

```
src/components/session-notes/types.ts
```

These match the Neoserra database configuration and can be updated if the admin changes field requirements.

---

## AI Formatting Engine

The `/api/session-notes/ai-format` endpoint takes raw text (meeting notes, transcript, bullet points) and structures it into 4 SBDC-compliant sections:

| Section | Purpose |
|---------|---------|
| **Description** | What occurred during the session |
| **Analysis** | The business problem being addressed |
| **Actions Taken** | Steps taken during the session to solve the problem |
| **Follow-Up** | Action items before the next session |

The AI also generates a concise subject line from the content.

**Model:** Claude Haiku (fast, low-cost — suitable for formatting tasks)

**Input flexibility:** The raw notes can be anything — bullet points, a Zoom AI summary, a full transcript, or even voice-to-text output. The AI normalizes it all into the same 4-section structure.

---

## Lessons Learned

1. **Neoserra hangs silently on bad payloads.** No HTTP error, no response body — just an eternal "Incoming" status in the API audit trail. Always use a timeout (we use 30s with AbortController).

2. **The API docs describe field types, not payload format.** "ClientsList" does NOT mean send an array. You need the official API examples to get the exact JSON shape right.

3. **The duration field name is wrong in the docs listing.** The property table says `contactDuration` but the actual field the API accepts is `contact`, in decimal hours.

4. **POST URL must include `/new`.** The resource template shows `/{Counseling Reference}` — for creating new records, that reference is literally the word `new`.

5. **Always ensure relationships first.** The client↔contact relationship must exist before the counseling record can reference both. Call the relationships endpoint first.

6. **The API audit trail is your best debugging tool.** Check `System Administration > API Audit Trail` in Neoserra to see what the server received vs what it processed.
