'use client';

import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { WorkflowMeta, ConversationSummary } from '@/lib/api';

interface AppShellProps {
  children: ReactNode;
  onClearChat?: () => void;
  onOpenAIPolicy?: () => void;
  onSelectWorkflow?: (workflow: WorkflowMeta) => void;
  onOpenPromptLibrary?: () => void;
  onOpenEvents?: () => void;
  onOpenNeoserra?: () => void;
  onOpenAbout?: () => void;
  conversations?: ConversationSummary[];
  currentConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export default function AppShell({ children, onClearChat, onOpenAIPolicy, onSelectWorkflow, onOpenPromptLibrary, onOpenEvents, onOpenNeoserra, onOpenAbout, conversations, currentConversationId, onSelectConversation, onDeleteConversation }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenAIPolicy = () => onOpenAIPolicy?.();
  const handleSelectWorkflow = (wf: WorkflowMeta) => onSelectWorkflow?.(wf);

  const sidebarProps = {
    onOpenPromptLibrary: () => onOpenPromptLibrary?.(),
    onOpenAIPolicy: handleOpenAIPolicy,
    onSelectWorkflow: handleSelectWorkflow,
    onOpenEvents: () => onOpenEvents?.(),
    onOpenNeoserra: () => onOpenNeoserra?.(),
    onClearChat,
    conversations,
    currentConversationId,
    onSelectConversation,
    onDeleteConversation,
  };

  return (
    <div className="h-dvh flex overflow-hidden">
      {/* ─── Desktop floating About — styled cascading hamburger ─── */}
      <button
        onClick={() => onOpenAbout?.()}
        className="hidden md:flex fixed top-7 right-7 z-[100] cursor-pointer group items-center gap-2.5"
        aria-label="About"
      >
        <span
          className="text-[10px] font-[var(--sans)] font-semibold tracking-[0.12em] uppercase opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-150 ease-out text-[var(--royal)]"
        >
          about
        </span>
        <div className="relative w-5 h-4 flex flex-col items-end justify-center gap-[3px] -rotate-[3deg] group-hover:rotate-0 transition-transform duration-200">
          <span className="block h-[2px] rounded-full transition-all duration-200 w-[16px] bg-[var(--text-tertiary)] group-hover:bg-[var(--royal)]" />
          <span className="block h-[2px] rounded-full transition-all duration-200 w-[11px] bg-[var(--text-tertiary)] group-hover:bg-[var(--royal)]" />
          <span className="block h-[2px] rounded-full transition-all duration-200 w-[6px] bg-[var(--text-tertiary)] group-hover:bg-[var(--pool)]" />
        </div>
      </button>

      {/* ─── Desktop Sidebar ─── */}
      <div className="hidden md:block w-[var(--sidebar-width)] shrink-0">
        <Sidebar {...sidebarProps} />
      </div>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-[var(--sidebar-width)] max-w-[85vw] h-full overflow-y-auto shadow-xl fade-in">
            <Sidebar
              {...sidebarProps}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} onOpenAbout={() => onOpenAbout?.()} />

        {/* Content area with mobile header offset */}
        <main className="flex-1 overflow-hidden md:mt-0 mt-[var(--header-height)]">
          {children}
        </main>
      </div>
    </div>
  );
}
