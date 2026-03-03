'use client';

import type { RoadmapApplicationData } from '../types';
import { YEARS_RANGES } from '../types';

interface Props {
  data: RoadmapApplicationData;
  onChange: (patch: Partial<RoadmapApplicationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','DC','WV','WI','WY',
];

export default function CompanyStep({ data, onChange, onNext, onBack }: Props) {
  const valid =
    data.companyName.trim() &&
    data.city.trim() &&
    data.state &&
    data.zipCode.trim() &&
    data.productDescription.trim();

  return (
    <div className="s641-step">
      <h2 className="s641-question">About your company</h2>
      <p className="s641-subtitle">
        Help us understand your manufacturing operation so we can match you
        with the best resources.
      </p>

      <div className="s641-fields">
        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">Company Name</label>
            <input
              className="s641-input"
              placeholder="Acme Manufacturing Inc."
              value={data.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              autoFocus
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">
              Website <span className="s641-optional">optional</span>
            </label>
            <input
              className="s641-input"
              type="url"
              placeholder="https://yourcompany.com"
              value={data.website}
              onChange={(e) => onChange({ website: e.target.value })}
            />
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">Street Address</label>
          <input
            className="s641-input"
            placeholder="456 Industrial Blvd"
            value={data.streetAddress}
            onChange={(e) => onChange({ streetAddress: e.target.value })}
          />
        </div>

        <div className="s641-row s641-row-3">
          <div className="s641-field">
            <label className="s641-label">City</label>
            <input
              className="s641-input"
              placeholder="Sacramento"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">State</label>
            <select
              className="s641-select"
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value })}
            >
              <option value="">--</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="s641-field">
            <label className="s641-label">ZIP</label>
            <input
              className="s641-input"
              placeholder="95814"
              value={data.zipCode}
              onChange={(e) => onChange({ zipCode: e.target.value })}
              maxLength={10}
            />
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">Years in Operation</label>
          <select
            className="s641-select"
            value={data.yearsInOperation}
            onChange={(e) => onChange({ yearsInOperation: e.target.value })}
          >
            <option value="">Select...</option>
            {YEARS_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="s641-field">
          <label className="s641-label">What do you manufacture?</label>
          <textarea
            className="s641-input s641-textarea"
            rows={3}
            placeholder="Describe your core products or manufacturing focus..."
            value={data.productDescription}
            onChange={(e) => onChange({ productDescription: e.target.value })}
          />
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
