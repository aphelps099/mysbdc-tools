'use client';

import { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import PromptCard from './PromptCard';
import { usePrompts } from '@/hooks/usePrompts';
import type { Prompt } from '@/lib/types';

/* ── Sample prompts shown when API hasn't loaded or returns empty ── */
const SAMPLE_PROMPTS: Prompt[] = [
  {
    id: 901,
    title: 'Business Plan Review',
    category: 'advising',
    categoryLabel: 'Client Advising',
    description: 'Analyze a client\'s business plan for completeness, viability, and areas needing improvement.',
    tags: ['business plan', 'review', 'analysis'],
    prompt: 'Review this business plan and provide feedback on the executive summary, market analysis, financial projections, and overall viability. Highlight strengths and areas for improvement.',
  },
  {
    id: 902,
    title: 'Cash Flow Analysis',
    category: 'advising',
    categoryLabel: 'Client Advising',
    description: 'Help a client understand their cash flow patterns and identify potential issues before they arise.',
    tags: ['cash flow', 'finance', 'analysis'],
    prompt: 'Analyze the following cash flow data and identify trends, potential shortfalls, and recommendations for improving cash flow management.',
  },
  {
    id: 903,
    title: 'Funding Readiness Assessment',
    category: 'advising',
    categoryLabel: 'Client Advising',
    description: 'Evaluate whether a business is prepared to seek funding and what steps remain.',
    tags: ['funding', 'readiness', 'assessment'],
    prompt: 'Assess this business\'s readiness for funding. Consider their financials, business plan, market position, and documentation completeness.',
  },
  {
    id: 904,
    title: 'SWOT Analysis Facilitator',
    category: 'advising',
    categoryLabel: 'Client Advising',
    description: 'Guide a structured SWOT analysis to identify strengths, weaknesses, opportunities, and threats.',
    tags: ['swot', 'strategy', 'analysis'],
    prompt: 'Conduct a SWOT analysis for this business. Help identify internal strengths and weaknesses, and external opportunities and threats.',
  },
  {
    id: 905,
    title: 'Impact Narrative Writer',
    category: 'admin',
    categoryLabel: 'Admin & Reporting',
    description: 'Draft compelling impact narratives from milestone data for grant reporting and stakeholders.',
    tags: ['impact', 'narrative', 'reporting'],
    prompt: 'Write a compelling impact narrative based on the following client milestone data. Focus on measurable outcomes and human stories.',
  },
  {
    id: 906,
    title: 'Session Notes Formatter',
    category: 'admin',
    categoryLabel: 'Admin & Reporting',
    description: 'Transform rough advising session notes into structured, professional documentation.',
    tags: ['notes', 'formatting', 'documentation'],
    prompt: 'Format these rough session notes into a structured advising session summary with key topics discussed, action items, and next steps.',
  },
  {
    id: 907,
    title: 'Quarterly Report Draft',
    category: 'admin',
    categoryLabel: 'Admin & Reporting',
    description: 'Generate a quarterly progress report draft from center performance data and milestones.',
    tags: ['quarterly', 'report', 'draft'],
    prompt: 'Draft a quarterly progress report based on the following center performance metrics, client milestones, and program activities.',
  },
  {
    id: 908,
    title: 'Email Follow-up Templates',
    category: 'admin',
    categoryLabel: 'Admin & Reporting',
    description: 'Create personalized follow-up emails for post-session client communication.',
    tags: ['email', 'follow-up', 'templates'],
    prompt: 'Write a professional follow-up email for a client advising session. Include a summary of what was discussed and clear next steps.',
  },
  {
    id: 909,
    title: 'Workshop Curriculum Builder',
    category: 'training',
    categoryLabel: 'Training',
    description: 'Design a structured workshop curriculum with learning objectives, activities, and materials.',
    tags: ['workshop', 'curriculum', 'training'],
    prompt: 'Design a workshop curriculum for the following topic. Include learning objectives, agenda, key activities, and recommended materials.',
  },
  {
    id: 910,
    title: 'New Advisor Orientation',
    category: 'training',
    categoryLabel: 'Training',
    description: 'Create an onboarding guide covering SBDC processes, tools, and advising best practices.',
    tags: ['onboarding', 'orientation', 'advisor'],
    prompt: 'Create an onboarding guide for a new SBDC advisor covering key processes, available tools, compliance requirements, and advising best practices.',
  },
  {
    id: 911,
    title: 'Market Research Kickstart',
    category: 'marketing',
    categoryLabel: 'Marketing',
    description: 'Help a client gather and analyze market data to validate their business idea.',
    tags: ['market research', 'validation', 'analysis'],
    prompt: 'Help conduct preliminary market research for this business concept. Identify target market size, key competitors, and market trends.',
  },
  {
    id: 912,
    title: 'Social Media Strategy',
    category: 'marketing',
    categoryLabel: 'Marketing',
    description: 'Develop a social media content strategy tailored to the client\'s business and audience.',
    tags: ['social media', 'strategy', 'content'],
    prompt: 'Develop a social media strategy for this business. Include platform recommendations, content pillars, posting frequency, and engagement tactics.',
  },
];

const SAMPLE_CATEGORIES = [
  { id: 'advising', label: 'Client Advising', count: 4 },
  { id: 'admin', label: 'Admin & Reporting', count: 4 },
  { id: 'training', label: 'Training', count: 2 },
  { id: 'marketing', label: 'Marketing', count: 2 },
];

interface PromptLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: Prompt) => void;
}

