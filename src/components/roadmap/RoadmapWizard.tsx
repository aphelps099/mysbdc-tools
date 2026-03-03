'use client';

import { useState, useCallback, useEffect } from 'react';
import type { RoadmapApplicationData, RoadmapSubmitResult, RoadmapStepId } from './types';
import { createEmptyRoadmapApplication, getVisibleSteps } from './types';
import { submitRoadmapApplication } from './roadmap-api';
import ContactStep from './steps/ContactStep';
import CompanyStep from './steps/CompanyStep';
import InterestsStep from './steps/InterestsStep';
import RoadmapReviewStep from './steps/RoadmapReviewStep';
import RoadmapResultScreen from './steps/RoadmapResultScreen';
import '../intake/smart641.css';
import './roadmap.css';

/* ═══════════════════════════════════════════════════════
   Roadmap for Innovation — Application Wizard
   California SBDC small manufacturer coaching & training
   ═══════════════════════════════════════════════════════ */

function RoadmapSplash({ onContinue }: { onContinue: () => void }) {
  const [exiting, setExiting] = useState(false);

  const handleContinue = () => {
    setExiting(true);
    setTimeout(onContinue, 480);
  };

  return (
    <div className={`rm-splash${exiting ? ' rm-splash-exit' : ''}`}>
      {/* Logos */}
      <div className="rm-splash-logos">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://www.roadmap4innovation.com/hs-fs/hubfs/R4I-Logo-Solid-White.png?width=550&height=122&name=R4I-Logo-Solid-White.png"
          alt="Roadmap 4 Innovation"
          className="rm-splash-logo-r4i"
        />
        <div className="rm-splash-logo-divider" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://www.californiasbdc.org/wp-content/uploads/sites/34/2022/11/americas-sbdc-california-white-180h.png"
          alt="California SBDC"
          className="rm-splash-logo-sbdc"
        />
      </div>

      <div className="rm-splash-badge">A Statewide Partnership</div>
      <h1 className="rm-splash-title">Roadmap for Small Manufacturers</h1>
      <p className="rm-splash-sub">
        Free expert coaching and hands-on training to strengthen
        operations and grow your business.
      </p>

      <div className="rm-splash-highlights">
        <div className="rm-splash-stat">
          <span className="rm-splash-stat-value">100%</span>
          <span className="rm-splash-stat-label">No-Cost Program</span>
        </div>
        <div className="rm-splash-stat">
          <span className="rm-splash-stat-value">1:1</span>
          <span className="rm-splash-stat-label">Expert Coaching</span>
        </div>
        <div className="rm-splash-stat">
          <span className="rm-splash-stat-value">7+</span>
          <span className="rm-splash-stat-label">Focus Areas</span>
        </div>
      </div>

      <button className="rm-splash-btn" onClick={handleContinue}>
        Start Your Application
      </button>

      <span className="rm-splash-meta">Takes about 3 minutes</span>
    </div>
  );
}

export default function RoadmapWizard() {
  const [showSplash, setShowSplash] = useState(true);
  const [data, setData] = useState<RoadmapApplicationData>(createEmptyRoadmapApplication);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RoadmapSubmitResult | null>(null);

  const visibleSteps = getVisibleSteps();
  const currentStep = visibleSteps[stepIndex] as RoadmapStepId | undefined;
  const progress = visibleSteps.length > 0 ? (stepIndex / visibleSteps.length) * 100 : 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [stepIndex]);

  const onChange = useCallback((patch: Partial<RoadmapApplicationData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, visibleSteps.length - 1));
  }, [visibleSteps.length]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await submitRoadmapApplication(data);
      setResult(res);
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Submission failed',
      });
    } finally {
      setSubmitting(false);
    }
  }, [data]);

  if (showSplash) {
    return <RoadmapSplash onContinue={() => setShowSplash(false)} />;
  }

  if (result) {
    return (
      <div className="rm-theme">
        <div className="s641-shell">
          <div className="s641-content">
            <RoadmapResultScreen result={result} data={data} />
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'contact':
        return <ContactStep data={data} onChange={onChange} onNext={goNext} />;
      case 'company':
        return <CompanyStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'interests':
        return <InterestsStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'review':
        return <RoadmapReviewStep data={data} onBack={goBack} onSubmit={handleSubmit} submitting={submitting} />;
      default:
        return null;
    }
  };

  return (
    <div className="rm-theme">
      <div className="s641-shell">
        {/* Progress */}
        <div className="s641-progress">
          <div className="s641-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Content */}
        <div className="s641-content" key={currentStep}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
