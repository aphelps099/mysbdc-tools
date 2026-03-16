'use client';

import type { SessionNoteData } from '../types';

interface Props {
  data: SessionNoteData;
  onChange: (patch: Partial<SessionNoteData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SessionDetailsStep({ data, onChange, onNext, onBack }: Props) {
  const valid = data.subject.trim().length > 0 && data.sessionDate.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && valid) {
      onNext();
    }
  };

  return (
    <div className="s641-step">
      <h2 className="s641-question">Session details</h2>
      <p className="s641-subtitle">
        For <strong>{data.clientName}</strong> &mdash; {data.contactName}
      </p>

      <div className="s641-fields">
        <div className="s641-field">
          <label className="s641-label">Subject *</label>
          <input
            className="s641-input"
            placeholder="e.g. Business compliance review"
            value={data.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">Session Date</label>
            <input
              className="s641-input"
              type="date"
              value={data.sessionDate}
              onChange={(e) => onChange({ sessionDate: e.target.value })}
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">Duration (minutes)</label>
            <input
              className="s641-input"
              type="number"
              min="1"
              max="480"
              placeholder="60"
              value={data.durationMinutes}
              onChange={(e) => onChange({ durationMinutes: e.target.value })}
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">Prep Time (minutes)</label>
            <input
              className="s641-input"
              type="number"
              min="0"
              max="480"
              placeholder="15"
              value={data.prepTimeMinutes}
              onChange={(e) => onChange({ prepTimeMinutes: e.target.value })}
            />
          </div>
        </div>
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
          disabled={!valid}
          onClick={onNext}
        >
          Continue
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
