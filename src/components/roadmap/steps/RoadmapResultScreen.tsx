'use client';

import { useEffect, useRef } from 'react';
import type { RoadmapApplicationData, RoadmapSubmitResult } from '../types';

const CALENDLY_URL = 'https://calendly.com/maggie-132/sbdc-r4i';

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
        Your application has been received. Schedule your onboarding
        call below to get started.
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

      {/* Calendly Scheduling */}
      <CalendlyEmbed data={data} />
    </div>
  );
}

/* ── Calendly Inline Widget ─────────────────────────── */

function CalendlyEmbed({ data }: { data: RoadmapApplicationData }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams({
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      a1: data.phone,
    });
    const fullUrl = `${CALENDLY_URL}?${params.toString()}`;

    const existing = document.querySelector('script[src*="calendly.com/assets/external/widget.js"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => initWidget(fullUrl);
    } else {
      initWidget(fullUrl);
    }

    function initWidget(url: string) {
      if (containerRef.current && (window as any).Calendly) {
        (window as any).Calendly.initInlineWidget({
          url,
          parentElement: containerRef.current,
        });
      }
    }
  }, [data.firstName, data.lastName, data.email, data.phone]);

  return (
    <div className="s641-calendly">
      <div className="s641-calendly-header">Schedule your onboarding call</div>
      <p className="s641-calendly-desc">
        Pick a time that works for you — a quick call to review your
        goals and get matched with the right coach.
      </p>
      <div
        ref={containerRef}
        className="s641-calendly-widget"
      />
    </div>
  );
}
