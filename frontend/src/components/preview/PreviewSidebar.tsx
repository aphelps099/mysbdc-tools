'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SbdcLogo from './SbdcLogo';
import { fetchHealth, clearToken } from '@/lib/api';
import type { HealthData, ConversationSummary } from '@/lib/api';

const AVAILABLE_MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { id: 'gpt-4.1', label: 'GPT-4.1' },
];

interface PreviewSidebarProps {
  onOpenPromptLibrary: () => void;
  onOpenUpload?: () => void;
  onOpenEvents?: () => void;
  onOpenNeoserra?: () => void;
  onOpenAbout?: () => void;
  onClearChat?: () => void;
  conversations?: ConversationSummary[];
  currentConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onClose?: () => void;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

export default function PreviewSidebar({
  onOpenPromptLibrary,
  onOpenUpload,
  onOpenEvents,
  onOpenNeoserra,
  onOpenAbout,
  onClearChat,
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onClose,
  selectedModel = 'gpt-4o-mini',
  onModelChange,
}: PreviewSidebarProps) {
  const router = useRouter();
  const [slim, setSlim] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [modelOpen, setModelOpen] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => {});
  }, []);

  // Close model dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    };
    if (modelOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [modelOpen]);

  const activeLabel = AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.label || selectedModel;

  return (
    <aside
      className="flex flex-col h-full overflow-hidden transition-all duration-[350ms]"
      style={{
        width: slim ? 56 : 240,
        minWidth: slim ? 56 : 240,
        background: 'var(--p-cream)',
        borderRight: '1px solid var(--p-line)',
        padding: slim ? '14px 8px' : '14px 12px',
      }}
    >
      {/* Toggle */}
      <button
        onClick={() => setSlim((s) => !s)}
        className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer shrink-0 mb-3 transition-all duration-150"
        style={{ border: '1px solid var(--p-line)', background: 'var(--p-white)', color: 'var(--p-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--p-navy)'; e.currentTarget.style.color = 'var(--p-navy)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--p-line)'; e.currentTarget.style.color = 'var(--p-muted)'; }}
      >
        <svg className="w-3.5 h-3.5 transition-transform duration-[350ms]" style={{ transform: slim ? 'rotate(180deg)' : 'none' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Model selector */}
      <div ref={modelRef} className="relative shrink-0 mb-3">
        <button
          onClick={() => { if (!slim) setModelOpen((o) => !o); }}
          className="flex items-center gap-[6px] px-2 py-[5px] rounded-[8px] w-full text-left cursor-pointer transition-all duration-150"
          style={{
            background: modelOpen ? 'var(--p-sand)' : 'transparent',
            border: '1px solid transparent',
            ...(modelOpen ? { borderColor: 'var(--p-line)' } : {}),
          }}
          onMouseEnter={(e) => { if (!modelOpen) e.currentTarget.style.background = 'var(--p-sand)'; }}
          onMouseLeave={(e) => { if (!modelOpen) e.currentTarget.style.background = 'transparent'; }}
        >
          <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: health ? '#16a34a' : 'var(--p-muted)' }} />
          {!slim && (
            <>
              <span className="text-[11px] font-medium truncate" style={{ color: 'var(--p-ink)', fontFamily: 'var(--sans)' }}>
                {activeLabel}
              </span>
              <svg className="w-3 h-3 shrink-0 ml-auto transition-transform duration-150" style={{ color: 'var(--p-muted)', transform: modelOpen ? 'rotate(180deg)' : 'none' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </>
          )}
        </button>

        {/* Dropdown */}
        {modelOpen && !slim && (
          <div
            className="absolute left-0 right-0 top-full mt-1 rounded-[10px] overflow-hidden z-50"
            style={{
              background: 'var(--p-white)',
              border: '1px solid var(--p-line)',
              boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
            }}
          >
            {AVAILABLE_MODELS.map((m) => {
              const isActive = m.id === selectedModel;
              return (
                <button
                  key={m.id}
                  onClick={() => { onModelChange?.(m.id); setModelOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-[7px] text-left cursor-pointer transition-colors duration-100"
                  style={{
                    background: isActive ? 'var(--p-sand)' : 'transparent',
                    fontFamily: 'var(--sans)',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--p-sand)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: isActive ? '#16a34a' : 'transparent' }} />
                  <span className="text-[11px] font-medium" style={{ color: isActive ? 'var(--p-ink)' : 'var(--p-mid)' }}>
                    {m.label}
                  </span>
                  {isActive && (
                    <svg className="w-3 h-3 ml-auto shrink-0" style={{ color: '#16a34a' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* New Chat */}
      <button
        onClick={() => { onClearChat?.(); onClose?.(); }}
        className={`flex items-center justify-center gap-1.5 rounded-full font-bold text-[12px] cursor-pointer shrink-0 mb-2.5 whitespace-nowrap overflow-hidden transition-colors duration-150 ${slim ? 'w-9 h-9' : 'h-9 w-full'}`}
        style={{ background: 'var(--p-navy)', color: 'var(--p-accent-contrast)', fontFamily: 'var(--sans)' }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {!slim && <span>New Chat</span>}
      </button>

      {/* Recent */}
      {!slim && (
        <p className="text-[9px] font-bold tracking-[0.1em] uppercase px-1 mb-1.5 mt-2 shrink-0" style={{ color: 'var(--p-muted)', fontFamily: 'var(--sans)' }}>
          Recent
        </p>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {!slim && conversations.length === 0 && (
          <p className="text-[11px] italic px-1 mb-2" style={{ color: 'var(--p-tint)' }}>No conversations yet</p>
        )}
        {!slim && conversations.map((c) => (
          <div key={c.id} className="group flex items-center">
            <button
              onClick={() => { onSelectConversation?.(c.id); onClose?.(); }}
              className="flex-1 text-left py-[7px] px-2 rounded-[7px] text-[11px] font-bold truncate cursor-pointer transition-all duration-[120ms]"
              style={{
                fontFamily: 'var(--sans)',
                color: currentConversationId === c.id ? 'var(--p-ink)' : 'var(--p-mid)',
                background: currentConversationId === c.id ? 'var(--p-sand)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (currentConversationId !== c.id) { e.currentTarget.style.background = 'var(--p-sand)'; e.currentTarget.style.color = 'var(--p-ink)'; }}}
              onMouseLeave={(e) => { if (currentConversationId !== c.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--p-mid)'; }}}
            >
              {c.title}
            </button>
            <button
              onClick={() => onDeleteConversation?.(c.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--p-muted)] hover:text-red-500 cursor-pointer transition-opacity duration-150 shrink-0"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Tools section */}
      {!slim && (
        <p className="text-[9px] font-bold tracking-[0.1em] uppercase px-1 mb-1.5 mt-2 shrink-0" style={{ color: 'var(--p-muted)', fontFamily: 'var(--sans)' }}>
          Tools
        </p>
      )}

      <SideLink slim={slim} label="Upload" onClick={() => { onOpenUpload?.(); onClose?.(); }}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </SideLink>
      <SideLink slim={slim} label="Neoserra" onClick={() => { onOpenNeoserra?.(); onClose?.(); }}>
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </SideLink>
      <SideLink slim={slim} label="Prompts" onClick={() => { onOpenPromptLibrary(); onClose?.(); }}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </SideLink>
      {/* Learn link */}
      <SideLink slim={slim} label="Learn" onClick={() => { router.push('/learn'); onClose?.(); }}>
        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </SideLink>
      <SideLink slim={slim} label="Events" onClick={() => { onOpenEvents?.(); onClose?.(); }}>
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </SideLink>

      <div className="h-px my-1.5 shrink-0" style={{ background: 'var(--p-line)' }} />

      <SideLink slim={slim} label="About" onClick={() => { onOpenAbout?.(); onClose?.(); }}>
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </SideLink>

      {!slim && (
        <div className="flex gap-3 px-1 pt-1.5 shrink-0">
          <button onClick={() => router.push('/dashboard')} className="text-[10px] cursor-pointer transition-colors duration-[120ms]" style={{ color: 'var(--p-muted)', background: 'none', border: 'none', padding: 0 }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--p-ink)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--p-muted)'; }}>Analytics</button>
          <button onClick={() => { clearToken(); window.location.href = '/login'; }} className="text-[10px] cursor-pointer transition-colors duration-[120ms]" style={{ color: 'var(--p-muted)', background: 'none', border: 'none', padding: 0 }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--p-ink)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--p-muted)'; }}>Sign Out</button>
        </div>
      )}

    </aside>
  );
}

function SideLink({ slim, label, onClick, children }: { slim: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 py-[7px] px-2 rounded-[7px] text-[11px] font-bold cursor-pointer w-full text-left whitespace-nowrap shrink-0 transition-all duration-[120ms]"
      style={{ fontFamily: 'var(--sans)', color: 'var(--p-mid)', background: 'transparent', border: 'none', justifyContent: slim ? 'center' : 'flex-start' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--p-sand)'; e.currentTarget.style.color = 'var(--p-ink)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--p-mid)'; }}
    >
      <svg className="w-4 h-4 shrink-0 opacity-55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        {children}
      </svg>
      {!slim && <span>{label}</span>}
    </button>
  );
}
