'use client';

import Modal from '../ui/Modal';

interface WorkflowComingSoonModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WorkflowComingSoonModal({ open, onClose }: WorkflowComingSoonModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="px-8 pt-8 pb-8">
        {/* ─── Header ─── */}
        <div className="flex items-start justify-between mb-7">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[var(--royal)]/8 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[var(--royal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[20px] font-[var(--display)] font-bold text-[var(--text-primary)] tracking-[-0.02em]">
                Custom Workflows
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-[var(--sans)] text-[10px] font-semibold tracking-wider uppercase mt-1">
                In Progress
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid var(--rule-light)',
              background: 'transparent',
              color: 'var(--text-tertiary)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--rule-light)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        </div>

        {/* ─── Body ─── */}
        <div className="space-y-5 mb-8">
          <p className="text-[15px] font-[var(--sans)] font-light text-[var(--text-secondary)] leading-[1.7]">
            We&rsquo;re actively building guided, multi-step workflows for SBDC advisors — think of them like <strong className="font-semibold text-[var(--text-primary)]">Custom GPTs</strong>, but tuned specifically for your work.
          </p>

          <div className="rounded-xl border border-[var(--rule-light)] bg-[var(--cream)]/40 p-5 space-y-3">
            <p className="text-[11px] font-[var(--sans)] font-semibold tracking-[0.08em] uppercase text-[var(--text-tertiary)]">
              Planned workflows
            </p>
            <ul className="space-y-2.5">
              {[
                'Business Plan Outliner — guided structure from intake to draft',
                'Success Story Builder — structured narrative for impact reporting',
                'Client Session Prep — agenda and talking points from intake data',
                'Grant Narrative Assistant — step-by-step funding application support',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--royal)] shrink-0 mt-[7px]" />
                  <span className="text-[13px] font-[var(--sans)] font-light text-[var(--text-secondary)] leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[13px] font-[var(--sans)] font-light text-[var(--text-tertiary)] leading-relaxed">
            In the meantime, the <strong className="font-medium text-[var(--text-secondary)]">Prompt Library</strong> has advisor-specific prompts you can use right now.
          </p>
        </div>

        {/* ─── Footer ─── */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[var(--navy)] text-white rounded-full font-[var(--sans)] font-semibold text-[13px] tracking-wide hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}
