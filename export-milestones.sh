#!/usr/bin/env bash
# export-milestones.sh — Exports the Milestones wizard and all dependencies
# into milestones-export/ for migration to another repo.

set -euo pipefail

EXPORT_DIR="milestones-export"

echo "🚀 Exporting Milestones wizard to ${EXPORT_DIR}/ ..."

# Clean previous export
rm -rf "${EXPORT_DIR}"

# Create directory structure
mkdir -p "${EXPORT_DIR}/src/components/milestones/steps"
mkdir -p "${EXPORT_DIR}/src/components/intake"
mkdir -p "${EXPORT_DIR}/src/context"
mkdir -p "${EXPORT_DIR}/src/app/milestones"
mkdir -p "${EXPORT_DIR}/src/app/milestone-log"
mkdir -p "${EXPORT_DIR}/src/app/api/[...path]"
mkdir -p "${EXPORT_DIR}/src/lib"
mkdir -p "${EXPORT_DIR}/public"

# --- Tier 1: Core Milestone Components ---
cp src/components/milestones/MilestoneWizard.tsx   "${EXPORT_DIR}/src/components/milestones/"
cp src/components/milestones/LanguageSwitcher.tsx   "${EXPORT_DIR}/src/components/milestones/"
cp src/components/milestones/i18n.tsx               "${EXPORT_DIR}/src/components/milestones/"
cp src/components/milestones/types.ts               "${EXPORT_DIR}/src/components/milestones/"
cp src/components/milestones/milestones-api.ts      "${EXPORT_DIR}/src/components/milestones/"
cp src/components/milestones/milestones.css         "${EXPORT_DIR}/src/components/milestones/"
cp src/components/milestones/steps/ContactLookupStep.tsx     "${EXPORT_DIR}/src/components/milestones/steps/"
cp src/components/milestones/steps/SelectBusinessStep.tsx    "${EXPORT_DIR}/src/components/milestones/steps/"
cp src/components/milestones/steps/SelectMilestonesStep.tsx  "${EXPORT_DIR}/src/components/milestones/steps/"
cp src/components/milestones/steps/EmployeesStep.tsx         "${EXPORT_DIR}/src/components/milestones/steps/"
cp src/components/milestones/steps/SalesStep.tsx             "${EXPORT_DIR}/src/components/milestones/steps/"
cp src/components/milestones/steps/NewBusinessStep.tsx       "${EXPORT_DIR}/src/components/milestones/steps/"
cp src/components/milestones/steps/FundingStep.tsx           "${EXPORT_DIR}/src/components/milestones/steps/"
cp src/components/milestones/steps/TestimonialStep.tsx       "${EXPORT_DIR}/src/components/milestones/steps/"
cp src/components/milestones/steps/MilestoneResultScreen.tsx "${EXPORT_DIR}/src/components/milestones/steps/"

# --- Tier 2: Page Routes ---
cp src/app/milestones/page.tsx      "${EXPORT_DIR}/src/app/milestones/"
cp src/app/milestone-log/page.tsx   "${EXPORT_DIR}/src/app/milestone-log/"

# --- Tier 3: Shared Dependencies ---
cp src/components/intake/smart641.css       "${EXPORT_DIR}/src/components/intake/"
cp src/context/ThemeContext.tsx              "${EXPORT_DIR}/src/context/"
cp "src/app/api/[...path]/route.ts"         "${EXPORT_DIR}/src/app/api/[...path]/"
cp src/lib/api.ts                           "${EXPORT_DIR}/src/lib/"

# --- Tier 4: Static Assets ---
cp public/sbdc-blue-2026.png   "${EXPORT_DIR}/public/"
cp public/sbdc-white-2026.png  "${EXPORT_DIR}/public/"

# --- Generate Migration README ---
cat > "${EXPORT_DIR}/MIGRATION-README.md" << 'READMEEOF'
# Milestones Wizard — Migration Guide

## Overview

This export contains the complete Milestones wizard: a multi-step form for
collecting business milestones (employees hired, sales increased, new businesses
started, funding received) with Neoserra CRM integration, 5-language support,
and an admin log viewer.

## File Manifest

