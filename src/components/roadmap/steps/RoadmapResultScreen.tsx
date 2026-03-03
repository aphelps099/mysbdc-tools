'use client';

import type { RoadmapApplicationData, RoadmapSubmitResult } from '../types';

interface Props {
  result: RoadmapSubmitResult;
  data: RoadmapApplicationData;
}

export default function RoadmapResultScreen({ result, data }: Props) {
  return (
    <div className="s641-result">
      {/* Success icon */}
      <div className="s641-result-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" stroke="var(--rm-accent, #4c8cff)" strokeWidth="2"/>
          <path d="M15 24L21 30L33 18" stroke="var(--rm-accent, #4c8cff)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2 className="s641-result-title">
        Thank you, {data.firstName}!
      </h2>
      <p className="s641-result-desc">
        Your application to the California Roadmap for Small Manufacturers
        program has been received. Our team will review your information and
        reach out to schedule your first coaching session.
      </p>

      {result.success && (
        <div className="s641-result-badge" style={{ background: 'rgba(76, 140, 255, 0.06)', color: '#4c8cff' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Application submitted successfully
        </div>
      )}

      {result.error && (
        <div className="s641-result-error">
          There was an issue submitting your application: {result.error}
        </div>
      )}

      <div className="rm-result-next-steps">
        <h3 className="rm-result-next-title">What happens next?</h3>
        <ol className="rm-result-next-list">
          <li>A program coordinator will review your application</li>
          <li>You&apos;ll receive an email confirmation within 2 business days</li>
          <li>We&apos;ll match you with a coach based on your interests</li>
          <li>Your first coaching session will be scheduled</li>
        </ol>
      </div>
    </div>
  );
}
