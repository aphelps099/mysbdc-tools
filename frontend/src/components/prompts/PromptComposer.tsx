'use client';

import { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import PromptComposerInline from './PromptComposerInline';
import type { Prompt } from '@/lib/types';

interface PromptComposerProps {
  open: boolean;
  prompt: Prompt | null;
  onClose: () => void;
  onSend: (populatedPrompt: string) => void;
}

interface Placeholder {
  raw: string;
  key: string;
  label: string;
  hint: string;
}

// Match [BRACKETED PLACEHOLDERS] — permissive hint portion after dash
const PLACEHOLDER_RE = /\[([A-Z][A-Z0-9 /&,.'\"_\-—]+(?:\s*-\s*[^\]\n]+)?)\]/g;

function extractPlaceholders(promptText: string): Placeholder[] {
  const matches = [...promptText.matchAll(PLACEHOLDER_RE)];
  if (!matches.length) return [];

  const seen = new Set<string>();
  const placeholders: Placeholder[] = [];

  for (const match of matches) {
    const inner = match[1];
    const raw = `[${inner}]`;
    let key = inner.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    if (seen.has(key)) continue;
    seen.add(key);

    // Label: title case if all uppercase
    let label = inner.trim();
    if (label === label.toUpperCase()) {
      label = label.replace(/\w\S*/g, (w) => w.charAt(0) + w.slice(1).toLowerCase());
    }

    // Extract hint from " - e.g., ..." pattern
    let hint = '';
    if (inner.includes(' - ')) {
      const parts = inner.split(' - ', 2);
      if (parts.length === 2) {
        hint = parts[1].trim().replace(/^["']|["']$/g, '');
        label = parts[0].trim();
        if (label === label.toUpperCase()) {
          label = label.replace(/\w\S*/g, (w) => w.charAt(0) + w.slice(1).toLowerCase());
        }
      }
    }

    placeholders.push({ raw, key, label, hint });
  }

  return placeholders;
}

// Determine if a field should be a textarea (long) vs input (short)
const LONG_FIELD_KEYWORDS = ['PASTE', 'DESCRIBE', 'LIST', 'SUMMARY', 'NOTES', 'CONTENT', 'DETAILS', 'OVERVIEW'];

function isLongField(key: string): boolean {
  return LONG_FIELD_KEYWORDS.some((kw) => key.includes(kw));
}

function populatePrompt(promptText: string, values: Record<string, string>): string {
  let result = promptText;
  const placeholders = extractPlaceholders(promptText);
  for (const ph of placeholders) {
    const value = (values[ph.key] || '').trim();
    if (value) {
      result = result.replaceAll(ph.raw, value);
    }
  }
  return result;
}

export default function PromptComposer({ open, prompt, onClose, onSend }: PromptComposerProps) {
  // Route to inline editor for prompts with a body array
  if (prompt?.body?.length) {
    return <PromptComposerInline open={open} prompt={prompt} onClose={onClose} onSend={onSend} />;
  }

  return <PromptComposerLegacy open={open} prompt={prompt} onClose={onClose} onSend={onSend} />;
}

function PromptComposerLegacy({ open, prompt, onClose, onSend }: PromptComposerProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  const placeholders = useMemo(() => {
    if (!prompt?.prompt) return [];
    return extractPlaceholders(prompt.prompt);
  }, [prompt]);

  const shortFields = placeholders.filter((ph) => !isLongField(ph.key));
  const longFields = placeholders.filter((ph) => isLongField(ph.key));

  const filledCount = placeholders.filter((ph) => (values[ph.key] || '').trim()).length;
  const totalCount = placeholders.length;
  const progressPct = totalCount > 0 ? (filledCount / totalCount) * 100 : 0;

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSend = () => {
    if (!prompt?.prompt) return;
    const populated = populatePrompt(prompt.prompt, values);
    onSend(populated);
    setValues({});
    onClose();
  };

  const handleCancel = () => {
    setValues({});
    onClose();
  };

  // Render the preview with colored tokens
  const previewHtml = useMemo(() => {
    if (!prompt?.prompt) return '';
    let html = prompt.prompt
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    for (const ph of placeholders) {
      const value = (values[ph.key] || '').trim();
      const escaped = ph.raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (value) {
        html = html.replace(
          new RegExp(escaped, 'g'),
          `<span style="background:rgba(22,163,74,0.1);color:#166534;padding:1px 6px;border-radius:4px;font-weight:500">${value.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`
        );
      } else {
        html = html.replace(
          new RegExp(escaped, 'g'),
          `<span style="background:rgba(29,90,167,0.1);color:var(--royal);padding:1px 6px;border-radius:4px;font-weight:500;font-size:13px">${ph.label}</span>`
        );
      }
    }

    return html.replace(/\n/g, '<br>');
  }, [prompt, placeholders, values]);

  if (!prompt) return null;

  // If the prompt has no placeholders, just send it directly
  const hasPlaceholders = placeholders.length > 0;

  return (
    <Modal open={open} onClose={handleCancel}>
      <div className="overflow-y-auto max-h-[85vh]">
        {/* ─── Header ─── */}
        <div className="px-8 pt-8 pb-5 border-b border-[var(--rule)]">
          <button
            onClick={handleCancel}
            className="absolute top-5 right-5 p-2 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--cream)] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <span className="inline-block px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--royal)]/10 text-[var(--royal)] font-[var(--mono)] text-[11px] tracking-wider uppercase mb-3">
            {prompt.categoryLabel}
          </span>
          <h2 className="text-[24px] font-[var(--display)] font-bold text-[var(--text-primary)] tracking-[-0.02em] mb-2">
            {prompt.title}
          </h2>
          <p className="text-[15px] font-[var(--sans)] font-light text-[var(--text-secondary)] leading-relaxed">
            {prompt.description}
          </p>
        </div>

        {hasPlaceholders ? (
          <>
            {/* ─── Form Fields ─── */}
            <div className="px-8 py-6 space-y-5">
              <p className="text-label text-[var(--text-tertiary)] uppercase">
                Fill in the details
              </p>

              {/* Short fields in 2-column grid */}
              {shortFields.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shortFields.map((ph) => (
                    <div key={ph.key}>
                      <label className="block text-[13px] font-[var(--sans)] font-medium text-[var(--text-primary)] mb-1.5">
                        {ph.label}
                      </label>
                      <input
                        type="text"
                        value={values[ph.key] || ''}
                        onChange={(e) => handleChange(ph.key, e.target.value)}
                        placeholder={ph.hint || `Enter ${ph.label.toLowerCase()}`}
                        className="
                          w-full h-10 px-3
                          text-[14px] font-[var(--sans)] font-light
                          text-[var(--text-primary)] bg-white
                          border border-[var(--rule)]
                          rounded-[var(--radius-md)]
                          placeholder:text-[var(--text-tertiary)]
                          focus:outline-none focus:border-[var(--royal)] focus:ring-2 focus:ring-[var(--royal)]/10
                          transition-all duration-[var(--duration-fast)]
                        "
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Long fields full-width */}
              {longFields.map((ph) => (
                <div key={ph.key}>
                  <label className="block text-[13px] font-[var(--sans)] font-medium text-[var(--text-primary)] mb-1.5">
                    {ph.label}
                  </label>
                  <textarea
                    id={`prompt-field-${ph.key}`}
                    name={ph.key}
                    value={values[ph.key] || ''}
                    onChange={(e) => handleChange(ph.key, e.target.value)}
                    placeholder={ph.hint || `Enter ${ph.label.toLowerCase()}`}
                    rows={3}
                    className="
                      w-full px-3 py-2.5
                      text-[14px] font-[var(--sans)] font-light
                      text-[var(--text-primary)] bg-white
                      border border-[var(--rule)]
                      rounded-[var(--radius-md)]
                      placeholder:text-[var(--text-tertiary)]
                      focus:outline-none focus:border-[var(--royal)] focus:ring-2 focus:ring-[var(--royal)]/10
                      transition-all duration-[var(--duration-fast)]
                      resize-y
                    "
                  />
                </div>
              ))}

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-[var(--cream)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--royal)] rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[12px] font-[var(--mono)] text-[var(--text-tertiary)] shrink-0">
                  {filledCount} of {totalCount} filled
                </span>
              </div>
            </div>

            {/* ─── Live Preview ─── */}
            <div className="px-8 pb-6">
              <p className="text-label text-[var(--text-tertiary)] uppercase mb-3">
                Prompt Preview
              </p>
              <div
                className="p-4 rounded-[var(--radius-md)] bg-[var(--cream)]/50 border border-[var(--rule-light)] text-[14px] font-[var(--sans)] font-light leading-[1.8] text-[var(--text-secondary)] max-h-[200px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </>
        ) : (
          /* No placeholders — just show the prompt text */
          <div className="px-8 py-6">
            <p className="text-label text-[var(--text-tertiary)] uppercase mb-3">
              Prompt
            </p>
            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--cream)]/50 border border-[var(--rule-light)] text-[14px] font-[var(--sans)] font-light leading-[1.8] text-[var(--text-secondary)] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
              {prompt.prompt}
            </div>
          </div>
        )}

        {/* ─── Actions ─── */}
        <div className="px-8 pb-8 flex items-center gap-3">
          <button
            onClick={handleSend}
            className="
              flex-1 h-11
              text-[14px] font-[var(--sans)] font-semibold text-white
              bg-[var(--navy)]
              rounded-full
              hover:opacity-90 active:scale-[0.98]
              transition-all duration-[var(--duration-fast)]
              cursor-pointer
            "
          >
            Send to Chat
          </button>
          <button
            onClick={handleCancel}
            className="
              px-5 h-11
              text-[14px] font-[var(--sans)] font-semibold text-[var(--text-secondary)]
              bg-[var(--cream)]
              rounded-full
              hover:bg-[var(--rule-light)]
              transition-all duration-[var(--duration-fast)]
              cursor-pointer
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
