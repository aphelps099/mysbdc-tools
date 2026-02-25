'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import LearnSidebar from '@/components/learn/LearnSidebar';
import LessonViewer from '@/components/learn/LessonViewer';
import { LESSONS } from '@/data/lessons';
import { getToken } from '@/lib/api';

const STORAGE_KEY = 'sbdc_learn_progress';

export default function LearnPage() {
  // Auth guard
  useEffect(() => {
    if (!getToken()) {
      window.location.href = '/login';
    }
  }, []);

  const [activeLessonId, setActiveLessonId] = useState(LESSONS[0].id);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hydrate progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCompleted(new Set(JSON.parse(saved)));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist progress
  useEffect(() => {
    if (completed.size > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
    }
  }, [completed]);

  const activeLesson = LESSONS.find((l) => l.id === activeLessonId) || LESSONS[0];

  const handleComplete = (lessonId: string) => {
    setCompleted((prev) => new Set(prev).add(lessonId));
  };

  const handleNavigate = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setMobileMenuOpen(false);
  };

  return (
    <ThemeProvider>
      <div className="preview-theme h-dvh flex overflow-hidden" style={{ background: 'var(--p-sand)' }}>
        {/* ── Desktop Sidebar ── */}
        <div className="hidden md:block shrink-0" style={{ width: 260 }}>
          <LearnSidebar
            lessons={LESSONS}
            activeLessonId={activeLessonId}
            completedLessons={completed}
            onSelectLesson={handleNavigate}
          />
        </div>

        {/* ── Mobile Drawer ── */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Scrim */}
            <div
              className="absolute inset-0"
              style={{ background: 'var(--p-backdrop)', animation: 'menuFade 0.2s ease both' }}
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer panel — full-height, slides from left */}
            <div
              className="absolute inset-y-0 left-0 flex flex-col"
              style={{
                width: 280,
                maxWidth: '82vw',
                background: 'var(--p-cream)',
                boxShadow: '8px 0 32px -4px rgba(0,0,0,0.12)',
                animation: 'drawerSlide 0.3s cubic-bezier(0.32,0.72,0,1) both',
              }}
            >
              {/* Drawer close header */}
              <div className="shrink-0 flex items-center justify-between px-4 pt-[env(safe-area-inset-top,0px)]" style={{ height: 52 }}>
                <span className="learn-label" style={{ color: 'var(--p-muted)' }}>Lessons</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors duration-150"
                  style={{ background: 'none', border: 'none', color: 'var(--p-mid)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="1" y1="1" x2="13" y2="13" />
                    <line x1="13" y1="1" x2="1" y2="13" />
                  </svg>
                </button>
              </div>
              {/* Sidebar content fills remaining space */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <LearnSidebar
                  lessons={LESSONS}
                  activeLessonId={activeLessonId}
                  completedLessons={completed}
                  onSelectLesson={handleNavigate}
                  onClose={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile Header ── */}
        <div
          className="md:hidden fixed top-0 left-0 right-0 z-40 h-12 flex items-center justify-between px-3"
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', background: 'color-mix(in srgb, var(--p-sand) 85%, transparent)' }}
        >
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 flex items-center justify-center cursor-pointer transition-opacity duration-150 hover:opacity-70"
            style={{ color: 'var(--p-mid)' }}
          >
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
              <line x1="0" y1="2" x2="18" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span
            className="learn-kicker"
            style={{ color: 'var(--p-muted)' }}
          >
            {String(activeLesson.number).padStart(2, '0')} / {String(LESSONS.length).padStart(2, '0')}
          </span>
          <div className="w-9" />
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative" style={{ background: 'var(--p-sand)' }}>
          <main className="flex-1 min-h-0 flex flex-col md:mt-0 mt-12">
            <LessonViewer
              lesson={activeLesson}
              totalLessons={LESSONS.length}
              allLessons={LESSONS}
              onNavigate={handleNavigate}
              onComplete={handleComplete}
            />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
