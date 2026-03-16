'use client';

import type { SessionNoteResult } from '../types';

interface Props {
  result: SessionNoteResult;
}

export default function ResultScreen({ result }: Props) {
  if (!result.success) {
    return (
      <div className="s641-result">
        <div className="s641-result-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="26" stroke="#dc2626" strokeWidth="2"/>
            <path d="M28 18V32" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="28" cy="38" r="1.5" fill="#dc2626"/>
          </svg>
        </div>
        <h2 className="s641-result-title">Submission failed</h2>
        <p className="s641-result-desc">
          The session note could not be saved to NeoSerra.
        </p>
        {result.error && (
          <div className="s641-result-error">
            {result.error}
          </div>
        )}
        <div style={{ marginTop: 24 }}>
          <a href="/session-notes" className="s641-btn s641-btn-primary" style={{ textDecoration: 'none' }}>
            Try Again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="s641-result">
      <div className="s641-result-icon">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="26" stroke="#16a34a" strokeWidth="2"/>
          <path d="M18 28L25 35L38 21" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <p style={{
        fontFamily: 'var(--era-text)',
        fontSize: 12,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
        fontWeight: 600,
        color: '#16a34a',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Submitted
      </p>

      <h2 className="s641-result-title">Session note saved</h2>
      <p className="s641-result-desc">
        The counseling record has been created in NeoSerra.
        {result.counselingId && (
          <> Record ID: <strong>{result.counselingId}</strong></>
        )}
      </p>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="/session-notes" className="s641-btn s641-btn-primary" style={{ textDecoration: 'none' }}>
          Add Another Note
        </a>
        <a href="/" className="s641-btn s641-btn-back" style={{ textDecoration: 'none' }}>
          Back to Tools
        </a>
      </div>
    </div>
  );
}
