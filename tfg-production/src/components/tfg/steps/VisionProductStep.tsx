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

export default function VisionProductStep({ data, onChange, onNext, onBack }: Props) {
  const valid =
    data.vision.trim() &&
    data.problem.trim() &&
    data.solution.trim() &&
    data.vision.length <= 500 &&
    data.problem.length <= 500 &&
    data.solution.length <= 500;

  return (
    <div className="s641-step">
      <h2 className="s641-question">Vision &amp; Product</h2>
      <p className="s641-subtitle">Tell us about what you&rsquo;re building and why it matters.</p>

      <div className="s641-fields">
        <div className="s641-field">
          <label className="s641-label">What is your vision? *</label>
          <p className="s641-hint">How will the world be different once you are successful?</p>
          <textarea
            className="s641-input s641-textarea"
            maxLength={500}
            rows={4}
            placeholder="Describe your vision..."
            value={data.vision}
            onChange={(e) => onChange({ vision: e.target.value })}
          />
          <CharCount current={data.vision.length} max={500} />
        </div>

        <div className="s641-field">
          <label className="s641-label">What problem are you solving, and why is it important? *</label>
          <textarea
            className="s641-input s641-textarea"
            maxLength={500}
            rows={4}
            placeholder="Describe the problem..."
            value={data.problem}
            onChange={(e) => onChange({ problem: e.target.value })}
          />
          <CharCount current={data.problem.length} max={500} />
        </div>

        <div className="s641-field">
          <label className="s641-label">What exact solution are you building? *</label>
          <textarea
            className="s641-input s641-textarea"
            maxLength={500}
            rows={4}
            placeholder="Describe your solution..."
            value={data.solution}
            onChange={(e) => onChange({ solution: e.target.value })}
          />
          <CharCount current={data.solution.length} max={500} />
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