export default function PromptLibrary({ open, onClose, onSelectPrompt }: PromptLibraryProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [showPromptHouse, setShowPromptHouse] = useState(false);
  const [copied, setCopied] = useState(false);
  const { prompts: apiPrompts, categories: apiCategories, loading } = usePrompts();

  // Use API prompts if loaded, otherwise fallback to samples
  const prompts = apiPrompts.length > 0 ? apiPrompts : SAMPLE_PROMPTS;
  const categories = apiCategories.length > 0 ? apiCategories : SAMPLE_CATEGORIES;

  const tabs = useMemo(() => {
    const allCount = prompts.length;
    return [
      { id: 'all', label: 'All', count: allCount },
      ...categories,
    ];
  }, [prompts, categories]);

  const mappedPrompts: Prompt[] = useMemo(() => {
    return prompts.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      categoryLabel: p.categoryLabel,
      description: p.description,
      tags: p.tags || [],
      prompt: p.prompt || '',
      isWorkflow: p.isWorkflow || false,
      workflowId: p.workflowId,
      ...(p.body ? { body: p.body as unknown as import('@/lib/types').PromptBodyElement[] } : {}),
    }));
  }, [prompts]);

  const filtered = useMemo(() => {
    return mappedPrompts.filter((p) => {
      return activeTab === 'all' || p.category === activeTab;
    });
  }, [mappedPrompts, activeTab]);

  const handleSelect = (prompt: Prompt) => {
    onSelectPrompt(prompt);
    onClose();
    setActiveTab('all');
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText('sbdc2026');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = 'sbdc2026';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="full">
      {/* ─── Header ─── */}
      <div className="relative px-4 pt-5 md:px-10 md:pt-9 pb-0 shrink-0" style={{ background: 'var(--p-white, #fff)' }}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-5 md:right-6 p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--cream)] transition-colors cursor-pointer z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title row */}
        <div className="flex items-end justify-between gap-4 md:gap-8 mb-4 md:mb-6">
          <div>
            <span className="text-[10px] font-[var(--sans)] font-bold tracking-[0.12em] uppercase text-[var(--text-tertiary)] block mb-1">
              Prompt Library
            </span>
            <h2 className="text-[24px] md:text-[32px] font-[var(--display)] font-bold text-[var(--text-primary)] leading-[1.05] tracking-[-0.03em]">
              Templates
            </h2>
          </div>

          <div className="flex items-center gap-4 pb-1">
            {/* Prompt count */}
            <span className="text-[12px] font-[var(--sans)] font-light text-[var(--text-tertiary)] hidden md:block">
              {prompts.length} prompts
            </span>

            {/* Prompt House link */}
            <button
              onClick={() => setShowPromptHouse(true)}
              className="group inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span className="relative text-[12px] font-[var(--sans)] font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                Prompt House
                <span className="absolute left-0 -bottom-px h-px w-full bg-[var(--text-tertiary)]/30 group-hover:bg-[var(--text-primary)] transition-colors" />
              </span>
              <svg className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </button>
          </div>
        </div>

        {/* ─── Filter pills ─── */}
        <div className="flex gap-1.5 overflow-x-auto pb-4 md:pb-5 -mb-px">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="
                  flex items-center gap-1.5 px-3.5 py-[6px]
                  rounded-full text-[12px] font-[var(--sans)]
                  whitespace-nowrap cursor-pointer
                  transition-all duration-150
                "
                style={{
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? 'var(--p-accent, var(--navy, #162d50))' : 'transparent',
                  color: isActive ? 'var(--p-accent-contrast, #fff)' : 'var(--text-secondary, #4a5161)',
                  border: isActive ? '1px solid transparent' : '1px solid var(--rule, #e7e2da)',
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className="text-[10px] tabular-nums px-1.5 rounded-full"
                    style={{
                      background: isActive ? 'var(--p-accent-contrast, rgba(255,255,255,0.15))' : 'var(--cream, #faf8f4)',
                      color: isActive ? 'var(--p-accent, rgba(255,255,255,0.7))' : 'var(--text-tertiary)',
                      opacity: isActive ? 0.25 : 1,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: 'var(--rule-light, rgba(0,0,0,0.04))' }} />
      </div>

      {/* ─── Prompt House Modal Overlay ─── */}
      {showPromptHouse && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPromptHouse(false); }}
        >
          <div className="rounded-2xl overflow-hidden max-w-md w-full mx-6" style={{ background: 'var(--p-white, #fff)', boxShadow: '0 20px 60px -12px rgba(0,0,0,0.25)' }}>
            {/* Modal header */}
            <div style={{ background: '#0d1117' }} className="px-8 pt-7 pb-5 text-center">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-[var(--display)] font-bold text-white mb-1 tracking-[-0.01em]">
                Official Prompt House
              </h3>
              <p className="text-[12px] font-[var(--sans)] text-white/45">
                Opens in a new window
              </p>
            </div>

            {/* Modal body */}
            <div className="px-8 py-6">
              <div className="rounded-xl px-5 py-4 mb-5" style={{ background: 'var(--cream)' }}>
                <p className="text-[14px] font-[var(--sans)] text-[var(--text-primary)] leading-relaxed">
                  Copy the password below, then click <strong className="font-semibold">&ldquo;Open Prompt House&rdquo;</strong> to get started.
                </p>
              </div>

              {/* Password */}
              <div className="mb-6">
                <p className="text-[10px] font-[var(--sans)] font-bold tracking-[0.1em] uppercase text-[var(--text-tertiary)] mb-2">
                  Password
                </p>
                <button
                  onClick={handleCopyPassword}
                  className="group w-full flex items-center justify-between hover:bg-[var(--cream)] border border-[var(--rule-light)] rounded-xl px-4 py-3 transition-all cursor-pointer"
                  style={{ background: 'transparent' }}
                >
                  <span className="text-[20px] font-[var(--sans)] font-bold text-[var(--text-primary)] tracking-wide">
                    sbdc2026
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-[var(--sans)] font-semibold text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                        Copy
                      </>
                    )}
                  </span>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPromptHouse(false)}
                  className="flex-1 px-4 py-2.5 text-[13px] font-[var(--sans)] font-semibold text-[var(--text-secondary)] bg-[var(--cream)] hover:bg-[var(--rule)] rounded-full transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <a
                  href="https://sbdc-ai-production.up.railway.app/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowPromptHouse(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-[var(--sans)] font-semibold rounded-full transition-colors text-center"
                  style={{ background: 'var(--p-accent, var(--navy))', color: 'var(--p-accent-contrast, #fff)' }}
                >
                  Open Prompt House
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Scrollable Card Grid ─── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 md:px-10 md:pt-6 md:pb-10" style={{ background: 'var(--p-sand, var(--cream))' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[var(--rule)] border-t-[var(--navy)] rounded-full animate-spin" />
              <p className="text-[14px] font-[var(--sans)] font-light text-[var(--text-tertiary)]">
                Loading prompts...
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--cream)] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <p className="text-[15px] font-[var(--sans)] font-semibold text-[var(--text-secondary)] mb-1">
              No prompts found
            </p>
            <p className="text-[13px] font-[var(--sans)] font-light text-[var(--text-tertiary)]">
              Try a different category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((prompt, i) => (
              <div
                key={prompt.id}
                className="card-stagger"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <PromptCard prompt={prompt} onClick={handleSelect} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
