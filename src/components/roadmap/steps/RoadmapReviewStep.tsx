'use client';

import type { RoadmapApplicationData } from '../types';
import {
  COACHING_OPTIONS,
  GROUP_COURSE_OPTIONS,
  POSITION_OPTIONS,
  REFERRAL_SOURCES,
  YEARS_RANGES,
} from '../types';

interface Props {
  data: RoadmapApplicationData;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function RoadmapReviewStep({ data, onBack, onSubmit, submitting }: Props) {
  if (submitting) {
    return (
      <div className="s641-submitting">
        <div className="s641-spinner" />
        <p className="s641-submitting-text">Submitting your application...</p>
      </div>
    );
  }

  const coachingLabels = data.coachingInterests
    .map((id) => COACHING_OPTIONS.find((o) => o.id === id)?.label || id)
    .join(', ');

  const courseLabels = data.groupCourses
    .map((id) => GROUP_COURSE_OPTIONS.find((o) => o.id === id)?.label || id)
    .join(', ');

  const referralLabel = REFERRAL_SOURCES.find((r) => r.value === data.referralSource)?.label || data.referralSource;
  const positionLabel = POSITION_OPTIONS.find((o) => o.value === data.title)?.label || data.title;
  const yearsLabel = YEARS_RANGES.find((y) => y.value === data.yearsInOperation)?.label || data.yearsInOperation;

  return (
    <div className="s641-step">
      <h2 className="s641-question">Review your application</h2>
      <p className="s641-subtitle">
        Please confirm your information below, then submit.
      </p>

      {/* Every form field is shown — blanks render as "—" so nothing is hidden */}
      <div className="s641-summary">
        <SummaryRow label="Name" value={`${data.firstName} ${data.lastName}`.trim()} />
        <SummaryRow label="Email" value={data.email} />
        <SummaryRow label="Phone" value={data.phone} />
        <SummaryRow label="Position" value={positionLabel} />
        <SummaryRow label="Company" value={data.companyName} />
        <SummaryRow label="Website" value={data.website} />
        <SummaryRow label="Street Address" value={data.streetAddress} />
        <SummaryRow label="City / State / ZIP" value={[data.city, data.state, data.zipCode].filter(Boolean).join(', ')} />
        <SummaryRow label="Established" value={data.dateEstablished} />
        <SummaryRow label="Years in Operation" value={yearsLabel} />
        <SummaryRow label="Products" value={data.productDescription} />
        <SummaryRow label="Advising" value={coachingLabels} />
        <SummaryRow label="Courses" value={courseLabels} />
        <SummaryRow label="Challenge" value={data.biggestChallenge} />
        <SummaryRow label="Referral" value={referralLabel} />
        {data.referralSource === 'other' && (
          <SummaryRow label="Referral (Other)" value={data.referralOther} />
        )}
        <SummaryRow label="Signature" value={data.signature} />
        <SummaryRow label="Privacy Release" value={data.privacyRelease} />
      </div>

      <div className="s641-nav" style={{ paddingTop: 32 }}>
        <button className="s641-btn s641-btn-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button
          className="s641-btn s641-btn-primary s641-btn-submit"
          onClick={onSubmit}
        >
          Submit Application
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="s641-summary-row">
      <span className="s641-summary-label">{label}</span>
      <span className="s641-summary-value">{value || '—'}</span>
    </div>
  );
}
