'use client';

import { useState } from 'react';
import type { SessionNoteData, NoteSections, SessionNoteResult } from '../types';
import { submitSessionNote } from '../session-notes-api';

interface Props {
  data: SessionNoteData;
  onChange: (patch: Partial<SessionNoteData>) => void;
  onBack: () => void;
  onResult: (result: SessionNoteResult) => void;
}

const SECTION_META: { key: keyof NoteSections; label: string }[] = [
  { key: 'description', label: 'Description of what occurred' },
  { key: 'analysis', label: 'Analysis of the problem' },
  { key: 'actionsTaken', label: 'Actions taken' },
  { key: 'followUp', label: 'Follow-up actions' },
];

function buildMemo(sections: NoteSections): string {
  return [
    `** Description of what occurred in the session:\n${sections.description}`,
    `** An analysis of the problem to be solved:\n${sections.analysis}`,
    `** Actions taken to solve the problem identified:\n${sections.actionsTaken}`,
    `** Follow-up action to be taken before the next session:\n${sections.followUp}`,
  ].join('\n\n');
}

export default function ReviewEditStep({ data, onChange, onBack, onResult }: Props) {
  const [editingSection, setEditingSection] = useState<keyof NoteSections | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSectionsValid = SECTION_META.every(
    (s) => data.sections[s.key].trim().length > 0,
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitSessionNote({
        clientId: data.clientId,
        contactId: data.contactId || undefined,
        counselorId: data.counselorId || undefined,
        centerId: data.clientCenterId || undefined,
        subject: data.subject.trim(),
        memo: buildMemo(data.sections),
        sessionDate: data.sessionDate,
        contactDuration: parseInt(data.contactDuration, 10) || 60,
        sessionType: data.sessionType,
        contactType: data.contactType,
        counselingArea: data.counselingArea,
        fundingSource: data.fundingSource,
        nbrPeople: parseInt(data.nbrPeople, 10) || 1,
        prepTimeMinutes: parseInt(data.prepTimeMinutes, 10) || 0,
        language: data.language || 'EN',
      });
      onResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="s641-step">
      <h2 className="s641-question">Review &amp; submit</h2>
      <p className="s641-subtitle">
        <strong>{data.subject}</strong> &mdash; {data.clientName} &mdash; {data.sessionDate}
        {data.aiFormatted && (
          <span className="sn-ai-badge">AI-formatted</span>
        )}
      </p>

      <div className="s641-fields" style={{ gap: 16 }}>
        {SECTION_META.map((section) => (
          <div key={section.key} className="sn-review-section">
            <div className="sn-review-header">
              <label className="s641-label">{section.label}</label>
              <button
                type="button"
                className="sn-edit-btn"
                onClick={() =>
                  setEditingSection(
                    editingSection === section.key ? null : section.key,
                  )
                }
              >
                {editingSection === section.key ? 'Done' : 'Edit'}
              </button>
            </div>

            {editingSection === section.key ? (
              <textarea
                className="s641-input sn-textarea"
                value={data.sections[section.key]}
                onChange={(e) =>
                  onChange({
                    sections: { ...data.sections, [section.key]: e.target.value },
                  })
                }
                rows={5}
                autoFocus
              />
            ) : (
              <div className="sn-review-text">
                {data.sections[section.key] || (
                  <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Empty</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="ms-not-found" style={{ marginTop: 16 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" strokeLinecap="round" />
            <circle cx="12" cy="16" r="0.5" fill="#dc2626" />
          </svg>
          <p className="ms-not-found-text">{error}</p>
        </div>
      )}

      <div className="s641-nav">
        <button className="s641-btn s641-btn-back" onClick={onBack} disabled={submitting}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button
          className="s641-btn s641-btn-primary"
          disabled={!allSectionsValid || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <div className="s641-spinner" style={{ width: 14, height: 14 }} />
              Submitting...
            </>
          ) : (
            <>
              Submit to NeoSerra
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
