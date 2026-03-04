'use client';

import type { RoadmapApplicationData } from '../types';

interface Props {
  data: RoadmapApplicationData;
  onChange: (patch: Partial<RoadmapApplicationData>) => void;
  onNext: () => void;
}

export default function ContactStep({ data, onChange, onNext }: Props) {
  const valid =
    data.firstName.trim() &&
    data.lastName.trim() &&
    data.email.trim() &&
    data.phone.trim();

  return (
    <div className="s641-step">
      <h2 className="s641-question">Tell us about yourself</h2>
      <p className="s641-subtitle">
        We&apos;ll use this to connect you with the right advisor or training program.
      </p>

      <div className="s641-fields">
        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">First Name</label>
            <input
              className="s641-input"
              placeholder="Jane"
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              autoFocus
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">Last Name</label>
            <input
              className="s641-input"
              placeholder="Smith"
              value={data.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">Email</label>
            <input
              className="s641-input"
              type="email"
              placeholder="jane@company.com"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">Phone</label>
            <input
              className="s641-input"
              type="tel"
              placeholder="(555) 123-4567"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">
            Your Position
          </label>
          <input
            className="s641-input"
            placeholder="Owner, Plant Manager, VP of Operations..."
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
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
