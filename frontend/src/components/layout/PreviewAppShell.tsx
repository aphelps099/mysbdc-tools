'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import PreviewSidebar from '../preview/PreviewSidebar';
import ThemeToggle from '../ui/ThemeToggle';
import { clearToken } from '@/lib/api';
import type { ConversationSummary } from '@/lib/api';

interface PreviewAppShellProps {
  children: ReactNode;
  onClearChat?: () => void;
  onOpenPromptLibrary?: () => void;
  onOpenUpload?: () => void;
  onOpenEvents?: () => void;
  onOpenNeoserra?: () => void;
  onOpenAbout?: () => void;
  conversations?: ConversationSummary[];
  currentConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

export default function PreviewAppShell({
  children,
  onClearChat,
  onOpenPromptLibrary,
  onOpenUpload,
  onOpenEvents,
  onOpenNeoserra,
  onOpenAbout,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  selectedModel,
  onModelChange,
}: PreviewAppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const sidebarProps = {
    onOpenPromptLibrary: () => onOpenPromptLibrary?.(),
    onOpenUpload: () => onOpenUpload?.(),
    onOpenEvents: () => onOpenEvents?.(),
    onOpenNeoserra: () => onOpenNeoserra?.(),
    onOpenAbout: () => onOpenAbout?.(),
    onClearChat,
    conversations,
    currentConversationId,
    onSelectConversation,
    onDeleteConversation,
    selectedModel,
    onModelChange,
  };

  return (
    <div className="preview-theme h-dvh flex overflow-hidden" style={{ background: 'var(--p-sand)' }}>
      {/* ─── Desktop Sidebar ─── */}
      <div className="hidden md:block shrink-0">
        <PreviewSidebar {...sidebarProps} />
      </div>

      {/* ─── Mobile Menu Overlay ─── */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0"
            style={{ background: 'var(--p-backdrop)', animation: 'menuFade 0.2s ease both' }}
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute top-14 left-3 w-[240px] max-w-[75vw] rounded-2xl overflow-hidden"
            style={{
              background: 'var(--p-elevated)',
              border: '1px solid var(--p-elevated-border)',
              boxShadow: '0 8px 40px -8px rgba(0,0,0,0.25), 0 2px 12px -4px rgba(0,0,0,0.12)',
              animation: 'menuSlide 0.28s cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            {/* New Chat */}
            <div className="p-3" style={{ animation: 'menuItem 0.32s cubic-bezier(0.16,1,0.3,1) 0.04s both' }}>
              <button
                onClick={() => { onClearChat?.(); setMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl cursor-pointer text-[13px] font-semibold tracking-[0.02em] transition-all duration-150 active:scale-[0.97]"
                style={{
                  fontFamily: 'var(--sans)',
                  background: 'transparent',
                  color: 'var(--p-accent)',
                  border: '1.5px solid var(--p-accent)',
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Chat
              </button>
            </div>

            {/* Recent chats */}
            {conversations && conversations.length > 0 && (
              <>
                <div className="h-px" style={{ background: 'var(--p-elevated-divider)' }} />
                <div className="px-3 py-2" style={{ animation: 'menuItem 0.32s cubic-bezier(0.16,1,0.3,1) 0.08s both' }}>
                  <p className="text-[9px] font-bold tracking-[0.1em] uppercase px-1 mb-1" style={{ color: 'var(--p-muted)', fontFamily: 'var(--sans)' }}>Recent</p>
                  <div className="max-h-[140px] overflow-y-auto">
                    {conversations.map((c, i) => (
                      <button
                        key={c.id}
                        onClick={() => { onSelectConversation?.(c.id); setMenuOpen(false); }}
                        className="w-full text-left py-1.5 px-2 rounded-lg text-[12px] truncate cursor-pointer transition-colors duration-100"
                        style={{
                          fontFamily: 'var(--sans)',
                          color: currentConversationId === c.id ? 'var(--p-ink)' : 'var(--p-mid)',
                          fontWeight: currentConversationId === c.id ? 600 : 400,
                          background: currentConversationId === c.id ? 'var(--p-hover)' : 'transparent',
                          animation: `menuItem 0.3s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.03}s both`,
                        }}
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="h-px" style={{ background: 'var(--p-elevated-divider)' }} />

            {/* Lean bottom section */}
            <div className="py-1.5 px-1.5">
              <button
                onClick={() => { router.push('/learn'); setMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer transition-colors duration-100"
                style={{ fontFamily: 'var(--sans)', color: 'var(--p-ink)', background: 'transparent', animation: 'menuItem 0.32s cubic-bezier(0.16,1,0.3,1) 0.14s both' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--p-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Learn
              </button>
              <button
                onClick={() => { onOpenAbout?.(); setMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer transition-colors duration-100"
                style={{ fontFamily: 'var(--sans)', color: 'var(--p-ink)', background: 'transparent', animation: 'menuItem 0.32s cubic-bezier(0.16,1,0.3,1) 0.17s both' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--p-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                About
              </button>
              <button
                onClick={() => { router.push('/dashboard'); setMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer transition-colors duration-100"
                style={{ fontFamily: 'var(--sans)', color: 'var(--p-ink)', background: 'transparent', animation: 'menuItem 0.32s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--p-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Analytics
              </button>
              <div className="h-px my-1" style={{ background: 'var(--p-elevated-divider)' }} />
              <button
                onClick={() => { clearToken(); window.location.href = '/login'; }}
                className="w-full text-left py-2 px-3 rounded-lg text-[12px] cursor-pointer transition-colors duration-100"
                style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted)', background: 'transparent', animation: 'menuItem 0.32s cubic-bezier(0.16,1,0.3,1) 0.23s both' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--p-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mobile Header — transparent, minimalist menu icon ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-12 flex items-center px-2">
        <button
          onClick={() => setMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center cursor-pointer transition-opacity duration-150 hover:opacity-70"
          style={{ color: 'var(--p-muted)' }}
        >
          {/* Two asymmetric lines — Collins/Pentagram aesthetic */}
          <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
            <line x1="1" y1="3.75" x2="21" y2="3.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <line x1="1" y1="11.25" x2="13" y2="11.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 relative" style={{ background: 'var(--p-sand)' }}>
        {/* Theme toggle — top right */}
        <div className="absolute top-3 right-4 z-20 hidden md:block">
          <ThemeToggle />
        </div>

        <main className="flex-1 overflow-hidden md:mt-0 mt-12">
          {children}
        </main>
      </div>
    </div>
  );
}
