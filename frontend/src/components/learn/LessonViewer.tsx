'use client';

import { useRef, useEffect, useState } from 'react';
import MarkdownContent from '../chat/MarkdownContent';
import CopyBlock from './CopyBlock';
import PlayModal from './PlayModal';
import type { Lesson, LessonSection } from '@/data/lesson-types';

/* ── Stroke icon set — maps lesson emoji to thin-line SVGs ── */
const STROKE_ICONS: Record<string, React.ReactNode> = {
  '🎭': ( // Roles
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="7" /><path d="M6.5 11.5c0 0 1 1.5 2.5 1.5s2.5-1.5 2.5-1.5" /><circle cx="7" cy="8" r="0.5" fill="currentColor" stroke="none" /><circle cx="11" cy="8" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="15" r="7" /><path d="M12.5 17.5c0 0 1 1.5 2.5 1.5s2.5-1.5 2.5-1.5" /><circle cx="13" cy="14" r="0.5" fill="currentColor" stroke="none" /><circle cx="17" cy="14" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  '✍️': ( // Prompt Body
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      <path d="M15 5l4 4" />
    </svg>
  ),
  '📋': ( // Context
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 3v6" />
      <line x1="7" y1="13" x2="17" y2="13" /><line x1="7" y1="17" x2="13" y2="17" />
    </svg>
  ),
  '🎯': ( // Specificity
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  '🔄': ( // Iteration
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0115.36-6.36L21 8" />
      <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 01-15.36 6.36L3 16" />
    </svg>
  ),
  '🗣️': ( // Tone
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      <line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="13" y2="13" />
    </svg>
  ),
  '📂': ( // RAG
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  ),
  '🔒': ( // PII
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  '📐': ( // Templates
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  '🏆': ( // Putting it Together
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
    </svg>
  ),
};

function LessonIcon({ icon, className, style }: { icon: string; className?: string; style?: React.CSSProperties }) {
  const svg = STROKE_ICONS[icon];
  if (!svg) return null;
  return (
    <span className={className} style={{ display: 'inline-flex', ...style }}>
      {svg}
    </span>
  );
}

interface LessonViewerProps {
  lesson: Lesson;
  totalLessons: number;
  onNavigate: (lessonId: string) => void;
  onComplete: (lessonId: string) => void;
  allLessons: Lesson[];
}

export default function LessonViewer({ lesson, totalLessons, onNavigate, onComplete, allLessons }: LessonViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [playPrompt, setPlayPrompt] = useState<{ text: string; label: string } | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lesson.id]);

  const handleNext = () => {
    onComplete(lesson.id);
    if (lesson.nextLessonId) {
      onNavigate(lesson.nextLessonId);
    }
  };

  const prevLesson = allLessons.find((l) => l.id === lesson.prevLessonId);
  const nextLesson = allLessons.find((l) => l.id === lesson.nextLessonId);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto learn-scroll">
      {/* Tighter horizontal padding on mobile (16px) vs desktop (40px) */}
      <div className="max-w-[720px] mx-auto px-4 md:px-10 pt-8 md:pt-14 pb-28">
        {/* ── Progress strip ── */}
        <div className="mb-8 md:mb-10 lesson-hero" style={{ animationDelay: '0s' }}>
          <div className="flex items-center gap-3 md:gap-4 mb-3">
            <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>
              {String(lesson.number).padStart(2, '0')} / {String(totalLessons).padStart(2, '0')}
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--p-line)' }} />
            <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>
              {lesson.duration}
            </span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 1.5, background: 'var(--p-line)' }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(lesson.number / totalLessons) * 100}%`,
                background: 'var(--p-ink)',
              }}
            />
          </div>
        </div>

        {/* ── Hero ── */}
        <div className="mb-10 md:mb-12 lesson-hero" style={{ animationDelay: '0.06s' }}>
          <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-5">
            <LessonIcon
              icon={lesson.icon}
              style={{
                width: 18,
                height: 18,
                color: 'var(--royal, #1D5AA7)',
              }}
            />
            <div
              className="w-4 h-px"
              style={{
                background: 'var(--royal, #1D5AA7)',
                animation: 'kickerLine 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both',
                transformOrigin: 'left',
              }}
            />
            <span className="learn-kicker" style={{ color: 'var(--royal, #1D5AA7)' }}>
              {lesson.kicker}
            </span>
          </div>

          <h1
            className="learn-display"
            style={{
              fontWeight: 100,
              fontSize: 'clamp(28px, 5vw, 52px)',
              color: 'var(--p-ink)',
              marginBottom: 8,
            }}
          >
            <strong className="learn-display" style={{ fontWeight: 900 }}>
              {lesson.title}
            </strong>
          </h1>

          <p
            className="learn-serif"
            style={{
              fontSize: 'clamp(15px, 2vw, 19px)',
              fontStyle: 'italic',
              color: 'var(--p-mid)',
              maxWidth: 540,
            }}
          >
            {lesson.subtitle}
          </p>
        </div>

        {/* ── Sections ── */}
        {lesson.sections.map((section, i) => (
          <div key={i} className="lesson-enter" style={{ animationDelay: `${0.08 + 0.04 * i}s` }}>
            <SectionBlock section={section} onPlay={(text, label) => setPlayPrompt({ text, label })} />
          </div>
        ))}

        {/* ── Key Takeaways ── */}
        {lesson.keyTakeaways.length > 0 && (
          <div
            className="mt-10 md:mt-14 lesson-enter"
            style={{ animationDelay: `${0.08 + 0.04 * lesson.sections.length}s` }}
          >
            <div className="flex items-center gap-3 mb-5 md:mb-6">
              <div className="w-5 h-px" style={{ background: 'var(--green, #16a34a)' }} />
              <span className="learn-kicker" style={{ color: 'var(--green, #16a34a)' }}>
                Key Takeaways
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--p-line)' }} />
            </div>
            <div
              className="px-4 py-4 md:p-6 rounded-xl md:rounded-2xl"
              style={{
                background: 'var(--p-white)',
                border: '1px solid var(--p-line)',
              }}
            >
              <ul className="space-y-3">
                {lesson.keyTakeaways.map((takeaway, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 md:gap-3 text-[13.5px] md:text-[14.5px] leading-[1.6]"
                    style={{ fontFamily: 'var(--sans)', color: 'var(--p-ink)', fontWeight: 400 }}
                  >
                    <span
                      className="shrink-0 w-[18px] h-[18px] md:w-5 md:h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: 'var(--green, #16a34a)' }}
                    >
                      <svg className="w-2 h-2 md:w-2.5 md:h-2.5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="mt-12 md:mt-16 lesson-enter" style={{ animationDelay: `${0.12 + 0.04 * lesson.sections.length}s` }}>
          <div className="h-px mb-6 md:mb-8" style={{ background: 'var(--p-line)' }} />
          <div className="flex flex-col sm:flex-row items-stretch gap-3 md:gap-4">
            {/* Previous */}
            {prevLesson ? (
              <button
                onClick={() => onNavigate(lesson.prevLessonId!)}
                className="flex-1 flex flex-col items-start gap-1 px-4 py-3 md:px-5 md:py-4 rounded-xl cursor-pointer transition-all duration-200 text-left"
                style={{
                  background: 'var(--p-white)',
                  border: '1px solid var(--p-line)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--p-mid)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--p-line)';
                }}
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3" style={{ color: 'var(--p-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="learn-label" style={{ color: 'var(--p-muted)' }}>Previous</span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--p-ink)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {prevLesson.title}
                </span>
              </button>
            ) : (
              <div className="flex-1 hidden sm:block" />
            )}

            {/* Next — uses code-bg so it stays dark in both themes */}
            {nextLesson ? (
              <button
                onClick={handleNext}
                className="flex-1 flex flex-col items-end gap-1 px-4 py-3 md:px-5 md:py-4 rounded-xl cursor-pointer transition-all duration-200 text-right"
                style={{
                  background: 'var(--p-code-bg, #162d50)',
                  border: '1px solid var(--p-code-bg, #162d50)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="learn-label" style={{ color: 'rgba(255,255,255,0.45)' }}>Next</span>
                  <svg className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.45)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {nextLesson.title}
                </span>
              </button>
            ) : (
              <a
                href="/chat"
                className="flex-1 flex flex-col items-end justify-center gap-1 px-4 py-3 md:px-5 md:py-4 rounded-xl transition-all duration-200 no-underline text-right"
                style={{
                  background: 'var(--p-code-bg, #162d50)',
                  border: '1px solid var(--p-code-bg, #162d50)',
                }}
              >
                <span className="learn-label" style={{ color: 'rgba(255,255,255,0.45)' }}>Complete</span>
                <span
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Back to Chat
                </span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Play Prompt Modal ── */}
      {playPrompt && (
        <PlayModal
          prompt={playPrompt.text}
          label={playPrompt.label}
          onClose={() => setPlayPrompt(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Section Renderers — mobile-first spacing
   ═══════════════════════════════════════════════ */

function SectionBlock({ section, onPlay }: { section: LessonSection; onPlay: (text: string, label: string) => void }) {
  switch (section.type) {
    case 'concept':
      return <ConceptBlock section={section} />;
    case 'prompt':
      return <PromptSection section={section} onPlay={onPlay} />;
    case 'output':
      return <OutputBlock section={section} />;
    case 'exercise':
      return <ExerciseBlock section={section} onPlay={onPlay} />;
    case 'tip':
      return <TipBlock section={section} />;
    case 'divider':
      return (
        <div className="my-8 md:my-10 learn-divider">
          <div className="h-px" style={{ background: 'var(--p-line)' }} />
        </div>
      );
    default:
      return null;
  }
}

function ConceptBlock({ section }: { section: LessonSection }) {
  return (
    <div className="mb-6 md:mb-8">
      {section.title && (
        <h2
          className="mb-3 md:mb-4"
          style={{
            fontFamily: 'var(--era-text, var(--sans))',
            fontWeight: 700,
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            color: 'var(--p-ink)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {section.title}
        </h2>
      )}
      {section.body && <MarkdownContent content={section.body} />}
    </div>
  );
}

function PromptSection({ section, onPlay }: { section: LessonSection; onPlay: (text: string, label: string) => void }) {
  const label = section.label || 'SAMPLE PROMPT';
  return (
    <div className="mb-6 md:mb-8">
      {section.title && (
        <p
          className="mb-2"
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--p-ink)',
            letterSpacing: '-0.005em',
          }}
        >
          {section.title}
        </p>
      )}
      {section.prompt && (
        <CopyBlock
          text={section.prompt}
          label={label}
          onPlay={() => onPlay(section.prompt!, label)}
        />
      )}
    </div>
  );
}

function OutputBlock({ section }: { section: LessonSection }) {
  return (
    <div
      className="mb-6 md:mb-8 rounded-xl md:rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--p-line)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 md:px-5 md:py-3"
        style={{
          background: 'var(--p-cream)',
          borderBottom: '1px solid var(--p-line)',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--royal, #1D5AA7)' }} />
        <span className="learn-label" style={{ color: 'var(--royal, #1D5AA7)' }}>
          {section.label || 'AI Response'}
        </span>
      </div>
      {/* Content — less padding on mobile */}
      <div className="px-3.5 py-3 md:px-6 md:py-5" style={{ background: 'var(--p-white)' }}>
        {section.output && <MarkdownContent content={section.output} />}
      </div>
    </div>
  );
}

function ExerciseBlock({ section, onPlay }: { section: LessonSection; onPlay: (text: string, label: string) => void }) {
  return (
    <div
      className="mb-6 md:mb-8 rounded-xl md:rounded-2xl overflow-hidden"
      style={{
        background: 'var(--p-white)',
        border: '1px solid var(--p-line)',
      }}
    >
      {/* Header stripe */}
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 md:px-5 md:py-3"
        style={{
          borderBottom: '1px solid var(--p-line)',
          background: 'var(--p-soft-purple, #f3f0ff)',
        }}
      >
        <svg className="w-3.5 h-3.5" style={{ color: 'var(--p-purple, #7c3aed)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span className="learn-label" style={{ color: 'var(--p-purple, #7c3aed)' }}>
          {section.title || 'Exercise'}
        </span>
      </div>

      <div className="px-3.5 py-3 md:px-6 md:py-5">
        {section.variant && (
          <p
            className="text-[13.5px] md:text-[14.5px] leading-[1.6] mb-3 md:mb-4"
            style={{ fontFamily: 'var(--sans)', color: 'var(--p-ink)', fontWeight: 400 }}
          >
            {section.variant}
          </p>
        )}
        {section.modifiedPrompt && (
          <CopyBlock
            text={section.modifiedPrompt}
            label="Modified Prompt"
            onPlay={() => onPlay(section.modifiedPrompt!, 'Modified Prompt')}
          />
        )}
        {section.modifiedOutput && (
          <div
            className="rounded-lg md:rounded-xl overflow-hidden mt-3 md:mt-4"
            style={{ border: '1px solid var(--p-line)' }}
          >
            <div
              className="flex items-center gap-2 px-3.5 py-2 md:px-5 md:py-2.5"
              style={{
                background: 'var(--p-cream)',
                borderBottom: '1px solid var(--p-line)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--p-purple, #7c3aed)' }} />
              <span className="learn-label" style={{ color: 'var(--p-purple, #7c3aed)' }}>
                Different Output
              </span>
            </div>
            <div className="px-3.5 py-3 md:px-6 md:py-5" style={{ background: 'var(--p-white)' }}>
              <MarkdownContent content={section.modifiedOutput} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TipBlock({ section }: { section: LessonSection }) {
  return (
    <div
      className="mb-6 md:mb-8 rounded-xl md:rounded-2xl overflow-hidden flex"
      style={{
        background: 'var(--p-white)',
        border: '1px solid var(--p-line)',
      }}
    >
      <div className="w-1 shrink-0" style={{ background: 'var(--amber, #d97706)' }} />
      <div className="flex gap-2.5 md:gap-3.5 px-3.5 py-3 md:px-5 md:py-4">
        <span
          className="shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-[11px] mt-0.5"
          style={{ background: 'var(--p-soft-amber, #fef9ec)' }}
        >
          !
        </span>
        <p
          className="text-[13.5px] md:text-[14.5px] leading-[1.6]"
          style={{ fontFamily: 'var(--sans)', color: 'var(--p-ink)', fontWeight: 400 }}
        >
          {section.note}
        </p>
      </div>
    </div>
  );
}
