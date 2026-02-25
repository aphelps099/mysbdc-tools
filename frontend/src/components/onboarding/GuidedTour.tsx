'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface GuidedTourProps {
  open: boolean;
  onClose: () => void;
}

interface TourStep {
  target: string;          // data-tour attribute value
  title: string;
  description: string;
  placement: 'right' | 'bottom' | 'left' | 'top';
}

const steps: TourStep[] = [
  {
    target: 'ai-policy',
    title: 'AI Policy',
    description: 'Review the AI usage policy and compliance guardrails. When sensitive topics come up, the AI automatically adds a reminder.',
    placement: 'right',
  },
  {
    target: 'new-chat',
    title: 'New Conversation',
    description: 'Start a fresh conversation anytime. Your chat history is saved so you can pick up where you left off.',
    placement: 'right',
  },
  {
    target: 'workflows',
    title: 'Workflows',
    description: 'Guided, multi-step workflows like Success Story Builder walk you through complex tasks with structured prompts. More coming soon!',
    placement: 'right',
  },
  {
    target: 'events',
    title: 'SBDC Events',
    description: 'Browse upcoming NorCal SBDC workshops and events. Generate promotional copy or learn more about any event.',
    placement: 'right',
  },
  {
    target: 'chat-window',
    title: 'Chat Window',
    description: 'Your main workspace. Draft content, research topics, prep for client sessions, or brainstorm ideas. Past conversations appear in the sidebar.',
    placement: 'left',
  },
  {
    target: 'prompt-library',
    title: 'Prompt Library',
    description: 'Curated, advisor-specific prompt templates — session prep, success stories, funding research, and more. A great place to start!',
    placement: 'right',
  },
];

const TOOLTIP_WIDTH = 280;
const TOOLTIP_GAP = 12;
const SPOTLIGHT_PAD = 6;

export default function GuidedTour({ open, onClose }: GuidedTourProps) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const current = steps[step];

  // Ensure portal target exists (client-only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Measure the target element and compute tooltip position
  const measure = useCallback(() => {
    if (!open) return;
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (!el) {
      setRect(null);
      setTooltipPos(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect(r);

    // Compute tooltip position based on placement
    const tooltipHeight = tooltipRef.current?.offsetHeight || 160;
    let top = 0;
    let left = 0;

    switch (current.placement) {
      case 'right':
        top = r.top + r.height / 2 - tooltipHeight / 2;
        left = r.right + TOOLTIP_GAP;
        break;
      case 'left':
        top = r.top + r.height / 2 - tooltipHeight / 2;
        left = r.left - TOOLTIP_WIDTH - TOOLTIP_GAP;
        break;
      case 'bottom':
        top = r.bottom + TOOLTIP_GAP;
        left = r.left + r.width / 2 - TOOLTIP_WIDTH / 2;
        break;
      case 'top':
        top = r.top - tooltipHeight - TOOLTIP_GAP;
        left = r.left + r.width / 2 - TOOLTIP_WIDTH / 2;
        break;
    }

    // Clamp within viewport
    top = Math.max(8, Math.min(top, window.innerHeight - tooltipHeight - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 8));

    setTooltipPos({ top, left });
  }, [open, current]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  // Re-measure after render when tooltip height becomes known
  useEffect(() => {
    if (open && rect) {
      requestAnimationFrame(measure);
    }
  }, [open, step, rect, measure]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  const handleNext = () => {
    if (step === steps.length - 1) {
      handleClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  if (!open || !mounted) return null;

  // Spotlight cutout dimensions
  const spotX = rect ? rect.left - SPOTLIGHT_PAD : 0;
  const spotY = rect ? rect.top - SPOTLIGHT_PAD : 0;
  const spotW = rect ? rect.width + SPOTLIGHT_PAD * 2 : 0;
  const spotH = rect ? rect.height + SPOTLIGHT_PAD * 2 : 0;

  return createPortal(
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'auto' }}>
      {/* ─── Overlay with spotlight cutout ─── */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={spotX}
                y={spotY}
                width={spotW}
                height={spotH}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%"
          fill="rgba(10, 22, 40, 0.55)"
          mask="url(#tour-spotlight-mask)"
          style={{ pointerEvents: 'auto' }}
          onClick={handleClose}
        />
      </svg>

      {/* ─── Spotlight border ring ─── */}
      {rect && (
        <div
          className="absolute rounded-lg border-2 border-[var(--royal)] transition-all duration-300 ease-out"
          style={{
            top: spotY,
            left: spotX,
            width: spotW,
            height: spotH,
            pointerEvents: 'none',
            boxShadow: '0 0 0 2px rgba(29, 90, 167, 0.25)',
          }}
        />
      )}

      {/* ─── Tooltip ─── */}
      {tooltipPos && (
        <div
          ref={tooltipRef}
          className="absolute bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-[var(--rule)] transition-all duration-300 ease-out"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            width: TOOLTIP_WIDTH,
            pointerEvents: 'auto',
          }}
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold font-[var(--sans)] text-[var(--text-primary)]">
              {current.title}
            </h3>
            <button
              onClick={handleClose}
              className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--cream)] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-5 pb-3">
            <p className="text-[13px] font-[var(--sans)] font-light text-[var(--text-secondary)] leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Footer */}
          <div className="px-5 pb-4 flex items-center justify-between">
            {/* Step indicator */}
            <span className="text-[11px] font-[var(--mono)] text-[var(--text-tertiary)] tracking-wider">
              {step + 1} / {steps.length}
            </span>

            {/* Navigation */}
            <div className="flex items-center gap-1.5">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium font-[var(--sans)] text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-1.5 bg-[var(--royal)] text-white rounded-lg text-[12px] font-medium font-[var(--sans)] hover:bg-[#1a4f96] active:bg-[#164282] transition-colors cursor-pointer"
              >
                {step === steps.length - 1 ? 'Done' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
