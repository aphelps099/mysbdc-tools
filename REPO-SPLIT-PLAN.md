# SBDC Repo Split Plan

## Overview

Split the current monorepo into **two projects**:

| | **Repo A: `sbdc-advisor`** (stays) | **Repo B: `mysbdc-tools`** (new) |
|---|---|---|
| **Purpose** | AI Advisor platform | Client-facing SBDC tools & branding projects |
| **Features** | Chat, Learn, Prompts, Workflows, Documents, Analytics, Events | Smart641 Intake, Milestones, Atlas, Title Cards, Neoserra Panel |
| **Auth model** | Password-protected advisor login | Public-facing (intake/milestones) + optional admin |
| **Backend** | Shared FastAPI (both frontends proxy to same backend) | *or* duplicated backend (see decision below) |

---

## Decision: Shared Backend vs. Duplicated Backend

### Option A — Single Shared Backend (Recommended)

Both Next.js frontends proxy `/api/*` to the **same** FastAPI backend. The backend stays in `sbdc-advisor` and registers ALL routers. The new repo is **frontend-only**.

**Pros:**
- Zero backend duplication
- One place to update Neoserra client, env vars, etc.
- Simplest to set up — just point `BACKEND_URL` in the new frontend to the existing Railway deployment

**Cons:**
- Both projects depend on one backend deployment
- Advisor backend carries intake/milestone routes it doesn't "own"

### Option B — Duplicated Backend

Each repo gets its own `backend/` folder. Each `main.py` only registers the routers it needs. Shared services (`neoserra_client.py`, `google_sheets.py`, `zip_center_map.py`) are copied into both.

**Pros:**
- Fully independent deployments
- Can evolve backends separately

**Cons:**
- Must keep shared services in sync manually (or extract to a pip package later)
- Two Railway services to maintain

**Recommendation:** Start with **Option A** (shared backend). If the projects diverge significantly later, split the backend then. This is the fastest, safest path.

---

## What Moves to the New Repo

### Frontend Pages
| File | Description |
|---|---|
| `app/intake/page.tsx` | Smart 641 wizard |
| `app/milestones/page.tsx` | Milestone collection wizard |
| `app/atlas/page.tsx` | Public impact dashboard |
| `app/titles/page.tsx` | Title card motion builder |
| `app/milestone-log/page.tsx` | Milestone log viewer |
| `app/index-map/page.tsx` | Index map page |

### Frontend Components (move entirely)
| Directory | Files |
|---|---|
| `components/intake/` | Smart641Wizard + 10 step components + i18n + API + scoring + types |
| `components/milestones/` | MilestoneWizard + 9 step components + i18n + API + types |
| `components/titles/` | TitleCard.tsx + title-card.css |
| `components/neoserra/` | NeoserraPanel.tsx |

### Frontend Shared (copy to new repo)
| File/Dir | Why |
|---|---|
| `components/ui/` | Button, Modal, Badge, Tabs, etc. — used everywhere |
| `components/preview/` | Preview shell used by intake/milestones |
| `components/layout/` | AppShell, Header, Sidebar — new repo needs its own nav |
| `lib/api.ts` | **Trimmed version** — only Neoserra + health + auth methods |
| `lib/types.ts` | Shared TypeScript interfaces |
| `lib/auth.ts` | Auth utilities |
| `context/ThemeContext.tsx` | CSS variable theming |
| `app/globals.css` | Base styles & CSS tokens |
| `app/login/page.tsx` | Login page (if admin features needed) |

### Backend Routes (if doing Option B — duplicated backend)
| File | Description |
|---|---|
| `routes/intake.py` | 641 submission + Neoserra field mapping |
| `routes/milestones.py` | Milestone lookup + submission |
| `routes/neoserra.py` | CRM API wrapper (contacts, clients, centers, etc.) |
| `routes/atlas.py` | Impact dashboard data |
| `routes/auth.py` | Token auth (copy) |

### Backend Services (if doing Option B)
| File | Shared? |
|---|---|
| `services/neoserra_client.py` | YES — both repos need this |
| `services/google_sheets.py` | YES — milestones + neoserra |
| `services/zip_center_map.py` | YES — intake uses this |
| `services/intake_email.py` | No — intake only |
| `services/milestone_email.py` | No — milestones only |
| `services/atlas.py` | No — atlas only |

---

## What Stays in `sbdc-advisor`

### Frontend (untouched)
- `components/chat/` — ChatWindow, ChatInput, MessageBubble, etc.
- `components/learn/` — LessonViewer, LearnSidebar, PlayModal
- `components/prompts/` — PromptLibrary, PromptComposer, PromptCard
- `components/workflows/` — StoryBuilder, WorkflowPanel
- `components/compliance/` — AIPolicyGate, AIPolicyModal
- `components/onboarding/` — GuidedTour
- `components/events/` — EventsFeed
- `data/lessons/` — All 10 lesson modules
- `tools/` — ToolBrowser, ToolEngine, tool-registry
- `hooks/` — useChat, useConversations, usePrompts, useAnalytics, etc.

