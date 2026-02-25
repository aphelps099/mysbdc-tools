# SBDC Advisor AI — Feature Roadmap

**NorCal Small Business Development Center**
**Planned Features & Enhancements**

Last updated: February 2026

---

## Overview

This document tracks planned features for the SBDC Advisor AI platform, organized by priority and domain. Each feature includes a description, rationale, and preliminary implementation notes.

---

## 1. Guided Prompt Narratives (Custom GPT-like Scripting)

**Priority: High**
**Status: Planned**

### Description

Multi-step, scripted prompt experiences that guide users through a structured narrative — one step at a time. Unlike the existing workflow engine (which is advisor-facing), these are designed as polished, client-facing experiences with validation checkpoints at each stage.

### How it works

```
Step 1: "Tell me about your business"
  → User responds
  → AI validates: Did they mention industry, stage, and location?
  → If incomplete: "I noticed you didn't mention [X]. Can you tell me more about that?"
  → If complete: Summarize back, confirm, advance

Step 2: "What are your goals for the next 12 months?"
  → User responds
  → Checkpoint: AI categorizes goals (revenue, hiring, funding, operations)
  → Present categorized summary for confirmation

Step 3: "Let's talk about your biggest challenges"
  → ...continues through narrative arc

Final: Generate structured output (action plan, assessment, referral packet)
```

### Key differentiators from current workflows

| Current workflows | Guided narratives |
|------------------|-------------------|
| Linear step progression | Branching logic based on responses |
| Advisor-facing | Client-facing (simpler, friendlier tone) |
| Text-only | Can include selection chips, progress indicators |
| No validation | AI validates each response before advancing |
| Single output | Checkpoint summaries at each stage |

### Implementation notes

- Extend the existing `workflows/*.json` schema with:
  - `validation_criteria` per step (what the AI checks for)
  - `branching_rules` (if user says X, go to step Y)
  - `checkpoint_prompt` (summarize and confirm before advancing)
  - `output_template` (structured final deliverable)
- Frontend: dedicated narrative UI mode with progress bar, step cards, confirmation modals
- Backend: stateful conversation with step tracking, validation prompts injected into system context

### Example narratives

| Narrative | Steps | Output |
|-----------|-------|--------|
| Business Assessment | 6 | Structured assessment report |
| Funding Readiness Check | 5 | Readiness scorecard + referral |
| Startup Feasibility | 7 | Feasibility summary + next steps |
| Export Readiness | 5 | Export plan outline |
| Disaster Preparedness | 4 | Continuity checklist |

---

## 2. Internal Documents for Local RAG

**Priority: High**
**Status: Planned**

### Description

A managed document library for network-internal resources that feeds the RAG pipeline. Unlike the current upload-per-session approach, this provides a persistent, curated knowledge base that admins maintain and all advisors benefit from.

### Features

- **Admin document manager**: Upload, tag, version, and retire documents
- **Categories**: Playbooks, intake templates, compliance guides, lender sheets, success stories
- **Auto-indexing**: Documents are chunked and embedded on upload
- **Versioning**: When a document is updated, old embeddings are replaced
- **Visibility controls**: Network-wide (all advisors) vs. admin-only
- **Freshness indicators**: Show when a document was last updated, flag stale content

### Implementation notes

```
documents/
  ├── playbooks/
  │   ├── intake-checklist-v3.pdf
  │   └── advising-framework.md
  ├── compliance/
  │   ├── 2-cfr-200-summary.pdf
  │   └── pii-handling-policy.md
  ├── lenders/
  │   └── norcal-lender-directory-2026.csv
  └── templates/
      ├── success-story-template.md
      └── client-action-plan.md
```

- Migrate from per-session uploads to a persistent document store
- Admin UI: drag-and-drop upload, tagging interface, version history
- Background job: re-embed on document update, purge old vectors
- RAG retrieval: always includes persistent docs + any session-uploaded docs

---

## 3. Voice Recording & Transcription + Template Application

**Priority: High**
**Status: Planned**

### Description

Two-part feature:

**Part A — Voice Recording & Transcription**
Advisors record client sessions (in-person or phone) directly in the app. Audio is transcribed in real-time or post-recording.

**Part B — Template Application**
The transcription is automatically processed through templates to generate structured outputs — session notes, action items, CRM entries, follow-up emails.

### Voice recording flow

```
1. Advisor clicks "Record" in chat or dedicated recording view
2. Browser MediaRecorder API captures audio
3. Audio streamed or uploaded to backend
4. Whisper API (or local whisper.cpp) transcribes
5. Transcript appears in chat as a message
6. Advisor can edit transcript before processing
```

