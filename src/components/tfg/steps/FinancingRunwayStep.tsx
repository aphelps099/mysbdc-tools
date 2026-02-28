'use client';

import type { TFGApplicationData } from '../types';

interface Props {
  data: TFGApplicationData;
  onChange: (patch: Partial<TFGApplicationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function CharCount({ current, max }: { current: number; max: number }) {
  const cls = current > max ? 'tfg-char-count tfg-char-over'
    : current > max * 0.9 ? 'tfg-char-count tfg-char-warning'
    : 'tfg-char-count';
  return <div className={cls}>{current}/{max}</div>;
}

const ROUND_OPTIONS = [
  { id: 'Friends & Family', label: 'Friends & Family' },
  { id: 'Grant', label: 'Grant' },
  { id: 'Pre-Seed', label: 'Pre-Seed' },
  { id: 'Seed', label: 'Seed' },
  { id: 'Series A', label: 'Series A' },
  { id: 'Series B', label: 'Series B' },
];

export default function FinancingRunwayStep({ data, onChange, onNext, onBack }: Props) {
  const toggleRound = (id: string) => {
    const rounds = data.lastRound.includes(id)
      ? data.lastRound.filter((r) => r !== id)
      : [...data.lastRound, id];
    onChange({ lastRound: rounds });
  };

  const valid =
    data.totalFunding.trim() &&
    data.lastRound.length > 0 &&
    data.raisingCapital &&
    data.runwayMonths.trim() &&
    (!data.raisingCapital || data.raisingCapital !== 'true' || data.raiseDetails.length <= 300);

  return (
    <div className="s641-step">
      <h2 className="s641-question">Financing &amp; Runway</h2>
      <p className="s641-subtitle">Tell us about your funding history and current capital position.</p>

      <div className="s641-fields">
        {/* ── Connected box: Funding + Runway ── */}
        <div className="tfg-box">
          <div className="tfg-box-row">
            <div className="tfg-box-cell">
              <label className="s641-label">Total Funding Received *</label>
              <input
                className="s641-input"
                placeholder="$250,000"
                value={data.totalFunding}
                onChange={(e) => onChange({ totalFunding: e.target.value })}
              />
            </div>
            <div className="tfg-box-cell">
              <label className="s641-label">Runway (Months) *</label>
              <input
                className="s641-input"
                type="number"
                min="0"
                placeholder="12"
                value={data.runwayMonths}
                onChange={(e) => onChange({ runwayMonths: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">Most recent round *</label>
          <div className="s641-pills">
            {ROUND_OPTIONS.map((round) => (
              <button
                key={round.id}
                type="button"
                className={`s641-pill ${data.lastRound.includes(round.id) ? 'selected' : ''}`}
                onClick={() => toggleRound(round.id)}
              >
                <span className="s641-pill-check">
                  {data.lastRound.includes(round.id) && (
                    <svg width="8" height="8" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {round.label}
              </button>
            ))}
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">Currently raising capital? *</label>
          <div className="s641-pills">
            <button
              type="button"
              className={`s641-card s641-card-compact ${data.raisingCapital === 'true' ? 'selected' : ''}`}
              onClick={() => onChange({ raisingCapital: 'true' })}
              style={{ flex: 1 }}
            >
              <div className="s641-card-check">
                {data.raisingCapital === 'true' && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="s641-card-content">
                <div className="s641-card-title">Yes</div>
              </div>
            </button>
            <button
              type="button"
              className={`s641-card s641-card-compact ${data.raisingCapital === 'false' ? 'selected' : ''}`}
              onClick={() => onChange({ raisingCapital: 'false', raiseDetails: '' })}
              style={{ flex: 1 }}
            >
              <div className="s641-card-check">
                {data.raisingCapital === 'false' && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="s641-card-content">
                <div className="s641-card-title">No</div>
              </div>
            </button>
          </div>
        </div>

        {data.raisingCapital === 'true' && (
          <div className="s641-field tfg-fade-in">
            <label className="s641-label">If yes, how much and for what purpose?</label>
            <textarea
              className="s641-input s641-textarea"
              maxLength={300}
              rows={2}
              placeholder="Amount and purpose of raise..."
              value={data.raiseDetails}
              onChange={(e) => onChange({ raiseDetails: e.target.value })}
            />
            <CharCount current={data.raiseDetails.length} max={300} />
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
        <button className="s641-btn s641-btn-primary" disabled={!valid} onClick={onNext}>
          Continue
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
