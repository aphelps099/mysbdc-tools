'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import WorkflowComingSoonModal from '../workflows/WorkflowComingSoonModal';
import { useRouter } from 'next/navigation';
import { fetchHealth, fetchWorkflows, fetchDocuments, uploadDocument } from '@/lib/api';
import type { HealthData, WorkflowMeta, ConversationSummary } from '@/lib/api';
import { clearToken } from '@/lib/api';

interface SidebarProps {
  onOpenPromptLibrary: () => void;
  onOpenAIPolicy: () => void;
  onSelectWorkflow: (workflow: WorkflowMeta) => void;
  onOpenEvents?: () => void;
  onOpenNeoserra?: () => void;
  onClose?: () => void;
  onClearChat?: () => void;
  conversations?: ConversationSummary[];
  currentConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export default function Sidebar({ onOpenPromptLibrary, onOpenAIPolicy, onSelectWorkflow, onOpenEvents, onOpenNeoserra, onClose, onClearChat, conversations = [], currentConversationId, onSelectConversation, onDeleteConversation }: SidebarProps) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowMeta[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowsOpen, setWorkflowsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => {});
    fetchWorkflows().then((d) => setWorkflows(d.workflows)).catch(() => {});
    fetchDocuments().then((d) => setDocCount(d.total_chunks)).catch(() => {});
  }, []);

  // Auto-dismiss upload message
  useEffect(() => {
    if (uploadMsg) {
      const t = setTimeout(() => setUploadMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [uploadMsg]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    setUploadMsg(null);
    try {
      const result = await uploadDocument(file);
      if (result.ingestion_error) {
        setUploadMsg({ type: 'error', text: `Indexing failed: ${result.ingestion_error}` });
      } else if (result.chunks_created === 0) {
        setUploadMsg({ type: 'error', text: 'File produced 0 chunks' });
      } else {
        setDocCount(result.total_chunks);
        setUploadMsg({ type: 'success', text: `${result.filename} indexed` });
      }
    } catch (err) {
      setUploadMsg({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const modelDisplay = health?.model_display || health?.model || 'Loading...';

  return (
    <aside className="flex flex-col min-h-full bg-[var(--navy)] text-white overflow-y-auto md:overflow-hidden">
      {/* ─── Logo ─── */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <Image
          src="/sbdc-white-2026.png"
          alt="NorCal SBDC"
          width={100}
          height={40}
          className="object-contain"
          priority
        />
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ─── Model indicator ─── */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${health ? 'bg-[var(--green)]' : 'bg-white/30'}`} />
          <span className="font-[var(--mono)] text-[11px] tracking-wider uppercase text-white/55">
            {modelDisplay}
          </span>
        </div>
      </div>

      {/* ─── AI Policy badge ─── */}
      <div className="px-6 pb-5">
        <button
          data-tour="ai-policy"
          onClick={() => {
            onOpenAIPolicy();
            onClose?.();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-white/[0.06] hover:bg-white/[0.1] transition-colors duration-[var(--duration-fast)] cursor-pointer text-white/55 hover:text-white/80 text-[12px] font-[var(--mono)] tracking-wider uppercase"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          AI Policy
        </button>
      </div>

      {/* ─── Divider ─── */}
      <div className="h-px bg-[var(--rule-on-dark)] mx-6" />

      {/* ─── New Chat ─── */}
      <div className="px-4 py-4">
        <button
          data-tour="new-chat"
          onClick={() => {
            onClearChat?.();
            onClose?.();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--royal)] text-white rounded-[var(--radius-md)] font-[var(--sans)] font-medium text-[14px] hover:bg-[#1a4f96] active:bg-[#164282] transition-colors duration-[var(--duration-fast)] cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Chat
        </button>
      </div>

      {/* ─── Chat History ─── */}
      <div className="px-4 pb-2 flex-1 overflow-y-auto min-h-0">
        <p className="text-label text-white/40 px-2 pb-2">Recent</p>
        <div className="space-y-0.5">
          {conversations.length === 0 ? (
            <p className="px-3 py-2 text-[13px] font-[var(--sans)] font-light text-white/30 italic">
              No conversations yet
            </p>
          ) : (
            conversations.map((convo) => (
              <div
                key={convo.id}
                className={`group flex items-center gap-1 rounded-[var(--radius-md)] transition-colors duration-[var(--duration-fast)] ${
                  currentConversationId === convo.id
                    ? 'bg-white/[0.1]'
                    : 'hover:bg-white/[0.06]'
                }`}
              >
                <button
                  onClick={() => {
                    onSelectConversation?.(convo.id);
                    onClose?.();
                  }}
                  className="flex-1 text-left px-3 py-2 min-w-0 cursor-pointer"
                >
                  <p className={`text-[13px] font-[var(--sans)] truncate ${
                    currentConversationId === convo.id
                      ? 'text-white/90 font-medium'
                      : 'text-white/55 font-light'
                  }`}>
                    {convo.title}
                  </p>
                  <p className="text-[10px] font-[var(--mono)] text-white/25 mt-0.5">
                    {convo.message_count} msg{convo.message_count !== 1 ? 's' : ''}
                  </p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation?.(convo.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 rounded text-white/25 hover:text-red-400 hover:bg-white/[0.06] transition-all duration-[var(--duration-fast)] cursor-pointer shrink-0"
                  title="Delete conversation"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Divider ─── */}
      <div className="h-px bg-[var(--rule-on-dark)] mx-6" />

      {/* ─── Documents ─── */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between px-2 pb-2">
          <p className="text-label text-white/40">Documents</p>
          {docCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-[var(--mono)] font-medium tracking-wide rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-400/20">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              {docCount}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-[var(--mono)] tracking-wide rounded-full text-white/25 border border-white/10">
              0
            </span>
          )}
        </div>

        {/* Upload status message */}
        {uploadMsg && (
          <div className={`mb-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-[11px] font-[var(--sans)] ${
            uploadMsg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          }`}>
            {uploadMsg.type === 'success' ? '✓' : '✗'} {uploadMsg.text}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.md,.html,.csv,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-white/15 rounded-[var(--radius-md)] text-[13px] text-white/40 hover:text-white/60 hover:border-white/25 transition-colors duration-[var(--duration-fast)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Indexing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              Upload document
            </>
          )}
        </button>
      </div>

      {/* ─── Divider ─── */}
      <div className="h-px bg-[var(--rule-on-dark)] mx-6" />

      {/* ─── Workflows (accordion) ─── */}
      <div className="px-4 py-4" data-tour="workflows">
        {/* Accordion header */}
        <button
          onClick={() => setWorkflowsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-2 pb-2 cursor-pointer group"
        >
          <p className="text-label text-white/40 group-hover:text-white/60 transition-colors duration-[var(--duration-fast)]">
            Workflows
          </p>
          <svg
            className={`w-3.5 h-3.5 text-white/25 group-hover:text-white/40 transition-all duration-200 ${workflowsOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>

        {/* Accordion body */}
        {workflowsOpen && (
          <div className="space-y-1">
            {workflows.length === 0 ? (
              <button
                onClick={() => setWorkflowModalOpen(true)}
                className="w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-white/[0.06] transition-colors duration-[var(--duration-fast)] cursor-pointer group"
              >
                <p className="text-[13px] font-[var(--sans)] font-light text-white/40 group-hover:text-white/60 italic">
                  Custom workflows coming soon →
                </p>
              </button>
            ) : (
              workflows.map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => {
                      onSelectWorkflow(wf);
                      onClose?.();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-white/[0.06] transition-colors duration-[var(--duration-fast)] cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-[var(--sans)] font-medium text-white/75 group-hover:text-white">
                        {wf.name}
                      </p>
                    </div>
                    <p className="text-[12px] font-[var(--sans)] font-light text-white/35 mt-0.5">
                      {wf.description}
                    </p>
                  </button>
                ))
            )}
          </div>
        )}
      </div>

      <WorkflowComingSoonModal
        open={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
      />

      {/* ─── Bottom ─── */}
      <div className="mt-auto">
        <div className="h-px bg-[var(--rule-on-dark)] mx-6" />

        {/* Browse Prompts */}
        <div className="px-4 pt-3 pb-1.5">
          <button
            data-tour="prompt-library"
            onClick={() => {
              onOpenPromptLibrary();
              onClose?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white rounded-[var(--radius-md)] font-[var(--sans)] font-medium text-[14px] transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
            </svg>
            Browse Prompts
          </button>
        </div>

        {/* SBDC Events */}
        <div className="px-4 pb-1.5">
          <button
            data-tour="events"
            onClick={() => {
              onOpenEvents?.();
              onClose?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white rounded-[var(--radius-md)] font-[var(--sans)] font-medium text-[14px] transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            SBDC Events
          </button>
        </div>

        {/* Clear conversation */}
        <div className="px-6 pb-3">
          <button
            onClick={() => {
              onClearChat?.();
              onClose?.();
            }}
            className="text-[12px] font-[var(--mono)] text-white/25 hover:text-white/50 tracking-wider uppercase transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            Clear Conversation
          </button>
        </div>

        {/* Analytics + NEO + Sign out */}
        <div className="px-6 pb-4 flex items-center gap-4">
          <button
            onClick={() => {
              router.push('/dashboard');
              onClose?.();
            }}
            className="text-[12px] font-[var(--mono)] text-white/25 hover:text-white/50 tracking-wider uppercase transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            Analytics
          </button>
          <span className="text-white/10">|</span>
          <button
            onClick={() => {
              onOpenNeoserra?.();
              onClose?.();
            }}
            className="text-[12px] font-[var(--mono)] text-white/25 hover:text-white/50 tracking-wider uppercase transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            NEO
          </button>
          <span className="text-white/10">|</span>
          <button
            onClick={() => {
              clearToken();
              window.location.href = '/login';
            }}
            className="text-[12px] font-[var(--mono)] text-white/25 hover:text-[var(--red)]/70 tracking-wider uppercase transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
