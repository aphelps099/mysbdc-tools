'use client';

import type { TFGApplicationData } from '../types';

interface Props {
  data: TFGApplicationData;
  onChange: (patch: Partial<TFGApplicationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SECTORS = [
  { id: 'SaaS_B2B', label: 'SaaS (B2B)' },
  { id: 'SaaS_B2C', label: 'SaaS (B2C)' },
  { id: 'Biotech', label: 'Biotech' },
  { id: 'HealthTech', label: 'Health Tech / MedTech' },
  { id: 'ClimateTech', label: 'Climate Tech' },
  { id: 'FinTech', label: 'FinTech' },
  { id: 'AgTech', label: 'AgTech' },
  { id: 'Other', label: 'Other' },
];

export default function IndustrySectorStep({ data, onChange, onNext, onBack }: Props) {
  const toggle = (id: string) => {
    const sectors = data.industrySectors.includes(id)
      ? data.industrySectors.filter((s) => s !== id)
      : [...data.industrySectors, id];
    onChange({ industrySectors: sectors });
  };

  const valid = data.industrySectors.length > 0 &&
    (!data.industrySectors.includes('Other') || data.otherIndustry.trim());

  return (
    <div className="s641-step">
      <h2 className="s641-question">Industry Sector</h2>
      <p className="s641-subtitle">Check all that apply.</p>

      <div className="s641-fields">
        <div className="s641-pills">
          {SECTORS.map((sector) => (
            <button
              key={sector.id}
              type="button"
              className={`s641-pill ${data.industrySectors.includes(sector.id) ? 'selected' : ''}`}
              onClick={() => toggle(sector.id)}
            >
              <span className="s641-pill-check">
                {data.industrySectors.includes(sector.id) && (
                  <svg width="8" height="8" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              {sector.label}
            </button>
          ))}
        </div>

        {data.industrySectors.includes('Other') && (
          <div className="s641-field tfg-fade-in">
            <label className="s641-label">Other Industry (please specify) *</label>
            <input
              className="s641-input"
              placeholder="e.g. EdTech, SpaceTech..."
              value={data.otherIndustry}
              onChange={(e) => onChange({ otherIndustry: e.target.value })}
              autoFocus
            />
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
