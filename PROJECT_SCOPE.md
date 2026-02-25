# SBDC Advisor AI — Project Scope

**NorCal Small Business Development Center**
**AI-Powered Advisory Platform**

Last updated: February 2026 | 69 commits | Production on Railway

---

## Overview

SBDC Advisor AI is a full-stack conversational AI platform built for small business advisors and clients across the Northern California SBDC network. It combines a RAG-enabled chat interface with a curated prompt library, document ingestion, event integration, workflow automation, and session analytics — all behind a clean, branded UI.

The platform runs as two services on Railway: a Next.js 15 frontend and a FastAPI backend, communicating over SSE streaming through a same-origin API proxy.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  Next.js 15 (React 19, Tailwind 4, TypeScript)          │
│  ┌──────────┬──────────┬──────────┬──────────────────┐  │
│  │ Chat     │ Prompts  │ Events   │ Analytics Dash   │  │
│  │ (SSE)    │ Library  │ Feed     │ (password-gated) │  │
│  └────┬─────┴────┬─────┴────┬─────┴────┬─────────────┘  │
│       │          │          │          │                 │
│       └──────────┴──────────┴──────────┘                 │
│                      │                                   │
│           /api/* proxy route (same-origin)               │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│  FastAPI Backend (Uvicorn)                               │
│  ┌───────────┬────────────┬────────────┬──────────────┐ │
│  │ LLM Client│ RAG Service│ Workflow   │ Analytics    │ │
│  │ (OpenAI / │ (ChromaDB +│ Engine     │ (SQLite +    │ │
│  │  Ollama)  │ MiniLM-L6) │ (JSON)     │  ip-api.com) │ │
│  └───────────┴────────────┴────────────┴──────────────┘ │
│  ┌───────────┬────────────┬────────────┬──────────────┐ │
│  │ Auth      │ Prompts    │ Documents  │ Events       │ │
│  │ (JWT)     │ (JSON lib) │ (Upload +  │ (WordPress   │ │
│  │           │            │  Chunking) │  REST API)   │ │
│  └───────────┴────────────┴────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.1 (App Router) |
| UI | React 19 |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 4.0 + CSS custom properties |
| Markdown | react-markdown 10 + remark-gfm 4 |
| Fonts | GT America (sans), Tobias (serif), GT America Mono |

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.115+ |
| Server | Uvicorn |
| LLM | OpenAI SDK (gpt-4o-mini default, gpt-4o complex) |
| Alternate LLM | Ollama (env var swap, no code changes) |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Vector store | ChromaDB 0.5+ |
| Database | SQLite (sessions, token usage) |
| Document processing | LangChain, Unstructured, PyPDF |
| Events | WordPress REST API + httpx + BeautifulSoup4 |

### Infrastructure
| Layer | Technology |
|-------|-----------|
| Hosting | Railway (two services) |
| Build | Railpack (backend), Next.js build (frontend) |
| API proxy | Next.js catch-all route → backend (eliminates CORS) |
| Health check | GET /api/health (300s timeout) |
| Restart policy | ON_FAILURE, 5 retries |

---

## Features

### 1. Chat Interface
- SSE streaming from OpenAI (or Ollama) with real-time token rendering
- RAG-augmented responses — uploaded documents are automatically injected as context
- Conversation history maintained per session
- Auto-compliance footer on sensitive topics (PII, financial, legal, SBA)
- Token usage logging to SQLite (model, provider, input/output tokens, duration)
- Welcome state with quick-start prompt chips
- Markdown rendering with GFM tables, code blocks, lists

### 2. Prompt Library
- 50+ curated prompts across 4 categories: advising, admin, training, marketing
- Tabbed browsing with category counts
- Prompt Composer modal — detects `[BRACKETED PLACEHOLDERS]` in templates
  - Auto-generates input fields (short → text input, long → textarea)
  - Live preview with color-coded tokens (green = filled, blue = pending)
  - Progress bar
- Quick-start chips on the welcome screen map to prompts
- Link to official Prompt House (password-protected external deployment)

### 3. Document Upload & RAG
- Drag-and-drop or button upload in chat input area
- Supported formats: .txt, .pdf, .md, .html, .csv, .doc, .docx
- Automatic chunking: 1000 chars, 200 overlap (RecursiveCharacterTextSplitter)
- Vector embedding via all-MiniLM-L6-v2 → ChromaDB
- Top-4 retrieval injected into user messages when RAG is enabled
- Document count displayed in sidebar with "indexed" badge
- Upload status toast (uploading → success → error)

### 4. Workflow Engine
- JSON-defined multi-step guided conversations
- Active workflow: **Success Story Builder** (SBA reporting format)
- State tracking: completed steps, collected data, current position
- System prompt injection with step context, objectives, and questions
- Navigation commands: "next" (advance), "quit" (cancel)
- Discovery: auto-scans workflows/*.json directory

### 5. Events Feed
- Pulls live events from WordPress REST API (Crown Events plugin)
- Basic Auth with WordPress Application Password
- Filters to future events, deduplicates syndicated entries
- 15-minute server-side cache
- Client-side: localStorage cache with 10-minute TTL, all events preloaded
- Event cards: center, title, date/time, summary, cost badge
- Actions: "Generate Promo" (marketing copy via LLM), "Learn More" (summary via LLM)
- Pagination (5 per page), external link confirmation

### 6. Analytics Dashboard
- Password-protected secondary gate (separate from login)
- KPIs: total sessions, unique visitors, average duration
- Daily sessions bar chart with time range selector (7d / 14d / 30d / 90d)
- Top countries and cities breakdown
- Privacy-first: IPs hashed (SHA-256, never stored raw), geo via ip-api.com
- Session heartbeat: fires on mount + every 60 seconds + on tab close

### 7. AI Policy & Compliance
- Two-column modal: Approved uses vs. Prohibited actions
- Approved: ChatGPT Teams, Notebook LM, communications, training, optimization
- Prohibited: client PII in unapproved tools, replacing human judgment, unverified facts
- Compliance note referencing 2 CFR 130
- Auto-footer on chat responses touching sensitive topics (25+ trigger keywords)

### 8. Onboarding
- Spotlight-based guided tour (6 steps with SVG mask cutouts)
- Walks through: AI Policy, New Chat, Workflows, Events, Chat Window, Prompt Library
- Keyboard navigation (Escape, ArrowRight, ArrowLeft)
- Runs once per browser (localStorage flag)

### 9. About Menu
- Floating hamburger icon (top-right, staggered rounded lines)
- Full-screen overlay: navy gradient, grain texture, glass blur
- Left-aligned layout with large left margin
- Logo, platform blurb, links (norcalsbdc.org, Prompt House), contact info
- Aaron Phelps | Marketing & Technology Director | LinkedIn

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Password login → JWT token (24h expiry) |

### Chat
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/chat | SSE streaming chat (RAG-augmented, workflow-aware) |

### Prompts
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/prompts | Full prompt library with categories |

### Workflows
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/workflows/ | Discovered workflow metadata |

### Documents
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/documents/ | List indexed documents + chunk counts |
| POST | /api/documents/upload | Upload and ingest document into RAG |

### Events
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/events | Paginated events from WordPress |
| GET | /api/events/debug | Raw WP API diagnostics |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/analytics/heartbeat | Record session heartbeat (unauthenticated) |
| GET | /api/analytics/dashboard | Dashboard stats (authenticated) |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Status, model, provider, document count |
| GET | /api/test-llm | LLM API key connectivity test |

---

## LLM Configuration

The platform supports hot-swapping LLM providers via environment variables:

```bash
# OpenAI (default)
LLM_PROVIDER=openai
MODEL_NAME=gpt-4o-mini
MODEL_NAME_COMPLEX=gpt-4o
OPENAI_API_KEY=sk-...

# Ollama (zero code changes)
LLM_PROVIDER=ollama
MODEL_NAME=llama3
OLLAMA_BASE_URL=http://localhost:11434/v1
```

The LLM client uses the OpenAI SDK for both providers — Ollama exposes an OpenAI-compatible API. Any inference server that implements the OpenAI chat completions spec (vLLM, LM Studio, text-generation-inference) can be used with the same env var swap.

For non-OpenAI-compatible providers (Anthropic, Google, etc.), only `llm_client.py` needs modification. The RAG pipeline, streaming SSE, frontend, and logging are all provider-agnostic.

---

## Environment Variables

### Backend (required)
| Variable | Default | Description |
|----------|---------|-------------|
| OPENAI_API_KEY | — | OpenAI API key |
| APP_PASSWORD | sbdc2026 | Login password |
| JWT_SECRET | sbdc-dev-secret... | Token signing secret |
| WP_APP_PASSWORD | — | WordPress Application Password for events |

### Backend (optional)
| Variable | Default | Description |
|----------|---------|-------------|
| LLM_PROVIDER | openai | LLM provider (openai / ollama) |
| MODEL_NAME | gpt-4o-mini | Default model |
| MODEL_NAME_COMPLEX | gpt-4o | Complex task model |
| OLLAMA_BASE_URL | http://localhost:11434/v1 | Ollama endpoint |
| JWT_EXPIRY_HOURS | 24 | Token lifetime |
| CORS_ORIGINS | http://localhost:3000 | Allowed origins |
| WP_BASE_URL | https://www.norcalsbdc.org | WordPress site |
| WP_APP_USER | AI-events | WordPress API user |

### Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| BACKEND_URL | — | Backend URL (runtime, set on Railway) |

---

## Database Schema

### SQLite: token_usage
Tracks every LLM call for cost monitoring.
```
id, timestamp, model, provider, input_tokens, output_tokens,
total_tokens, duration_ms, has_workflow, workflow_id
```

### SQLite: sessions
Tracks visitor sessions for analytics.
```
id, ip_hash, first_seen, last_seen, duration_sec,
country, region, city, timezone, user_agent
```

### ChromaDB: sbdc_documents
Vector store for uploaded documents. Each chunk stores:
```
embedding (384-dim), metadata: { source, title, chunk }
```

---

## Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| --navy | #0f1c2e | Sidebar, dark backgrounds |
| --royal | #1D5AA7 | Primary accent, links, focus rings |
| --pool | #8FC5D9 | Secondary accent, hover states |
| --cream | #f0efeb | User message bubbles, light fills |
| --brick | #a82039 | Destructive actions, admin category |

### Typography
| Token | Font | Usage |
|-------|------|-------|
| --sans | GT America | Primary UI text (300/400/500/700) |
| --serif | Tobias | Display headings, prompt titles |
| --mono | GT America Mono | Labels, kickers, code |

### Animation
| Token | Value | Usage |
|-------|-------|-------|
| --ease | cubic-bezier(0.16, 1, 0.3, 1) | All transitions |
| --duration-fast | 150ms | Hover states |
| --duration-normal | 250ms | Standard transitions |
| --duration-slow | 400ms | Modal entrances |

---

## Development Timeline (69 commits)

| Phase | Commits | Milestone |
|-------|---------|-----------|
| 1. Foundation | 6b103e0 → 0eae50f | Initial commit, Railway deployment, CORS fix |
| 2. Stability | cd0473a → 2b0166d | Streaming timeout fixes, error handling, API diagnostics |
| 3. Core features | cd154a9 → cdde52e | Auth, guided tour, workflows, spotlight walkthrough |
| 4. Events & analytics | 9a197d7 → d65356d | Session tracking, analytics dashboard, WordPress events |
| 5. Polish | c24d94f → ebecd45 | Password-protected dashboard, event caching, pagination |
| 6. Prompt House | 1836c20 → f7a2de0 | Prompt House link, library redesign, document uploader |
| 7. About menu | a884a9d → dfa3546 | Full-screen about overlay, minimalist redesign |

---

## Contact

**Aaron Phelps**
Marketing & Technology Director
NorCal SBDC
[linkedin.com/in/aaroncphelps](https://linkedin.com/in/aaroncphelps)

---

*Copyright 2026 NorCal SBDC. All rights reserved.*
