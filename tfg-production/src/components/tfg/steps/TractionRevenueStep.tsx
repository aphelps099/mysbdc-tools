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

const PRODUCT_STAGES = [
  { value: 'Idea', label: 'Idea' },
  { value: 'Prototype or Lab Benchmark', label: 'Prototype / Lab Benchmark' },
  { value: 'Proof of Concept', label: 'Proof of Concept' },
  { value: 'MVP', label: 'MVP' },
  { value: 'Product Deployment', label: 'Production Deployment' },
];

const REVENUE_STAGES = [
  { value: '0', label: 'Pre-Revenue' },
  { value: '1', label: 'Pilot Revenue' },
  { value: '2', label: 'Less than $500K', displayLabel: '< $500K' },
  { value: '2', label: 'Less than $1MM', displayLabel: '< $1MM', id: 'under1mm' },
  { value: '2', label: 'Greater than $1MM', displayLabel: '> $1MM', id: 'over1mm' },
];

export default function TractionRevenueStep({ data, onChange, onNext, onBack }: Props) {
  const valid =
    data.productStage &&
    data.inMarketStatus.trim() &&
    data.revenueStage &&
    data.recentAchievements.trim() &&
    data.inMarketStatus.length <= 500 &&
    data.recentAchievements.length <= 500;

  // Revenue stages need unique keys since some share values
  const revenueKey = (stage: typeof REVENUE_STAGES[number], i: number) =>
    stage.id || `rev-${stage.value}-${i}`;

  return (
    <div className="s641-step">
      <h2 className="s641-question">Traction &amp; Revenue</h2>
      <p className="s641-subtitle">Where are you in your product and revenue journey?</p>

      <div className="s641-fields">
        <div className="s641-field">
          <label className="s641-label">What stage has your product reached? *</label>
          <div className="s641-pills">
            {PRODUCT_STAGES.map((stage) => (
              <button
                key={stage.value}
                type="button"
                className={`s641-card s641-card-compact ${data.productStage === stage.value ? 'selected' : ''}`}
                onClick={() => onChange({ productStage: stage.value })}
              >
                <div className="s641-card-check">
                  {data.productStage === stage.value && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="s641-card-content">
                  <div className="s641-card-title">{stage.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">Describe what you have in-market right now *</label>
          <textarea
            className="s641-input s641-textarea"
            maxLength={500}
            rows={3}
            placeholder="What's currently in market..."
            value={data.inMarketStatus}
            onChange={(e) => onChange({ inMarketStatus: e.target.value })}
          />
          <CharCount current={data.inMarketStatus.length} max={500} />
        </div>

        <div className="s641-field">
          <label className="s641-label">Revenue Stage *</label>
          <div className="s641-pills">
            {REVENUE_STAGES.map((stage, i) => (
              <button
                key={revenueKey(stage, i)}
                type="button"
                className={`s641-pill ${data.revenueStage === (stage.id || `${stage.value}-${i}`) ? 'selected' : ''}`}
                onClick={() => onChange({ revenueStage: stage.id || `${stage.value}-${i}` })}
              >
                <span className="s641-pill-check">
                  {data.revenueStage === (stage.id || `${stage.value}-${i}`) && (
                    <svg width="8" height="8" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {stage.displayLabel || stage.label}
              </button>
            ))}
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">
            Have you received or do you intend to apply for SBIR/STTR funding?
          </label>
          <textarea
            className="s641-input s641-textarea"
            maxLength={300}
            rows={2}
            placeholder="Optional"
            value={data.sbirStatus}
            onChange={(e) => onChange({ sbirStatus: e.target.value })}
          />
          <CharCount current={data.sbirStatus.length} max={300} />
        </div>

        <div className="s641-field">
          <label className="s641-label">Key achievements in last 6 months *</label>
          <textarea
            className="s641-input s641-textarea"
            maxLength={500}
            rows={3}
            placeholder="Recent milestones, wins, and progress..."
            value={data.recentAchievements}
            onChange={(e) => onChange({ recentAchievements: e.target.value })}
          />
          <CharCount current={data.recentAchievements.length} max={500} />
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
