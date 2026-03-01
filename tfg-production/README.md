# TFG Production

Tech Futures Group application system — a single-purpose Next.js deployment for startup intake, Neoserra CRM integration, email notifications, and AI-powered content generation.

## What's Included

- **TFG Application Form** — 10-step wizard at `/tfg-apply` (public, no auth required)
- **Neoserra PIN Integration** — Automatically creates TFG 2026 PIN forms in Neoserra CRM after submission
- **Email Notifications** — Client confirmation + admin notification via Resend (with readiness scoring)
- **Calendly Scheduling** — Post-submission CTA linking to intro call booking
- **One-Pager Viewer** — Admin-facing HTML summary at `/api/tfg/applications/{uuid}`
- **Claude AI Chat** — Streaming chat interface at `/chat` (auth-gated)
- **AI Content Endpoints** — Email templates, newsletters, social media, success stories, webpage copy
- **Password Gate** — Optional app-wide authentication via `APP_PASSWORD`

## Prerequisites

- **Node.js** >= 20.19.0
- **Railway** account (for production deployment)
- **Resend** account (for transactional email)
- **Anthropic** API key (for Claude AI features)
- **Neoserra** API access (for CRM integration)

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template and fill in your keys
cp .env.example .env

# 3. Start development server
npm run dev
```

The app runs at `http://localhost:3000`. The root URL redirects to `/tfg-apply`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_URL` | Yes | FastAPI backend URL for Neoserra client creation |
| `ANTHROPIC_API_KEY` | For AI | Claude API key for chat and content generation |
| `APP_PASSWORD` | No | Password gate — leave unset to disable |
| `APP_SECRET` | No | Cookie signing key (falls back to APP_PASSWORD) |
| `NEOSERRA_BASE_URL` | For TFG | Neoserra CRM API endpoint |
| `NEOSERRA_API_KEY` | For TFG | Neoserra API bearer token |
| `RESEND_API_KEY` | For email | Resend transactional email key |
| `APP_URL` | For email | Public deployment URL (used in email links) |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | For upload | Base64-encoded Google service account JSON |
| `GOOGLE_DRIVE_FOLDER_ID` | For upload | Google Drive folder ID for pitch deck storage |
| `TFG_DATA_DIR` | For storage | Path to application data directory |

## Railway Deployment

### 1. Create a new Railway project
Connect your GitHub repo. Railway will auto-detect the Next.js configuration.

### 2. Set environment variables
Add all required variables from `.env.example` in the Railway dashboard under **Variables**.

### 3. Add a persistent volume
In Railway, go to your service → **Volumes** → **Add Volume**:
- **Mount path**: `/data`
- Then set `TFG_DATA_DIR=/data/tfg-applications`

This stores submitted TFG applications so the admin one-pager endpoint can retrieve them.

### 4. Deploy
Push to your connected branch. Railway will build and deploy automatically using the `railway.toml` config.

### 5. Verify
- Visit your Railway URL → should redirect to `/tfg-apply`
- Fill out and submit a test application
- Check that admin notification emails arrive
- Visit `/chat` (enter password if `APP_PASSWORD` is set)

## Architecture

```
Browser
  │
  ├─ /tfg-apply ──────→ TFG 10-step wizard (React)
  │                        │
  │                        ▼ POST /api/tfg/submit
  │                        ├─→ Backend API (client creation)
  │                        ├─→ Neoserra REST API (PIN form)
  │                        ├─→ Google Drive (pitch deck upload)
  │                        ├─→ Resend (client + admin emails)
  │                        └─→ Disk (JSON application data)
  │
  ├─ /chat ────────────→ Claude AI streaming chat (SSE)
  │                        └─→ Anthropic API
  │
  ├─ /api/ai/* ────────→ Content generation endpoints
  │                        └─→ Anthropic API
  │
  └─ /login ───────────→ Password gate (if APP_PASSWORD set)
```

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4.0 + custom CSS
- **Email**: Resend
- **AI**: Anthropic Claude API (raw fetch, no SDK)
- **CRM**: Neoserra REST API
- **Storage**: Google Drive (files) + Railway volume (JSON)
- **Deployment**: Railway (Nixpacks builder)
