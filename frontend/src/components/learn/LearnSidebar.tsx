'use client';

import { useRouter } from 'next/navigation';
import SbdcLogo from '../preview/SbdcLogo';
import ThemeToggle from '../ui/ThemeToggle';
import type { Lesson } from '@/data/lesson-types';

interface LearnSidebarProps {
  lessons: Lesson[];
  activeLessonId: string;
  completedLessons: Set<string>;
  onSelectLesson: (id: string) => void;
  onClose?: () => void;
}

export default function LearnSidebar({
  lessons,
  activeLessonId,
  completedLessons,
  onSelectLesson,
  onClose,
}: LearnSidebarProps) {
  const router = useRouter();
  const completedCount = lessons.filter((l) => completedLessons.has(l.id)).length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  return (
    <aside
      className="flex flex-col h-full overflow-hidden w-full"
      style={{
        background: 'var(--p-cream)',
        borderRight: '1px solid var(--p-line)',
      }}
    >
      {/* Header zone — logo + back */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="flex items-center justify-between mb-5">
          <SbdcLogo style={{ height: 26, width: 'auto', display: 'block' }} />
        </div>

        <button
          onClick={() => { router.push('/chat'); onClose?.(); }}
          className="flex items-center gap-2 py-2 px-0 cursor-pointer w-full text-left whitespace-nowrap shrink-0 mb-4 transition-all duration-200 group"
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--p-muted)',
            background: 'none',
            border: 'none',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--p-ink)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--p-muted)'; }}
        >
          <svg className="w-3.5 h-3.5 shrink-0 transition-transform duration-200" style={{ transform: 'translateX(0)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Chat
        </button>

        <div className="h-px shrink-0" style={{ background: 'var(--p-line)' }} />

        {/* Progress section */}
        <div style={{ padding: '16px 0 12px' }}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="learn-label" style={{ color: 'var(--p-muted)' }}>
              Progress
            </span>
            <span
              className="learn-label"
              style={{ color: completedCount > 0 ? 'var(--p-ink)' : 'var(--p-muted)' }}
            >
              {completedCount}/{lessons.length}
            </span>
          </div>
          {/* Progress bar */}
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 2, background: 'var(--p-line)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: completedCount === lessons.length
                  ? 'var(--green, #16a34a)'
                  : 'var(--p-ink)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Lesson list */}
      <div className="flex-1 min-h-0 overflow-y-auto learn-scroll" style={{ padding: '0 12px' }}>
        <div className="space-y-0.5">
          {lessons.map((lesson, i) => {
            const isActive = lesson.id === activeLessonId;
            const isCompleted = completedLessons.has(lesson.id);

            return (
              <button
                key={lesson.id}
                onClick={() => { onSelectLesson(lesson.id); onClose?.(); }}
                className="learn-sidebar-item relative flex items-center gap-3 w-full py-2 px-2.5 rounded-lg text-left cursor-pointer shrink-0 transition-all duration-200"
                style={{
                  fontFamily: 'var(--sans)',
                  background: isActive ? 'var(--p-sand)' : 'transparent',
                  border: 'none',
                  animationDelay: `${i * 30}ms`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--p-sand)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full"
                    style={{
                      height: 16,
                      background: 'var(--p-ink)',
                      animation: 'sidebarActive 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
                    }}
                  />
                )}

                {/* Number / Check */}
                <span
                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    fontFamily: 'var(--mono, monospace)',
                    background: isCompleted && !isActive
                      ? 'var(--green, #16a34a)'
                      : isActive
                        ? 'var(--p-ink)'
                        : 'transparent',
                    color: isActive || (isCompleted && !isActive)
                      ? '#fff'
                      : 'var(--p-muted)',
                    border: !isActive && !isCompleted ? '1px solid var(--p-line)' : 'none',
                  }}
                >
                  {isCompleted && !isActive ? (
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    lesson.number
                  )}
                </span>

                {/* Title + duration */}
                <div className="flex-1 min-w-0">
                  <span
                    className="block text-[11.5px] truncate transition-colors duration-200"
                    style={{
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--p-ink)' : 'var(--p-mid)',
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {lesson.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="shrink-0 flex items-center justify-between"
        style={{
          padding: '12px 20px 16px',
          borderTop: '1px solid var(--p-line)',
        }}
      >
        <ThemeToggle />
        <span
          className="learn-label"
          style={{ color: 'var(--p-muted)' }}
        >
          {lessons.length} lessons
        </span>
      </div>
    </aside>
  );
}