### Core Components (`src/components/milestones/`)
| File | Purpose |
|------|---------|
| `MilestoneWizard.tsx` | Main wizard controller — state, step navigation, form orchestration |
| `LanguageSwitcher.tsx` | Language dropdown (English, Spanish, Vietnamese, Chinese, French) |
| `i18n.tsx` | Translation dictionary + `LanguageProvider` context |
| `types.ts` | TypeScript interfaces, step order, `createEmptyMilestone()` factory |
| `milestones-api.ts` | API client for contact lookup & milestone submission |
| `milestones.css` | Milestone-specific styles (`ms-*` namespace) |

### Step Components (`src/components/milestones/steps/`)
| File | Step | Conditional? |
|------|------|-------------|
| `ContactLookupStep.tsx` | Email-based contact lookup | Always shown |
| `SelectBusinessStep.tsx` | Choose Neoserra client record | Always shown |
| `SelectMilestonesStep.tsx` | Pick milestone categories | Always shown |
| `EmployeesStep.tsx` | Full-time/part-time employee counts | Only if "hired_employees" selected |
| `SalesStep.tsx` | Gross revenue with delta calculation | Only if "increased_sales" selected |
| `NewBusinessStep.tsx` | New business verification & structure | Only if "started_business" selected |
| `FundingStep.tsx` | Funding sources with amounts & types | Only if "got_funded" selected |
| `TestimonialStep.tsx` | Optional testimonial + digital signature | Always shown |
| `MilestoneResultScreen.tsx` | Success/error result with confetti | Always shown |

### Page Routes (`src/app/`)
| File | Purpose |
|------|---------|
| `milestones/page.tsx` | Public wizard page (no auth required) |
| `milestone-log/page.tsx` | Admin log viewer (auth required) |

### Shared Dependencies
| File | Purpose |
|------|---------|
| `src/components/intake/smart641.css` | Shared design system CSS (`s641-*` classes) — **required** |
| `src/context/ThemeContext.tsx` | Light/dark theme toggle context |
| `src/app/api/[...path]/route.ts` | API proxy route (forwards `/api/*` to backend) |
| `src/lib/api.ts` | Token management utilities (admin log page only) |

### Static Assets
| File | Purpose |
|------|---------|
| `public/sbdc-blue-2026.png` | Logo (public wizard page) |
| `public/sbdc-white-2026.png` | Logo (admin log page) |

## Setup Instructions

### 1. Required npm Dependencies
```json
{
  "next": "^15.1",
  "react": "^19.0",
  "react-dom": "^19.0"
}
```
Tailwind CSS 4.0 is needed only for the admin log page (`milestone-log`).

### 2. TypeScript Path Alias
Add to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. Environment Variables
| Variable | Used By | Default | Purpose |
|----------|---------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `milestones-api.ts` | `""` (same-origin) | API base URL. Set only if backend is at a different origin. |
| `BACKEND_URL` | `api/[...path]/route.ts` | `http://localhost:8000` | Server-side backend URL for the proxy |

### 4. Backend API Endpoints
The wizard expects these endpoints (proxied through the catch-all API route):
- `POST /api/milestones/lookup` — Look up contact by email
- `POST /api/milestones/lookup-by-id` — Look up contact by ID (deep-linking)
- `POST /api/milestones/submit` — Submit milestone data
- `GET  /api/milestones/log` — Fetch submission log (admin page only)

### 5. CSS Import Path
`MilestoneWizard.tsx` imports `'../intake/smart641.css'`. If you place `smart641.css`
at a different path, update this import accordingly.

## Optional Simplifications
- **Drop the admin page**: Remove `milestone-log/page.tsx` and `src/lib/api.ts` if you don't need the log viewer
- **Drop dark mode**: Remove `ThemeContext.tsx` and the `<ThemeProvider>` wrapper in `milestones/page.tsx`
- **Direct backend calls**: Replace the API proxy route with direct calls if your app has its own API layer
READMEEOF

# Count exported files
FILE_COUNT=$(find "${EXPORT_DIR}" -type f | wc -l)
echo "✅ Export complete: ${FILE_COUNT} files copied to ${EXPORT_DIR}/"
echo "📄 See ${EXPORT_DIR}/MIGRATION-README.md for integration instructions."