### Template application flow

```
1. Transcription complete
2. Advisor selects template: "Session Notes", "Client Action Plan", "CRM Entry"
3. AI processes transcript through template prompt
4. Structured output generated
5. Advisor reviews, edits, exports
```

### Templates

| Template | Input | Output |
|----------|-------|--------|
| Session Notes | Raw transcript | Formatted meeting notes with key topics, decisions, action items |
| Client Action Plan | Raw transcript | Numbered action items with owners and deadlines |
| CRM Entry (Neoserra) | Raw transcript | Structured fields matching Neoserra session record format |
| Follow-Up Email | Raw transcript | Professional email summarizing session and next steps |
| SBA Milestone Report | Raw transcript | SBA-formatted milestone/outcome documentation |

### Implementation notes

- Frontend: `MediaRecorder` API with audio visualization (waveform)
- Backend: OpenAI Whisper API (`whisper-1`) or self-hosted `whisper.cpp`
- Storage: Audio files stored temporarily (or permanently if compliance requires)
- Template prompts: Extend prompt library with "transcription templates" category
- Cost: Whisper API is $0.006/minute — a 30-minute session costs ~$0.18

---

## 4. SBA & Lending Data Integration

**Priority: High**
**Status: Planned**

### Description

Live, structured access to SBA loan programs, SSBCI options, grant funding, and lender registries — replacing static knowledge with real-time or regularly updated data.

### 4a. SBA API / Updated Loan Options

- Integrate SBA's public APIs for current loan program details
- 7(a), 504, microloans, disaster loans, Community Advantage
- Auto-update when program terms, rates, or limits change
- Display as structured cards in chat responses (not just text)

### 4b. SSBCI (State Small Business Credit Initiative) Loan Options

- State-level SSBCI program data
- California-specific: CalCAP, SSBCI 2.0 allocations
- Per-state data for multi-tenant deployment
- Program eligibility criteria, application links, contact info

### 4c. Grant Funding Options

- Curated database of relevant grant programs
- Federal (SBA, EDA, USDA), state, and local grants
- Eligibility filters: industry, business stage, demographics, location
- Freshness tracking: application deadlines, funding cycles

### 4d. Lender Registry (with Versioning)

- Structured lender database per SBDC network region
- Fields: lender name, loan types, typical amounts, industries served, SBA preferred status, contact info
- **Versioning**: Track changes over time (lender added/removed products, changed terms)
- Admin interface for network staff to maintain their regional registry
- AI can reference lender data in recommendations

```json
{
  "lender": "Valley Republic Bank",
  "region": "norcal",
  "products": [
    {
      "type": "SBA 7(a)",
      "min_amount": 50000,
      "max_amount": 5000000,
      "typical_terms": "10-25 years",
      "industries": ["all"],
      "updated_at": "2026-01-15"
    }
  ],
  "sba_preferred": true,
  "contact": {
    "name": "Jane Smith",
    "email": "jsmith@vrbank.com",
    "phone": "530-555-0100"
  },
  "version": 3,
  "last_verified": "2026-02-01"
}
```

### Implementation notes

- Backend: dedicated `lending/` module with data models
- Data sources: SBA API, manual entry (admin UI), CSV import
- Caching: refresh SBA data daily, lender registry on admin update
- RAG integration: lender and program data available as context for chat
- Display: structured cards with "last updated" badges, not just prose

---

## 5. Lender Readiness & Referral System

**Priority: Medium-High**
**Status: Planned**

### Description

An automated assessment that evaluates a client's readiness for lending, scores their preparedness, identifies gaps, and generates a warm referral to the appropriate lender — all within the platform.

### Flow