### Backend (untouched)
- `routes/chat.py`, `conversations.py`, `documents.py`, `events.py`, `prompts.py`, `workflows.py`, `transcribe.py`, `analytics.py`
- `services/llm_client.py`, `rag.py`, `conversations.py`, `prompt_wizard.py`, `workflow_engine.py`, `analytics.py`

---

## Known Cross-Dependencies to Resolve

### 1. NeoserraPanel in Chat Page
**Problem:** `chat/page.tsx` imports `NeoserraPanel` from `components/neoserra/`.
**Solution:** Keep a lightweight copy of `NeoserraPanel.tsx` in the advisor repo's `components/neoserra/` folder. Both repos have their own copy. They'll diverge naturally (advisor version is a sidebar panel; tools version may become a full page).

### 2. Sidebar Navigation
**Problem:** `Sidebar.tsx` has links to ALL features (chat, learn, intake, milestones, atlas, titles).
**Solution:** Each repo gets its own `Sidebar.tsx` with only its relevant links. The new repo's sidebar: Intake, Milestones, Atlas, Titles, Neoserra. The advisor's sidebar: Chat, Learn, Prompts, Workflows, Dashboard.

### 3. `lib/api.ts` is monolithic
**Problem:** Single file contains API methods for both projects.
**Solution:** Each repo gets a trimmed `api.ts`. New repo keeps: token management, auth, health, Neoserra methods, milestone methods. Advisor keeps: everything except intake/milestone-specific methods.

### 4. Shared env vars
**Problem:** Both projects need `NEOSERRA_API_TOKEN`, `NEOSERRA_API_URL`, Google Sheets credentials.
**Solution:** If shared backend (Option A), no issue — one `.env`. If separate backends, duplicate the relevant env vars.

---

## Execution Steps

### Phase 1: Prepare (in current repo)
1. Create a clean branch for the split work
2. Verify all tests pass / app builds before touching anything
3. Tag the current state: `git tag pre-split`

### Phase 2: Create New Repo
1. Create `mysbdc-tools` repo on GitHub (empty)
2. Clone it locally
3. Initialize with Next.js (copy `package.json`, `next.config.js`, `tsconfig.json` from current frontend — adjust as needed)
4. Copy the shared foundation:
   - `globals.css`, `ThemeContext.tsx`, `lib/auth.ts`, `lib/types.ts`
   - `components/ui/` (all shared UI primitives)
   - `components/preview/`
5. Copy the feature modules:
   - `components/intake/` (entire directory)
   - `components/milestones/` (entire directory)
   - `components/titles/` (entire directory)
   - `components/neoserra/`
6. Copy and create pages:
   - `app/intake/page.tsx`
   - `app/milestones/page.tsx`
   - `app/atlas/page.tsx`
   - `app/titles/page.tsx`
7. Create trimmed `lib/api.ts` with only the methods needed
8. Create new `Sidebar.tsx` / `AppShell.tsx` with tools-only navigation
9. Create `layout.tsx` and `page.tsx` (root redirect)

### Phase 3: Backend Decision
- **If shared backend:** Add `BACKEND_URL` to new frontend's env. Done.
- **If separate backend:** Copy `backend/` folder, trim `main.py` to only register intake/milestones/neoserra/atlas/auth routers. Remove LLM/RAG/chat dependencies from `requirements.txt`.

### Phase 4: Clean Up Advisor Repo
1. Remove extracted pages from advisor: `app/intake/`, `app/milestones/`, `app/atlas/`, `app/titles/`
2. Remove extracted components: `components/intake/`, `components/milestones/`, `components/titles/`
3. Keep `components/neoserra/NeoserraPanel.tsx` (used by chat page)
4. Update `Sidebar.tsx` to remove links to extracted features
5. If separate backend: remove `routes/intake.py`, `routes/milestones.py`, `routes/atlas.py` from advisor's `main.py`
6. Clean up `lib/api.ts` — remove intake/milestone-specific methods
7. Verify advisor still builds and runs

### Phase 5: Verify Both Projects
1. New repo: `npm run build` passes
2. New repo: intake wizard loads, milestone wizard loads, atlas loads, title builder loads
3. Advisor: `npm run build` passes
4. Advisor: chat works, learn works, prompts work, Neoserra panel in chat works
5. Both: Neoserra API calls succeed

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Missing shared dependency | Medium | The inventory above is comprehensive. Build errors will surface immediately. |
| Neoserra API breaks in one repo | Low | Both use the same `neoserra_client.py` and API token |
| CSS/theme drift between repos | Low (acceptable) | They're separate products — some drift is fine |
| Forgot to copy a file | Medium | `npm run build` will catch missing imports immediately |
| Backend deploy confusion | Low | Clearly document which backend URL each frontend uses |

**Confidence level: HIGH.** The codebase is already well-modularized — components are self-contained in their directories, backend routes are cleanly separated, and cross-dependencies are minimal and well-documented above.

---

## Timeline Estimate

- Phase 1 (Prepare): ~5 minutes
- Phase 2 (Create new repo + copy): ~30 minutes
- Phase 3 (Backend decision): ~5 minutes
- Phase 4 (Clean up advisor): ~15 minutes
- Phase 5 (Verify): ~15 minutes

**Total: ~1 hour of focused work.**
