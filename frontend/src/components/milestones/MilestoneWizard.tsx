'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { MilestoneData, MilestoneResult, NeoserraClientOption, StepId } from './types';
import { createEmptyMilestone, getVisibleSteps } from './types';
import { submitMilestones, lookupContactById } from './milestones-api';
import ContactLookupStep from './steps/ContactLookupStep';
import SelectBusinessStep from './steps/SelectBusinessStep';
import SelectMilestonesStep from './steps/SelectMilestonesStep';
import EmployeesStep from './steps/EmployeesStep';
import SalesStep from './steps/SalesStep';
import NewBusinessStep from './steps/NewBusinessStep';
import FundingStep from './steps/FundingStep';
import TestimonialStep from './steps/TestimonialStep';
import MilestoneResultScreen from './steps/MilestoneResultScreen';
import { useLanguage } from './i18n';
import '../intake/smart641.css';
import './milestones.css';

/* ═══════════════════════════════════════════════════════
   Milestone Wizard — Typeform-style multi-step collection
   ═══════════════════════════════════════════════════════ */

export default function MilestoneWizard() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [data, setData] = useState<MilestoneData>(createEmptyMilestone);
  const [stepIndex, setStepIndex] = useState(0);
  const [clients, setClients] = useState<NeoserraClientOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<MilestoneResult | null>(null);
  const [deepLinkLoading, setDeepLinkLoading] = useState(false);

  // Handle URL parameters on mount
  useEffect(() => {
    const program = searchParams.get('program') || '';
    const contactId = searchParams.get('contact') || '';
    const firstName = searchParams.get('first_name') || '';

    if (program) {
      setData((prev) => ({ ...prev, program }));
    }

    // Deep-link: if contact ID provided, skip to business selection
    if (contactId) {
      setDeepLinkLoading(true);
      setData((prev) => ({
        ...prev,
        contactId,
        firstName: firstName || prev.firstName,
        program,
      }));

      lookupContactById(contactId)
        .then((lookupResult) => {
          if (lookupResult.found && lookupResult.contact && lookupResult.clients.length > 0) {
            setData((prev) => ({
              ...prev,
              contactId: lookupResult.contact!.id,
              contactEmail: lookupResult.contact!.email,
              firstName: firstName || lookupResult.contact!.first,
              lastName: lookupResult.contact!.last,
            }));
            setClients(lookupResult.clients);
            setStepIndex(1); // Jump to Select Business
          }
        })
        .catch(() => {
          // Silently fall back to normal flow
        })
        .finally(() => setDeepLinkLoading(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleSteps = getVisibleSteps(data);
  const currentStep = visibleSteps[stepIndex] as StepId | undefined;
  const progress = visibleSteps.length > 0 ? (stepIndex / visibleSteps.length) * 100 : 0;

  const onChange = useCallback((patch: Partial<MilestoneData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, visibleSteps.length - 1));
  }, [visibleSteps.length]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleClientsResolved = useCallback((resolved: NeoserraClientOption[]) => {
    setClients(resolved);
    // If only one client, auto-select it
    if (resolved.length === 1) {
      const c = resolved[0];
      setData((prev) => ({
        ...prev,
        clientId: c.id,
        clientPublicId: c.clientId,
        clientName: c.company,
        initialFtEmps: c.ftEmps,
        initialPtEmps: c.ptEmps,
        initialGrossSales: c.grossSales,
        clientCenterId: c.centerId || '',
        counselorId: c.counselorId || '',
      }));
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await submitMilestones(data);
      setResult(res);
    } catch (err) {
      setResult({
        success: false,
        recordsCreated: 0,
        details: [],
        error: err instanceof Error ? err.message : 'Submission failed',
      });
    } finally {
      setSubmitting(false);
    }
  }, [data]);

  if (deepLinkLoading) {
    return (
      <div className="s641-shell">
        <div className="s641-content">
          <div className="ms-lookup-loading">
            <div className="s641-spinner" />
            <p className="ms-lookup-loading-text">{t('result.deepLinkLoading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="s641-shell">
        <div className="s641-content">
          <MilestoneResultScreen result={result} data={data} />
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'contact_lookup':
        return (
          <ContactLookupStep
            data={data}
            onChange={onChange}
            onNext={goNext}
            onClientsResolved={handleClientsResolved}
          />
        );
      case 'select_business':
        return (
          <SelectBusinessStep
            data={data}
            onChange={onChange}
            onNext={goNext}
            onBack={goBack}
            clients={clients}
          />
        );
      case 'select_milestones':
        return (
          <SelectMilestonesStep
            data={data}
            onChange={onChange}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 'employees':
        return (
          <EmployeesStep
            data={data}
            onChange={onChange}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 'sales':
        return (
          <SalesStep
            data={data}
            onChange={onChange}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 'new_business':
        return (
          <NewBusinessStep
            data={data}
            onChange={onChange}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 'funding':
        return (
          <FundingStep
            data={data}
            onChange={onChange}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 'testimonial':
        return (
          <TestimonialStep
            data={data}
            onChange={onChange}
            onBack={goBack}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        );
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
