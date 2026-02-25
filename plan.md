# Play Prompt — Live Demo Modal for Learn Platform

## Concept
Add a **"Play"** button next to the existing **"Copy"** button on every `CopyBlock` in the learn lessons. Clicking it opens a **read-only modal** that streams the prompt through GPT in real-time — no input field, no chat controls, just a cinematic window showing the AI responding live.

This lets advisors *see* the difference between a vague prompt and a structured one without leaving the lesson.

---

## Architecture

### What already exists (no changes needed)
- `streamChat()` in `lib/api.ts` — SSE streaming client with token callbacks
- `MarkdownContent` component — renders markdown from streaming tokens
- Backend `/api/chat` endpoint — accepts message + options, returns SSE stream

### New components

**1. `PlayModal.tsx`** — new component (`components/learn/PlayModal.tsx`)
- Full-screen modal overlay (z-60, above everything)
- Scrim backdrop with click-to-close
- Centered panel: **max-w-2xl, ~50vh height on mobile, 520px fixed on desktop**
- Header bar: prompt label + close (X) button
- Scrollable body showing:
  - The prompt text (collapsed/abbreviated, styled like a quote)
  - A divider
  - The streamed AI response (using `MarkdownContent`)
  - Animated cursor while streaming (reuse the pulse bar pattern from `StreamingMessage`)
- Footer: subtle "Powered by GPT" label + a "Done" / close button
- States: `loading` (thinking dots) → `streaming` (tokens arriving) → `done` (complete)
- Calls `streamChat()` directly (not `useChat` hook — we don't need message history, conversation persistence, or compliance handling)
- Passes `use_rag: false` — these are standalone demo prompts, not document-augmented
- No conversation_id — ephemeral, not persisted
- Escape key closes the modal

**2. Modify `CopyBlock.tsx`** — add Play button
- Add an `onPlay?: () => void` optional prop
- When provided, render a **"Play"** button (▶ icon) next to the existing Copy button
- Same styling pattern as Copy: mono label, subtle bg, hover brighten
- Clicking it calls `onPlay()`

**3. Modify `LessonViewer.tsx`** — wire up state
- Add `playPrompt` state: `{ text: string; label: string } | null`
- Pass `onPlay` callback to `CopyBlock` instances in `PromptSection` and `ExerciseBlock`
- When `playPrompt` is set, render `<PlayModal>` with the prompt text
- On modal close, set `playPrompt` back to `null`

### No changes needed to:
- Backend (existing `/api/chat` endpoint works as-is)
- `lib/api.ts` (existing `streamChat` is perfect)
- `useChat` hook (not using it — too heavy for a one-shot demo)
- CSS animations (will use inline styles + existing patterns)

---

## File changes summary

| File | Action |
|------|--------|
| `components/learn/PlayModal.tsx` | **Create** — read-only streaming modal |
| `components/learn/CopyBlock.tsx` | **Edit** — add optional `onPlay` prop + Play button |
| `components/learn/LessonViewer.tsx` | **Edit** — add `playPrompt` state, wire `onPlay` to CopyBlocks, render `PlayModal` |
| `app/globals.css` | **Edit** — add modal fade-in keyframe |

---

## UX details

- **Modal size**: max-width 640px, height ~50vh mobile / 520px desktop, centered
- **Read-only**: zero input controls — the user is a spectator
- **Prompt display**: first ~2 lines of the prompt shown at top as context, faded mono text
- **Stream area**: clean white/sand background, markdown rendered, auto-scrolls as tokens arrive
- **Close**: X button, Escape key, or backdrop click — all three work
- **While streaming**: close is available (aborts the stream cleanly)
- **Play button style**: matches Copy button — `▶ Play` in mono caps, sits to the left of Copy
