'use client';

import { useState, useCallback, useEffect } from 'react';
import type { TFGApplicationData, TFGSubmitResult, TFGStepId } from './types';
import { createEmptyTFGApplication, getVisibleSteps, calculateReadinessScore } from './types';
import { submitTFGApplication } from './tfg-api';
import CompanyContactStep from './steps/CompanyContactStep';
import IndustrySectorStep from './steps/IndustrySectorStep';
import VisionProductStep from './steps/VisionProductStep';
import MarketValidationStep from './steps/MarketValidationStep';
import TractionRevenueStep from './steps/TractionRevenueStep';
import FinancingRunwayStep from './steps/FinancingRunwayStep';
import TeamStep from './steps/TeamStep';
import SupportReferralStep from './steps/SupportReferralStep';
import TFGReviewStep from './steps/TFGReviewStep';
import TFGResultScreen from './steps/TFGResultScreen';
import '../intake/smart641.css';
import './tfg.css';

/* ═══════════════════════════════════════════════════════
   TFG Application Wizard — Typeform-style multi-step form
   Uses the Neoserra PIN/custom form system for submission.
   ═══════════════════════════════════════════════════════ */

/* ── Splash / gate screen ── */
function TFGSplash({ onContinue }: { onContinue: () => void }) {
  const [exiting, setExiting] = useState(false);

  const handleContinue = () => {
    setExiting(true);
    setTimeout(onContinue, 480); // matches animation duration
  };

  return (
    <div className={`tfg-splash${exiting ? ' tfg-splash-exit' : ''}`}>
      <h1 className="tfg-splash-title">Apply to TFG</h1>
      <p className="tfg-splash-sub">Tech Futures Group</p>

      <p className="tfg-splash-terms">
        This application is for <strong>early-stage technology startups</strong> in
        the NorCal SBDC region seeking mentorship, investor connections, and
        growth support. You&apos;ll need details about your company, product,
        traction, team, and financing.
      </p>

      <button className="tfg-splash-btn" onClick={handleContinue}>
        Begin Application
      </button>

      <span className="tfg-splash-meta">Takes about 10 minutes</span>
    </div>
  );
}

export default function TFGWizard() {
  const [showSplash, setShowSplash] = useState(true);
  const [data, setData] = useState<TFGApplicationData>(createEmptyTFGApplication);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TFGSubmitResult | null>(null);

  const visibleSteps = getVisibleSteps();
  const currentStep = visibleSteps[stepIndex] as TFGStepId | undefined;
  const progress = visibleSteps.length > 0 ? (stepIndex / visibleSteps.length) * 100 : 0;

  /* Scroll to top of form whenever the step changes */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [stepIndex]);

  const onChange = useCallback((patch: Partial<TFGApplicationData>) => {
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
      // Calculate readiness score (sent to backend, never shown to client)
      const score = calculateReadinessScore(data);
      const submitData = { ...data, readinessScore: score };

      // Single multipart submission (JSON fields + pitch deck file)
      const res = await submitTFGApplication(submitData);
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
    return <TFGSplash onContinue={() => setShowSplash(false)} />;
  }

  if (result) {
    return (
      <div className="tfg-theme">
        <div className="s641-shell">
          <div className="s641-content">
            <TFGResultScreen result={result} data={data} />
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'company_contact':
        return <CompanyContactStep data={data} onChange={onChange} onNext={goNext} />;
      case 'industry':
        return <IndustrySectorStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'vision_product':
        return <VisionProductStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'market_validation':
        return <MarketValidationStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'traction_revenue':
        return <TractionRevenueStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'financing_runway':
        return <FinancingRunwayStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'team':
        return <TeamStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'support_referral':
        return <SupportReferralStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'review':
        return <TFGReviewStep data={data} onBack={goBack} onSubmit={handleSubmit} submitting={submitting} />;
      default:
        return null;
    }
  };

  return (
    <div className="tfg-theme">
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
