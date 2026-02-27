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

const ICORPS_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: 'Planning to Apply', label: 'Planning to Apply' },
];

const INTERVIEW_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: 'In Progress', label: 'In Progress' },
];

export default function MarketValidationStep({ data, onChange, onNext, onBack }: Props) {
  const showIcorpsDetails = data.icorpsStatus === 'Yes' || data.icorpsStatus === 'Planning to Apply';
  const showInterviewDetails = data.interviewStatus === 'Yes' || data.interviewStatus === 'In Progress';

  const valid =
    data.marketOpportunity.trim() &&
    data.icorpsStatus &&
    data.interviewStatus &&
    data.idealCustomerProfile.trim() &&
    data.marketOpportunity.length <= 500 &&
    data.idealCustomerProfile.length <= 500;

  return (
    <div className="s641-step">
      <h2 className="s641-question">Market &amp; Validation</h2>
      <p className="s641-subtitle">Help us understand your market opportunity and validation progress.</p>

      <div className="s641-fields">
        <div className="s641-field">
          <label className="s641-label">Describe the Market Opportunity for your solution *</label>
          <textarea
            className="s641-input s641-textarea"
            maxLength={500}
            rows={4}
            placeholder="Describe your market opportunity..."
            value={data.marketOpportunity}
            onChange={(e) => onChange({ marketOpportunity: e.target.value })}
          />
          <CharCount current={data.marketOpportunity.length} max={500} />
        </div>

        <div className="s641-field">
          <label className="s641-label">
            Have you participated in I-Corps or a similar customer validation program? *
          </label>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            {ICORPS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`s641-card s641-card-compact ${data.icorpsStatus === opt.value ? 'selected' : ''}`}
                onClick={() => onChange({ icorpsStatus: opt.value })}
                style={{ flex: 1, minWidth: 120 }}
              >
                <div className="s641-card-check">
                  {data.icorpsStatus === opt.value && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="s641-card-content">
                  <div className="s641-card-title">{opt.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {showIcorpsDetails && (
          <div className="s641-field tfg-fade-in">
            <label className="s641-label">Which program? When?</label>
            <input
              className="s641-input"
              placeholder="e.g. NSF I-Corps, Fall 2024"
              value={data.icorpsDetails}
              onChange={(e) => onChange({ icorpsDetails: e.target.value })}
            />
          </div>
        )}

        <div className="s641-field">
          <label className="s641-label">Customer Discovery: Have you conducted interviews? *</label>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            {INTERVIEW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`s641-card s641-card-compact ${data.interviewStatus === opt.value ? 'selected' : ''}`}
                onClick={() => onChange({ interviewStatus: opt.value })}
                style={{ flex: 1, minWidth: 120 }}
              >
                <div className="s641-card-check">
                  {data.interviewStatus === opt.value && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="s641-card-content">
                  <div className="s641-card-title">{opt.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {showInterviewDetails && (
          <>
            <div className="s641-field tfg-fade-in">
              <label className="s641-label">Number of interviews completed</label>
              <input
                className="s641-input"
                type="number"
                min="0"
                placeholder="0"
                value={data.interviewCount}
                onChange={(e) => onChange({ interviewCount: e.target.value })}
              />
            </div>

            <div className="s641-field tfg-fade-in">
              <label className="s641-label">What did you learn from those interviews?</label>
              <textarea
                className="s641-input s641-textarea"
                maxLength={500}
                rows={3}
                placeholder="Key learnings from customer discovery..."
                value={data.interviewLearnings}
                onChange={(e) => onChange({ interviewLearnings: e.target.value })}
              />
              <CharCount current={data.interviewLearnings.length} max={500} />
            </div>
          </>
        )}

        <div className="s641-field">
          <label className="s641-label">
            Describe your market point of entry and your Ideal Customer Profile *
          </label>
          <textarea
            className="s641-input s641-textarea"
            maxLength={500}
            rows={4}
            placeholder="Who is your ideal customer?"
            value={data.idealCustomerProfile}
            onChange={(e) => onChange({ idealCustomerProfile: e.target.value })}
          />
          <CharCount current={data.idealCustomerProfile.length} max={500} />
        </div>
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
