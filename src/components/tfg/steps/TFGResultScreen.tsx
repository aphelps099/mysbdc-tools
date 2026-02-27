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
            with next steps.
          </p>

          {/* Calendly scheduling CTA */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--tfg-border, rgba(255,255,255,0.08))' }}>
            <p className="s641-result-desc" style={{ marginBottom: 16, fontSize: 14 }}>
              <strong style={{ color: 'var(--tfg-text, #e2e6eb)' }}>Get ahead &mdash; schedule your intro call now</strong>
            </p>
            <a
              href="https://calendly.com/gabrielsalazar/techfuturesgroup"
              target="_blank"
              rel="noopener noreferrer"
              className="s641-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                fontSize: 14,
                padding: '12px 24px',
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Schedule on Calendly
            </a>
          </div>
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
