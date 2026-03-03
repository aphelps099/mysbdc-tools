'use client';

import { useState } from 'react';
import type { RoadmapApplicationData } from '../types';
import { REFERRAL_SOURCES } from '../types';

interface Props {
  data: RoadmapApplicationData;
  onChange: (patch: Partial<RoadmapApplicationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function RoadmapWrapupStep({ data, onChange, onNext, onBack }: Props) {
  const [tosExpanded, setTosExpanded] = useState(false);

  const valid = data.referralSource && data.signature.trim();

  return (
    <div className="s641-step">
      <h2 className="s641-question">Almost there</h2>
      <p className="s641-subtitle">
        Just a few final items before you review and submit.
      </p>

      <div className="s641-fields" style={{ gap: 24 }}>
        {/* Referral */}
        <div className="s641-field">
          <label className="s641-label">How did you hear about this program?</label>
          <select
            className="s641-select"
            value={data.referralSource}
            onChange={(e) => onChange({ referralSource: e.target.value })}
          >
            {REFERRAL_SOURCES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {data.referralSource === 'other' && (
            <input
              className="s641-input"
              placeholder="Please specify..."
              value={data.referralOther}
              onChange={(e) => onChange({ referralOther: e.target.value })}
              style={{ marginTop: 8 }}
            />
          )}
        </div>

        {/* Terms of Service */}
        <div className="s641-tos">
          <div className="s641-tos-header">Information Notice — OMB Approval No.: 3245-0324</div>
          <div className={`s641-tos-body ${tosExpanded ? 's641-tos-expanded' : ''}`}>
            <p>
              I request business counseling service from the California Small Business
              Development Center (SBDC) Network, an SBA Resource Partner. I agree to
              cooperate should I be selected to participate in surveys designed to evaluate
              SBDC services. I understand that any information disclosed will be held in
              strict confidence.
            </p>
            <p>
              I authorize the SBDC to furnish relevant information to the assigned Business
              Advisor(s). I further understand that the advisor(s) agree not to recommend
              goods or services from sources in which they have an interest, and not to
              accept fees or commissions developing from this counseling relationship.
            </p>
            <p>
              In consideration of the counselor(s) furnishing management or technical
              assistance, I waive all claims against SBA personnel, and that of its Resource
              Partners, host organizations, and SBDC Advisors arising from this assistance.
            </p>
            <div className="s641-tos-highlight">
              By accepting these terms, I give my consent to participate in surveys designed
              to evaluate the services and impact of the California SBDC Network.
            </div>
          </div>
          <button
            type="button"
            className="s641-tos-toggle"
            onClick={() => setTosExpanded(!tosExpanded)}
          >
            {tosExpanded ? 'Show less' : 'Read full terms'}
          </button>
        </div>

        {/* Signature */}
        <div className="s641-field">
          <label className="s641-label">Signature</label>
          <p className="s641-hint">Type your full name to accept the terms above.</p>
          <input
            className="s641-input s641-input-signature"
            placeholder="Jane A. Smith"
            value={data.signature}
            onChange={(e) => onChange({ signature: e.target.value })}
          />
        </div>

        {/* Privacy Release */}
        <div className="s641-field">
          <label className="s641-label">Privacy Release <span className="s641-optional">(optional)</span></label>
          <p className="s641-hint">
            I permit SBA or its agent the use of my name and address for surveys and
            information mailings. Not required for SBDC services.
          </p>
          <div className="s641-pills" style={{ marginTop: 8 }}>
            {['Yes', 'No'].map((val) => (
              <button
                key={val}
                className={`s641-pill ${data.privacyRelease === val ? 'selected' : ''}`}
                onClick={() => onChange({ privacyRelease: val })}
              >
                {val === 'Yes' ? 'Yes' : 'No thanks'}
              </button>
            ))}
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
        <button className="s641-btn s641-btn-primary" disabled={!valid} onClick={onNext}>
          Review &amp; Submit
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
