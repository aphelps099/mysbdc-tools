'use client';

import { useState, useEffect } from 'react';
import SbdcLogo from '@/components/preview/SbdcLogo';
import ToolBrowser from '@/tools/browser/ToolBrowser';
import ToolEngine from '@/tools/engine/ToolEngine';
import VoiceTranscriber from '@/tools/engine/VoiceTranscriber';
import { categories, CUSTOM_TOOL_IDS } from '@/tools/tool-registry';
import type { ToolDefinition } from '@/tools/types';
import { ThemeProvider } from '@/context/ThemeContext';

/* ═══════════════════════════════════════════════════════
   /newtools — Hidden standalone page for the new Tools system.
   Not wired into the main chat. Self-contained with its own sidebar.
   ═══════════════════════════════════════════════════════ */

export default function NewToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [slim, setSlim] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = () => { if (mq.matches) setMobileOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSend = (compiledPrompt: string) => {
    console.log('[NewTools] Compiled prompt:', compiledPrompt);
  };

  const handleSelectTool = (tool: ToolDefinition) => {
    setActiveTool(tool);
    setMobileOpen(false);
  };

  return (
    <ThemeProvider>
      <div className="preview-theme h-dvh flex flex-col md:flex-row overflow-hidden" style={{ background: 'var(--p-sand)' }}>

        {/* ─── Mobile header ─── */}
        <header
          className="md:hidden flex items-center justify-between shrink-0"
          style={{
            height: 56,
            padding: '0 14px',
            background: 'var(--p-cream)',
            borderBottom: '1px solid var(--p-line)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ border: '1px solid var(--p-line)', background: 'var(--p-white)', color: 'var(--p-mid)' }}
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
          <span
            className="text-[11px] font-bold tracking-[0.12em] uppercase"
            style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted)' }}
          >
            Advisor Tools
          </span>
          {/* Balance spacer */}
          <div className="w-10" />
        </header>

        {/* ─── Mobile backdrop ─── */}
        {mobileOpen && (
          <div
            className="md:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ─── Sidebar ─── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden
            transition-transform duration-[350ms]
            md:relative md:translate-x-0
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{
            width: slim ? 56 : 260,
            minWidth: slim ? 56 : 260,
            background: 'var(--p-cream)',
            borderRight: '1px solid var(--p-line)',
            padding: slim ? '14px 8px' : '16px 14px',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Top row: collapse + close */}
          <div className="flex items-center justify-between shrink-0 mb-3">
            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setSlim((s) => !s)}
              className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center cursor-pointer transition-all duration-150"
              style={{ border: '1px solid var(--p-line)', background: 'var(--p-white)', color: 'var(--p-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--p-navy)'; e.currentTarget.style.color = 'var(--p-navy)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--p-line)'; e.currentTarget.style.color = 'var(--p-muted)'; }}
            >
              <svg
                className="w-3.5 h-3.5 transition-transform duration-[350ms]"
                style={{ transform: slim ? 'rotate(180deg)' : 'none' }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Close button (mobile only) */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer ml-auto"
              style={{ border: '1px solid var(--p-line)', background: 'var(--p-white)', color: 'var(--p-mid)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          {/* Logo */}
          {!slim && (
            <div className="px-1 mb-4">
              <SbdcLogo />
            </div>
          )}

          {/* Section label */}
          {!slim && (
            <p
              className="text-[10px] font-bold tracking-[0.1em] uppercase px-2 mb-2 shrink-0"
              style={{ color: 'var(--p-muted)', fontFamily: 'var(--sans)' }}
            >
              Advisor Tools
            </p>
          )}

          {/* Workspace nav */}
          {!slim && (
            <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5">
              <button
                onClick={() => { setActiveTool(null); setMobileOpen(false); }}
                className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-[8px] text-[11.5px] font-bold cursor-pointer w-full text-left whitespace-nowrap shrink-0 transition-all duration-[120ms] uppercase tracking-[0.06em]"
                style={{
                  fontFamily: 'var(--sans)',
                  color: !activeTool ? 'var(--p-ink)' : 'var(--p-mid)',
                  background: !activeTool ? 'var(--p-sand)' : 'transparent',
                  border: 'none',
                }}
                onMouseEnter={(e) => { if (activeTool) { e.currentTarget.style.background = 'var(--p-sand)'; e.currentTarget.style.color = 'var(--p-ink)'; }}}
                onMouseLeave={(e) => { if (activeTool) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--p-mid)'; }}}
              >
                <svg className="w-[18px] h-[18px] shrink-0 opacity-55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
                All Tools
              </button>

              <div className="h-px my-1.5 shrink-0" style={{ background: 'var(--p-line)' }} />

              {categories
                .filter((c) => c.id !== 'all')
                .map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-[8px] text-[11.5px] font-bold cursor-default w-full shrink-0 uppercase tracking-[0.06em]"
                    style={{ fontFamily: 'var(--sans)', color: 'var(--p-mid)' }}
                  >
                    <span
                      className="w-[7px] h-[7px] rounded-full shrink-0"
                      style={{ background: cat.color }}
                    />
                    {cat.label}
                  </div>
                ))}
            </div>
          )}

          {/* Slim mode: just dots */}
          {slim && (
            <div className="flex flex-col items-center gap-3 mt-2">
              <button
                onClick={() => setActiveTool(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150"
                style={{ background: !activeTool ? 'var(--p-sand)' : 'transparent', border: 'none', color: 'var(--p-mid)' }}
                title="All Tools"
              >
                <svg className="w-4 h-4 opacity-55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </button>
              {categories
                .filter((c) => c.id !== 'all')
                .map((cat) => (
                  <span
                    key={cat.id}
                    className="w-[6px] h-[6px] rounded-full shrink-0"
                    style={{ background: cat.color }}
                    title={cat.label}
                  />
                ))}
            </div>
          )}

          {/* Bottom */}
          <div className="mt-auto shrink-0">
            <div className="h-px my-1.5" style={{ background: 'var(--p-line)' }} />
            {!slim && (
              <a
                href="/chat"
                className="flex items-center gap-2.5 py-[9px] px-2.5 rounded-[8px] text-[11.5px] font-bold w-full text-left whitespace-nowrap transition-all duration-[120ms] no-underline uppercase tracking-[0.06em]"
                style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted)', background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--p-sand)'; e.currentTarget.style.color = 'var(--p-ink)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--p-muted)'; }}
              >
                <svg className="w-[18px] h-[18px] shrink-0 opacity-55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Back to Chat
              </a>
            )}
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 overflow-y-auto min-w-0" style={{ background: 'var(--p-sand)' }}>
          {activeTool ? (
            CUSTOM_TOOL_IDS.has(activeTool.id) ? (
              activeTool.id === 'voice-transcription' ? (
                <VoiceTranscriber onBack={() => setActiveTool(null)} />
              ) : null
            ) : (
              <ToolEngine
                definition={activeTool}
                onSend={handleSend}
                onBack={() => setActiveTool(null)}
              />
            )
          ) : (
            <ToolBrowser onSelectTool={handleSelectTool} />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
