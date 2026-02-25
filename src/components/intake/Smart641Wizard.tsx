'use client';

import { useState, useEffect, useCallback } from 'react';
import type { IntakeData, IntakeResult, CenterOption, StepId } from './types';
import { createEmptyIntake, getVisibleSteps } from './types';
import { submitIntake, fetchIntakeCenters } from './smart641-api';
import WelcomeStep from './steps/WelcomeStep';
import BusinessStatusStep from './steps/BusinessStatusStep';
import BusinessDetailsStep from './steps/BusinessDetailsStep';
import GoalsStep from './steps/GoalsStep';
import ProgramsStep from './steps/ProgramsStep';
import CapitalReadinessStep from './steps/CapitalReadinessStep';
import DemographicsStep from './steps/DemographicsStep';
import WrapupStep from './steps/WrapupStep';
import ReviewStep from './steps/ReviewStep';
import ResultScreen from './steps/ResultScreen';
import './smart641.css';

/* ═══════════════════════════════════════════════════════
   Smart 641 Wizard — Typeform-style multi-step intake
   ═══════════════════════════════════════════════════════ */

export default function Smart641Wizard() {
  const [data, setData] = useState<IntakeData>(createEmptyIntake);
  const [stepIndex, setStepIndex] = useState(0);
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<IntakeResult | null>(null);

  useEffect(() => {
    fetchIntakeCenters().then(setCenters);
  }, []);

  const visibleSteps = getVisibleSteps(data);
  const currentStep = visibleSteps[stepIndex] as StepId | undefined;
  const progress = visibleSteps.length > 0 ? ((stepIndex) / visibleSteps.length) * 100 : 0;

  const onChange = useCallback((patch: Partial<IntakeData>) => {
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

    const submitData = { ...data };
    if (!submitData.centerId && centers.length > 0) {
      submitData.centerId = centers[0].id;
    }

    try {
      const res = await submitIntake(submitData);
      setResult(res);
    } catch (err) {
      setResult({
        success: false,
        score: 0,
        track: 'advising',
        trackLabel: 'Advising-Ready',
        error: err instanceof Error ? err.message : 'Submission failed',
      });
    } finally {
      setSubmitting(false);
    }
  }, [data, centers]);

  if (result) {
    return (
      <div className="s641-shell">
        <div className="s641-content">
          <ResultScreen result={result} data={data} />
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep data={data} onChange={onChange} onNext={goNext} />;
      case 'business_status':
        return <BusinessStatusStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'business_details':
        return <BusinessDetailsStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'goals':
        return <GoalsStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'programs':
        return <ProgramsStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'capital_readiness':
        return <CapitalReadinessStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'demographics':
        return <DemographicsStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'wrapup':
        return <WrapupStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />;
      case 'review':
        return <ReviewStep data={data} centers={centers} onBack={goBack} onSubmit={handleSubmit} submitting={submitting} />;
      default:
        return null;
    }
  };

  return (
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
  );
}
