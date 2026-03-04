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

  const valid = data.referralSource && data.signature.trim() && data.tosAgreed;

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

          {/* Certification — displayed at the top */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '0.82em', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
              I certify that I am legally authorized to receive taxpayer-funded assistance
              under federal law. I understand that, pursuant to Executive Order (issued
              February 19, 2025), the California Small Business Development Center is
              prohibited from providing services funded by taxpayer dollars to individuals
              not lawfully present in the United States. I affirm that the information
              provided is accurate.
            </p>
          </div>

          <div className={`s641-tos-body ${tosExpanded ? 's641-tos-expanded' : ''}`}>
            <p>
              I request business counseling service from the California Small Business
              Development Center (SBDC) Network, an SBA Resource Partner. I agree to
              cooperate should I be selected to participate in surveys designed to evaluate
              SBDC services. I understand that any information disclosed will be held in
              strict confidence. (The SBDC will not provide my personal information to
              commercial entities.) I authorize the SBDC to furnish relevant information
              to the assigned Business Advisor(s). I further understand that the
              advisor(s) agree not to:
            </p>
            <ul style={{ margin: '8px 0', paddingLeft: 24 }}>
              <li>recommend goods or services from sources in which he/she has an interest, and</li>
              <li>accept fees or commissions developing from this counseling relationship.</li>
            </ul>
            <p>
              In consideration of the counselor(s) furnishing management or technical
              assistance, I waive all claims against SBA personnel, and that of its Resource
              Partners, host organizations, and SBDC Advisors arising from this assistance.
            </p>
            <div className="s641-tos-highlight">
              By accepting these terms, I give my consent to participate in surveys designed
              to evaluate the services and impact of the California SBDC Network. Surveys
              are sent twice a year and responses are kept confidential. Responses typically
              take less than five minutes and ask about four key areas: business start-up,
              growth in sales, jobs created, and/or loans/grants.
            </div>
            <p style={{ fontSize: '0.85em', color: '#6b7280', marginTop: 12 }}>
              Please note: You are not required to respond to any collection information
              unless it displays a currently valid OMB approval number. Comments on the
              burden should be sent to: U.S. Small Business Administration, 409 3rd Street,
              SW, Washington, DC 20416, and to: Desk Officer SBA, Office of Management and
              Budget, New Executive Office Building, Room 10202, Washington, D.C., 20503.
              OMB Approval (3245-0324). PLEASE DO NOT SEND FORMS TO OMB.
            </p>
          </div>
          <button
            type="button"
            className="s641-tos-toggle"
            onClick={() => setTosExpanded(!tosExpanded)}
          >
            {tosExpanded ? 'Show less' : 'Read full terms'}
          </button>

          {/* Agreement checkbox */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              cursor: 'pointer',
              fontSize: '1.05em',
              fontWeight: 500,
              lineHeight: 1.4,
              color: '#1f2937',
            }}
          >
            <input
              type="checkbox"
              checked={data.tosAgreed}
              onChange={(e) => onChange({ tosAgreed: e.target.checked })}
              style={{ width: 20, height: 20, accentColor: '#1b3a5c', flexShrink: 0 }}
            />
            I have read and agree to the terms above.
          </label>
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
            disabled={!data.tosAgreed}
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
