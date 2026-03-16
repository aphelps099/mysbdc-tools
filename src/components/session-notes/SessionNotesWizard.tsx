'use client';

import { useState, useCallback } from 'react';
import type { SessionNoteData, SessionNoteResult, NeoserraClientOption, StepId } from './types';
import { createEmptySessionNote, STEP_ORDER } from './types';
import ClientLookupStep from './steps/ClientLookupStep';
import SelectClientStep from './steps/SelectClientStep';
import SessionDetailsStep from './steps/SessionDetailsStep';
import AiFormatStep from './steps/AiFormatStep';
import ReviewEditStep from './steps/ReviewEditStep';
import ResultScreen from './steps/ResultScreen';
import '../intake/smart641.css';
import '../milestones/milestones.css';
import './session-notes.css';

/* ═══════════════════════════════════════════════════════
   Session Notes Wizard — Typeform-style multi-step flow
   ═══════════════════════════════════════════════════════ */

export default function SessionNotesWizard() {
  const [data, setData] = useState<SessionNoteData>(createEmptySessionNote);
  const [stepIndex, setStepIndex] = useState(0);
  const [clients, setClients] = useState<NeoserraClientOption[]>([]);
  const [result, setResult] = useState<SessionNoteResult | null>(null);

  const currentStep = STEP_ORDER[stepIndex] as StepId | undefined;
  const progress = STEP_ORDER.length > 0 ? (stepIndex / STEP_ORDER.length) * 100 : 0;

  const onChange = useCallback((patch: Partial<SessionNoteData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Result screen (after submit)
  if (result) {
    return (
      <div className="s641-container">
        <ResultScreen result={result} />
      </div>
    );
  }

  return (
    <div className="s641-container">
      {/* Progress bar */}
      <div className="s641-progress">
        <div className="s641-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step content */}
      <div className="s641-body">
        {currentStep === 'client_lookup' && (
          <ClientLookupStep
            data={data}
            onChange={onChange}
            onNext={goNext}
            onClientsResolved={setClients}
          />
        )}

        {currentStep === 'select_client' && (
          <SelectClientStep
            data={data}
            onChange={onChange}
            onNext={goNext}
            onBack={goBack}
            clients={clients}
          />
        )}

        {currentStep === 'session_details' && (
          <SessionDetailsStep
            data={data}
            onChange={onChange}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {currentStep === 'ai_format' && (
          <AiFormatStep
            data={data}
            onChange={onChange}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {currentStep === 'review_edit' && (
          <ReviewEditStep
            data={data}
            onChange={onChange}
            onBack={goBack}
            onResult={setResult}
          />
        )}
      </div>
    </div>
  );
}
