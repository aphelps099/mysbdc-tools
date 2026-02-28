'use client';

import type { TFGApplicationData } from '../types';

interface Props {
  data: TFGApplicationData;
  onChange: (patch: Partial<TFGApplicationData>) => void;
  onNext: () => void;
}

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','DC','WV','WI','WY',
];

export default function CompanyContactStep({ data, onChange, onNext }: Props) {
  const valid =
    data.companyName.trim() &&
    data.firstName.trim() &&
    data.lastName.trim() &&
    data.email.trim() &&
    data.phone.trim() &&
    data.streetAddress.trim() &&
    data.city.trim() &&
    data.state &&
    data.zipCode.trim() &&
    data.stateOfIncorporation.trim();

  return (
    <div className="s641-step">
      <h2 className="s641-question">Company &amp; Contact</h2>
      <p className="s641-subtitle">
        Tell us about your company and how to reach you.
      </p>

      <div className="s641-fields">
        {/* ── Box 1: Company ── */}
        <div className="tfg-box">
          <div className="tfg-box-row">
            <div className="tfg-box-cell">
              <label className="s641-label">Company Name *</label>
              <input
                className="s641-input"
                placeholder="Acme Corp"
                value={data.companyName}
                onChange={(e) => onChange({ companyName: e.target.value })}
                autoFocus
              />
            </div>
            <div className="tfg-box-cell">
              <label className="s641-label">Website</label>
              <input
                className="s641-input"
                type="url"
                placeholder="https://"
                value={data.website}
                onChange={(e) => onChange({ website: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* ── Box 2: Contact ── */}
        <div className="tfg-box">
          <div className="tfg-box-row">
            <div className="tfg-box-cell">
              <label className="s641-label">First Name *</label>
              <input
                className="s641-input"
                placeholder="Jane"
                value={data.firstName}
                onChange={(e) => onChange({ firstName: e.target.value })}
              />
            </div>
            <div className="tfg-box-cell">
              <label className="s641-label">Last Name *</label>
              <input
                className="s641-input"
                placeholder="Smith"
                value={data.lastName}
                onChange={(e) => onChange({ lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="tfg-box-row">
            <div className="tfg-box-cell">
              <label className="s641-label">Email *</label>
              <input
                className="s641-input"
                type="email"
                placeholder="jane@example.com"
                value={data.email}
                onChange={(e) => onChange({ email: e.target.value })}
              />
            </div>
            <div className="tfg-box-cell">
              <label className="s641-label">Phone *</label>
              <input
                className="s641-input"
                type="tel"
                placeholder="(555) 123-4567"
                value={data.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
              />
            </div>
          </div>
          <div className="tfg-box-row tfg-box-row-1">
            <div className="tfg-box-cell">
              <label className="s641-label">LinkedIn</label>
              <input
                className="s641-input"
                type="url"
                placeholder="https://linkedin.com/in/"
                value={data.linkedin}
                onChange={(e) => onChange({ linkedin: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* ── Box 3: Address ── */}
        <div className="tfg-box">
          <div className="tfg-box-row tfg-box-row-1">
            <div className="tfg-box-cell">
              <label className="s641-label">Street Address *</label>
              <input
                className="s641-input"
                placeholder="123 Main Street"
                value={data.streetAddress}
                onChange={(e) => onChange({ streetAddress: e.target.value })}
              />
            </div>
          </div>
          <div className="tfg-box-row tfg-box-row-3">
            <div className="tfg-box-cell">
              <label className="s641-label">City *</label>
              <input
                className="s641-input"
                placeholder="Sacramento"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
              />
            </div>
            <div className="tfg-box-cell">
              <label className="s641-label">State *</label>
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
            <div className="tfg-box-cell">
              <label className="s641-label">ZIP *</label>
              <input
                className="s641-input"
                placeholder="95814"
                value={data.zipCode}
                onChange={(e) => onChange({ zipCode: e.target.value })}
                maxLength={10}
              />
            </div>
          </div>
          <div className="tfg-box-row tfg-box-row-1">
            <div className="tfg-box-cell">
              <label className="s641-label">State of Incorporation *</label>
              <select
                className="s641-select"
                value={data.stateOfIncorporation}
                onChange={(e) => onChange({ stateOfIncorporation: e.target.value })}
              >
                <option value="">Select state...</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="s641-nav">
        <div />
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
