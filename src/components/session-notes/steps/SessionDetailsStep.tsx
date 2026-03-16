'use client';

import type { SessionNoteData } from '../types';
import { SESSION_TYPES, CONTACT_TYPES, SBA_AREAS, FUNDING_SOURCES } from '../types';

interface Props {
  data: SessionNoteData;
  onChange: (patch: Partial<SessionNoteData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SessionDetailsStep({ data, onChange, onNext, onBack }: Props) {
  const valid =
    data.subject.trim().length > 0 &&
    data.sessionDate.length > 0 &&
    data.sessionType.length > 0 &&
    data.contactType.length > 0 &&
    data.counselingArea.length > 0 &&
    data.fundingSource.length > 0 &&
    data.contactDuration.length > 0;

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
        {/* Subject */}
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

        {/* Date + Duration + Prep */}
        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">Session Date *</label>
            <input
              className="s641-input"
              type="date"
              value={data.sessionDate}
              onChange={(e) => onChange({ sessionDate: e.target.value })}
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">Contact Time (min) *</label>
            <input
              className="s641-input"
              type="number"
              min="1"
              max="480"
              placeholder="60"
              value={data.contactDuration}
              onChange={(e) => onChange({ contactDuration: e.target.value })}
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">Prep Time (min)</label>
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

        {/* Session Type + Contact Type */}
        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">Session Type *</label>
            <select
              className="s641-input"
              value={data.sessionType}
              onChange={(e) => onChange({ sessionType: e.target.value })}
            >
              {SESSION_TYPES.map((t) => (
                <option key={t.code} value={t.code}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="s641-field">
            <label className="s641-label">Contact Type *</label>
            <select
              className="s641-input"
              value={data.contactType}
              onChange={(e) => onChange({ contactType: e.target.value })}
            >
              {CONTACT_TYPES.map((t) => (
                <option key={t.code} value={t.code}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Counseling Area + Funding Source */}
        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">Counseling Area *</label>
            <select
              className="s641-input"
              value={data.counselingArea}
              onChange={(e) => onChange({ counselingArea: e.target.value })}
            >
              <option value="">Select...</option>
              {SBA_AREAS.map((a) => (
                <option key={a.code} value={a.code}>{a.label}</option>
              ))}
            </select>
          </div>
          <div className="s641-field">
            <label className="s641-label">Funding Source *</label>
            <select
              className="s641-input"
              value={data.fundingSource}
              onChange={(e) => onChange({ fundingSource: e.target.value })}
            >
              <option value="">Select...</option>
              {FUNDING_SOURCES.map((f) => (
                <option key={f.code} value={f.code}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Number of People */}
        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">Number of People</label>
            <input
              className="s641-input"
              type="number"
              min="1"
              max="100"
              value={data.nbrPeople}
              onChange={(e) => onChange({ nbrPeople: e.target.value })}
            />
          </div>
          <div className="s641-field" />
          <div className="s641-field" />
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
