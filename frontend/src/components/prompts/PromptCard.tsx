'use client';

import type { Prompt } from '@/lib/types';
import { categoryColors } from '@/styles/tokens';

interface PromptCardProps {
  prompt: Prompt;
  onClick: (prompt: Prompt) => void;
}

export default function PromptCard({ prompt, onClick }: PromptCardProps) {
  const accentColor = categoryColors[prompt.category] || categoryColors.advising;

  return (
    <button
      onClick={() => onClick(prompt)}
      className="
        relative w-full text-left
        border border-[var(--rule-light)]
        rounded-xl
        p-3.5 md:p-5
        min-h-0 md:min-h-[120px]
        group
        cursor-pointer
        transition-all duration-200 ease-out
        hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]
        hover:-translate-y-0.5
        focus-visible:outline-2 focus-visible:outline-[var(--royal)] focus-visible:outline-offset-2
        active:scale-[0.98]
      "
      style={{ background: 'var(--p-white, #fff)' }}
    >
      {/* Category dot + label */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: accentColor }} />
        <span className="text-[10px] font-[var(--sans)] font-bold tracking-[0.06em] uppercase text-[var(--text-tertiary)]">
          {prompt.categoryLabel}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[14px] font-[var(--sans)] font-semibold text-[var(--text-primary)] mb-1.5 pr-5 leading-snug group-hover:text-[var(--royal)] transition-colors duration-200">
        {prompt.title}
      </h3>

      {/* Description */}
      <p className="text-[12px] font-[var(--sans)] font-light text-[var(--text-tertiary)] leading-[1.55] line-clamp-2">
        {prompt.description}
      </p>

      {/* Arrow affordance */}
      <span className="
        absolute right-4 top-5
        text-[var(--text-tertiary)] opacity-0
        group-hover:opacity-60 group-focus-visible:opacity-60
        transition-all duration-200
        translate-x-0 group-hover:translate-x-0.5
      ">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </span>
    </button>
  );
}
