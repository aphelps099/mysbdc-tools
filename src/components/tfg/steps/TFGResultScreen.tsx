'use client';

import type { TFGSubmitResult, TFGApplicationData } from '../types';

interface Props {
  result: TFGSubmitResult;
  data: TFGApplicationData;
}

export default function TFGResultScreen({ result, data }: Props) {
  return (
    <div className="s641-result">
      {result.success ? (
        <>
          {/* Success icon */}
          <div className="s641-result-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="var(--tfg-accent, #4eff00)" strokeWidth="2" />
              <path
                d="M20 32L28 40L44 24"
                stroke="var(--tfg-accent, #4eff00)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="s641-result-title">
            Thank you, {data.firstName}!
          </h1>

          <p className="s641-result-desc">
            Your application for <strong>{data.companyName}</strong> has been submitted
            to Tech Futures Group. Our team will review it and you can expect to hear
            from us within <strong>7&ndash;10 business days</strong> regarding next steps.
          </p>

          <div className="s641-result-badge">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Application Received
          </div>

          <p className="s641-result-desc" style={{ marginTop: 24, fontSize: 14 }}>
            Check your email at <strong>{data.email}</strong> for a confirmation message
            with next steps including scheduling your interview.
          </p>
        </>
      ) : (
        <>
          {/* Error icon */}
          <div className="s641-result-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#f87171" strokeWidth="2" />
              <path d="M24 24L40 40M40 24L24 40" stroke="#f87171" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 className="s641-result-title">Something went wrong</h1>

          <p className="s641-result-desc">
            We couldn&rsquo;t submit your application. Please try again or contact
            TFG directly.
          </p>

          {result.error && (
            <div className="s641-result-error">
              {result.error}
            </div>
          )}
        </>
      )}
    </div>
  );
}