```
┌──────────────────────────────────────────────────────────┐
│  1. ASSESSMENT (Guided Narrative — see Feature #1)       │
│     - Business basics (revenue, time in business, NAICS) │
│     - Funding need (amount, purpose, timeline)           │
│     - Financial docs status (tax returns, P&L, balance)  │
│     - Credit overview (self-reported range)              │
│     - Collateral availability                            │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────────────┐
│  2. READINESS SCORECARD                                  │
│     ┌─────────────────────────────────┐                  │
│     │  Lender Readiness Score: 72/100 │                  │
│     ├─────────────────────────────────┤                  │
│     │  Financial Docs      ██████░░  75%                │
│     │  Credit Profile      █████░░░  62%                │
│     │  Business History    ████████  100%               │
│     │  Loan Package        █████░░░  65%                │
│     │  Collateral          ██████░░  80%                │
│     └─────────────────────────────────┘                  │
│     Gaps: Missing 2024 P&L, no personal financial stmt   │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────────────┐
│  3. GAP REMEDIATION                                      │
│     - Action items to close gaps                         │
│     - Links to templates (P&L template, PFS form)        │
│     - Estimated time to readiness                        │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────────────┐
│  4. LENDER MATCHING                                      │
│     Based on: loan type, amount, industry, credit range  │
│     Matches from Lender Registry (Feature #4d)           │
│     "Based on your profile, these 3 lenders are a fit:"  │
│     - Valley Republic Bank (SBA 7(a), up to $5M)         │
│     - Tri Counties Bank (SBA 504, real estate)           │
│     - Kiva (microloan, $0-$15K, no credit minimum)       │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────────────┐
│  5. REFERRAL GENERATION                                  │
│     - Pre-filled referral email/form                     │
│     - Client summary for the lender                      │
│     - Advisor cc'd on referral                           │
│     - Referral tracked in system for follow-up           │
└──────────────────────────────────────────────────────────┘
```

### Implementation notes

- Builds on features #1 (guided narratives), #4d (lender registry)
- Scoring model: weighted criteria, configurable per network
- Referral tracking: new `referrals` table (client, lender, date, status, outcome)
- Network admins configure scoring weights and lender matching rules
- Export: PDF readiness report, referral packet

---

## 6. Gmail Integration

**Priority: Exploratory**
**Status: Under Consideration**

### Description

Integration with Gmail for advisors to draft, send, and manage client communications directly from the platform.

### Potential capabilities

| Capability | Description |
|-----------|-------------|
| Draft from transcript | Generate follow-up email from voice transcript (Feature #3) |
| Draft from chat | "Email this to my client" button on chat responses |
| Send via Gmail API | Send directly from advisor's Gmail account |
| Template emails | Pre-built email templates for common advisor communications |
| Thread tracking | Link email threads to client sessions |

### Open questions

- **OAuth complexity**: Each advisor needs to authorize their Gmail account — adds UX friction and ongoing token management
- **Google Workspace vs. personal Gmail**: SBDC networks may use either. Workspace admins need to approve the OAuth app
- **Compliance**: Email content may contain client PII — need clear data handling policies
- **Alternatives**: Would a "copy to clipboard" + email template approach achieve 80% of the value with 10% of the complexity?
- **CRM overlap**: Neoserra already handles some client communication tracking — avoid duplication

### If we proceed

- Google OAuth 2.0 with `gmail.send` and `gmail.compose` scopes
- Minimal permissions — send only, no inbox reading
- Server-side token storage with encryption
- Advisor can preview and edit every email before sending
- All sent emails logged in platform for audit trail

### Simpler alternative (recommended as V1)

Instead of full Gmail integration, start with:
1. "Copy as email" button on chat responses and transcription outputs
2. Pre-formatted with subject line, greeting, body, signature
3. Opens user's default mail client via `mailto:` link with pre-filled content
4. Zero OAuth, zero token management, works with any email provider

---

## Feature Dependency Map

```
                    ┌──────────────────────┐
                    │ 1. Guided Narratives │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
┌─────────────────┐  ┌─────────────┐  ┌────────────────────┐
│ 5. Lender       │  │ 3. Voice +  │  │ 2. Internal Docs   │
│    Readiness &  │  │    Template │  │    for Local RAG   │
│    Referral     │  └──────┬──────┘  └────────────────────┘
└────────┬────────┘         │
         │                  ▼
         │         ┌─────────────────┐
         │         │ 6. Gmail        │
         │         │    Integration  │
         │         │    (optional)   │
         │         └─────────────────┘
         │
         ▼
┌─────────────────┐
│ 4. SBA & Lending│
│    Data         │
└─────────────────┘
```

### Build order (recommended)

1. **Guided Narratives** — foundational pattern used by Features 5
2. **Internal Docs / RAG** — immediate value for all advisors, independent of other features
3. **Voice + Transcription** — high-impact, standalone
4. **SBA & Lending Data** — prerequisite for lender matching
5. **Lender Readiness & Referral** — capstone feature combining 1 + 4
6. **Gmail** — exploratory, start with clipboard/mailto approach

---

## Contact

**Aaron Phelps**
Marketing & Technology Director
NorCal SBDC
[linkedin.com/in/aaroncphelps](https://linkedin.com/in/aaroncphelps)

---

*Copyright 2026 NorCal SBDC. All rights reserved.*
