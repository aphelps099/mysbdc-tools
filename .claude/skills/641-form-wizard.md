---
name: 641-form-wizard
description: Scaffold a new 641-based intake form wizard for a special program. Use when the user wants to create a new multi-step application or intake form for a specific SBDC program (like TFG, Roadmap, SBDC Health, SBDC Eats, ProBiz, etc.).
user_invocable: true
---

# 641 Form Wizard — Special Program Scaffolding

Create a complete Typeform-style multi-step wizard for a new SBDC special program.
This follows the exact architecture used by the existing TFG, Roadmap, and Smart 641 wizards.

## Step 1: Gather Requirements

Ask the user for the following (skip any they've already provided):

1. **Program name** — e.g., "SBDC Health", "ProBiz Accelerator"
2. **Slug** — URL-friendly identifier, e.g., `sbdc-health`, `probiz` (suggest one based on the name)
3. **Program description** — One-liner for the splash screen
4. **Target audience** — Who applies? (e.g., "health-industry small businesses in NorCal")
5. **Form steps** — What data does the form collect? At minimum:
   - Contact info (name, email, phone, address)
   - Business details (company name, industry, stage)
   - Program-specific questions (interests, challenges, goals)
   - Wrap-up (referral source, terms, signature)
   - Review + submit
6. **Splash screen?** — Yes/No. If yes, any branding details (colors, logo URL, tagline, stats)
7. **Submission endpoint** — Where does the data go? Default: `/api/{slug}/submit`
8. **Neoserra integration?** — Does it create a Neoserra record (PIN/custom form or standard 641)?
9. **Scoring logic?** — Should the wizard score/triage applicants?

## Step 2: Scaffold Files

Create the following files using `{slug}` and `{Name}` (PascalCase) from the requirements:

### Required Files

| File | Purpose |
|------|---------|
| `src/components/{slug}/types.ts` | Data interface, StepId, STEP_ORDER, getVisibleSteps(), createEmpty*() |
| `src/components/{slug}/{Name}Wizard.tsx` | Main wizard with state, progress bar, step rendering |
| `src/components/{slug}/{slug}-api.ts` | API client (submit function) |
| `src/components/{slug}/steps/ContactStep.tsx` | Contact info collection |
| `src/components/{slug}/steps/` | One file per additional step |
| `src/components/{slug}/steps/{Name}ReviewStep.tsx` | Review/summary before submit |
| `src/components/{slug}/steps/{Name}ResultScreen.tsx` | Post-submission confirmation |
| `src/components/{slug}/{slug}.css` | Program-specific CSS overrides |
| `src/app/{slug}-apply/page.tsx` | Public route page |
| `src/app/{slug}-apply/layout.tsx` | Metadata layout |

### Architecture Patterns — Follow These Exactly

**types.ts** — Reference `src/components/roadmap/types.ts`:
```typescript
export interface {Name}ApplicationData {
  // Group fields by step with comments
  firstName: string;
  lastName: string;
  // ... all fields
}

export interface {Name}SubmitResult {
  success: boolean;
  applicationId?: string;
  error?: string;
}

export type {Name}StepId = 'contact' | 'company' | /* ... */ | 'review';

export const {UPPER_SLUG}_STEP_ORDER: {Name}StepId[] = [
  'contact', 'company', /* ... */ 'review',
];

export function getVisibleSteps(data: {Name}ApplicationData): {Name}StepId[] {
  return {UPPER_SLUG}_STEP_ORDER.filter((id) => {
    // Conditional step visibility based on data values
    return true;
  });
}

export function createEmpty{Name}Application(): {Name}ApplicationData {
  return { /* all fields with defaults */ };
}

// Option constants for select/checkbox steps
export const SOME_OPTIONS = [
  { id: 'option1', label: 'Label', desc: 'Description' },
];
```

**{Name}Wizard.tsx** — Reference `src/components/roadmap/RoadmapWizard.tsx`:
- Import base CSS: `import '../intake/smart641.css';`
- Import program CSS: `import './{slug}.css';`
- Optional `{Name}Splash` component with program branding
- `useState` for: data, stepIndex, submitting, result, showSplash
- `getVisibleSteps(data)` for conditional step display
- `onChange = useCallback((patch) => setData(prev => ({...prev, ...patch})), [])`
- `goNext`, `goBack` with min/max bounds
- `handleSubmit` with try/catch → setResult
- Progress bar: `s641-progress` / `s641-progress-bar`
- Wrap in `<div className="{slug}-theme">` for scoped styling
- `renderStep()` switch on `currentStep`
- `useEffect` to scroll to top on step change

**{slug}-api.ts** — Reference `src/components/roadmap/roadmap-api.ts`:
```typescript
import type { {Name}ApplicationData, {Name}SubmitResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function submit{Name}Application(
  data: {Name}ApplicationData
): Promise<{Name}SubmitResult> {
  const res = await fetch(`${API_BASE}/api/{slug}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Submission failed (${res.status}): ${text}`);
  }
  return res.json();
}
```

**Step components** — Reference `src/components/intake/steps/WelcomeStep.tsx`:
```typescript
interface Props {
  data: {Name}ApplicationData;
  onChange: (patch: Partial<{Name}ApplicationData>) => void;
  onNext: () => void;
  onBack?: () => void;  // omit for first step
}
```
- Use `s641-step`, `s641-question`, `s641-subtitle`, `s641-fields`, `s641-field`, `s641-label`, `s641-input`, `s641-select` classes
- Navigation: `s641-nav` with `s641-btn s641-btn-back` and `s641-btn s641-btn-primary`
- Multi-select cards: `s641-card` with `selected` class toggle (see `ProgramsStep.tsx`)
- Validation: compute `valid` boolean, disable Next button when invalid

**page.tsx** — Reference `src/app/roadmap-apply/page.tsx`:
- `'use client'` directive
- Wrap in `ThemeProvider` from `@/context/ThemeContext`
- Include header with program branding
- `<main>` with wizard component (max-width 560px centered)
- Footer with SBDC attribution

**layout.tsx** — Reference `src/app/roadmap-apply/layout.tsx`:
```typescript
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Apply for {Program Name}' };
export default function {Name}ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

**{slug}.css** — Reference `src/components/roadmap/roadmap.css`:
- Scope all custom styles under `.{slug}-theme`
- Override only what differs from base `smart641.css`
- Splash screen styles if applicable
- Custom color variables for program branding

## Step 3: Update Middleware

Add the new route to the public exceptions in `src/middleware.ts` (line ~90).

The matcher regex excludes public routes. Add `{slug}-apply` and `api/{slug}` to the negative lookahead:

```
Before: '/((?!login|api/auth|api/tfg|api/roadmap|tfg-apply|roadmap-apply|...'
After:  '/((?!login|api/auth|api/tfg|api/roadmap|api/{slug}|tfg-apply|roadmap-apply|{slug}-apply|...'
```

## Step 4: Verify

1. Run `npx next lint` to check for errors
2. Confirm all imports resolve
3. Confirm the route loads at `/{slug}-apply`
4. Verify the middleware allows unauthenticated access

## Key Reference Files

Read these files before scaffolding to match exact patterns:

- `src/components/intake/types.ts` — Canonical types with IntakeData, StepId, getVisibleSteps
- `src/components/intake/Smart641Wizard.tsx` — Base wizard pattern
- `src/components/intake/smart641-api.ts` — API client pattern
- `src/components/intake/smart641.css` — Base CSS classes (s641-*)
- `src/components/intake/steps/WelcomeStep.tsx` — Step with validation + side effects
- `src/components/intake/steps/ProgramsStep.tsx` — Multi-select card pattern
- `src/components/intake/steps/ReviewStep.tsx` — Review step pattern
- `src/components/intake/steps/ResultScreen.tsx` — Result screen pattern
- `src/components/roadmap/RoadmapWizard.tsx` — Splash screen + themed wrapper
- `src/components/roadmap/types.ts` — Option constants pattern
- `src/components/roadmap/roadmap-api.ts` — API client pattern
- `src/app/roadmap-apply/page.tsx` — Route page with header/footer
- `src/app/roadmap-apply/layout.tsx` — Metadata layout
- `src/middleware.ts` — Public route exceptions (matcher regex)
- `src/components/intake/i18n.ts` — i18n pattern (if bilingual support needed)
