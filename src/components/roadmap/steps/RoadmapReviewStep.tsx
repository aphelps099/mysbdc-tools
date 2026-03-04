'use client';

import type { RoadmapApplicationData } from '../types';
import { COACHING_OPTIONS, GROUP_COURSE_OPTIONS, REFERRAL_SOURCES } from '../types';

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

  return (
    <div className="s641-step">
      <h2 className="s641-question">Review your application</h2>
      <p className="s641-subtitle">
        Please confirm your information below, then submit.
      </p>

      <div className="s641-summary">
        <SummaryRow label="Name" value={`${data.firstName} ${data.lastName}`} />
        <SummaryRow label="Email" value={data.email} />
        <SummaryRow label="Phone" value={data.phone} />
        {data.title && <SummaryRow label="Position" value={data.title} />}
        <SummaryRow label="Company" value={data.companyName} />
        <SummaryRow label="Location" value={`${data.city}, ${data.state} ${data.zipCode}`} />
        <SummaryRow label="Products" value={data.productDescription} />
        {coachingLabels && <SummaryRow label="Advising" value={coachingLabels} />}
        {courseLabels && <SummaryRow label="Courses" value={courseLabels} />}
        {data.biggestChallenge && <SummaryRow label="Challenge" value={data.biggestChallenge} />}
        {data.referralSource && <SummaryRow label="Referral" value={referralLabel} />}
        <SummaryRow label="Signature" value={data.signature} />
        {data.privacyRelease && <SummaryRow label="Privacy Release" value={data.privacyRelease} />}
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
      <span className="s641-summary-value">{value}</span>
    </div>
  );
}
