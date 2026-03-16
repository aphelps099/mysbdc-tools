'use client';

import { useState } from 'react';
import type { SessionNoteData, NoteSections } from '../types';
import { formatNotesWithAi } from '../session-notes-api';

interface Props {
  data: SessionNoteData;
  onChange: (patch: Partial<SessionNoteData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SECTION_LABELS: { key: keyof NoteSections; label: string; placeholder: string }[] = [
  {
    key: 'description',
    label: 'Description of what occurred',
    placeholder: 'Summarize the meeting: who was involved, what was discussed, the client\'s situation...',
  },
  {
    key: 'analysis',
    label: 'Analysis of the problem',
    placeholder: 'What business challenge or need does the client face? Why does it matter?',
  },
  {
    key: 'actionsTaken',
    label: 'Actions taken',
    placeholder: 'What specific advice, resources, or assistance was provided during the session?',
  },
  {
    key: 'followUp',
    label: 'Follow-up actions',
    placeholder: 'What concrete next steps should the client and/or counselor take before the next session?',
  },
];

export default function AiFormatStep({ data, onChange, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormat = async () => {
    if (!data.rawNotes.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const sections = await formatNotesWithAi(data.rawNotes.trim());
      onChange({ sections, aiFormatted: true });
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI formatting failed. You can try again or switch to manual entry.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualNext = () => {
    onChange({ useManualEntry: true, aiFormatted: false });
    onNext();
  };

  // Manual entry mode
  if (data.useManualEntry) {
    const sectionsValid = SECTION_LABELS.every(
      (s) => data.sections[s.key].trim().length > 0,
    );

    return (
      <div className="s641-step">
        <h2 className="s641-question">Write session notes</h2>
        <p className="s641-subtitle">
          Enter each section manually for <strong>{data.clientName}</strong>.{' '}
          <button
            type="button"
            className="sn-link-btn"
            onClick={() => onChange({ useManualEntry: false })}
          >
            Switch to AI formatting
          </button>
        </p>

        <div className="s641-fields" style={{ gap: 16 }}>
          {SECTION_LABELS.map((section) => (
            <div key={section.key} className="s641-field">
              <label className="s641-label">{section.label}</label>
              <textarea
                className="s641-input sn-textarea"
                placeholder={section.placeholder}
                value={data.sections[section.key]}
                onChange={(e) =>
                  onChange({
                    sections: { ...data.sections, [section.key]: e.target.value },
                  })
                }
                rows={4}
              />
            </div>
          ))}
        </div>

        <div className="s641-nav">
          <button className="s641-btn s641-btn-back" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <button
            className="s641-btn s641-btn-primary"
            disabled={!sectionsValid}
            onClick={onNext}
          >
            Review
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // AI-first mode (default)
  return (
    <div className="s641-step">
      <h2 className="s641-question">Paste your session notes</h2>
      <p className="s641-subtitle">
        Paste raw notes, bullet points, or a meeting transcript. AI will format them into the standard 4-section structure.{' '}
        <button
          type="button"
          className="sn-link-btn"
          onClick={handleManualNext}
        >
          Write sections manually
        </button>
      </p>

      <div className="s641-fields">
        <div className="s641-field">
          <textarea
            className="s641-input sn-textarea sn-textarea-lg"
            placeholder={"Paste your raw session notes here...\n\nExamples:\n- Meeting notes or bullet points\n- Zoom AI meeting summary\n- Voice-to-text transcript\n- Any freeform text about the session"}
            value={data.rawNotes}
            onChange={(e) => onChange({ rawNotes: e.target.value })}
            rows={12}
            autoFocus
          />
        </div>

        {loading && (
          <div className="ms-lookup-loading">
            <div className="s641-spinner" />
            <p className="ms-lookup-loading-text">AI is formatting your notes...</p>
          </div>
        )}

        {error && (
          <div className="ms-not-found">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" strokeLinecap="round" />
              <circle cx="12" cy="16" r="0.5" fill="#dc2626" />
            </svg>
            <p className="ms-not-found-text">{error}</p>
          </div>
        )}
      </div>

      <div className="s641-nav">
        <button className="s641-btn s641-btn-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button
          className="s641-btn s641-btn-primary"
          disabled={!data.rawNotes.trim() || loading}
          onClick={handleFormat}
        >
          {loading ? 'Formatting...' : 'Format with AI'}
          {!loading && (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
