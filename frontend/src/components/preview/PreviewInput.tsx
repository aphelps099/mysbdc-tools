'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { uploadDocument, transcribeAudio } from '@/lib/api';
import { startPcmRecording, PcmRecorder } from '@/lib/audioUtils';
import AnimatedPlaceholder from '@/components/ui/AnimatedPlaceholder';

interface UploadedDoc {
  filename: string;
  chunks: number;
}

interface PreviewInputProps {
  onSend: (message: string) => void;
  onOpenPromptLibrary: () => void;
  onOpenEvents?: () => void;
  onOpenNeoserra?: () => void;
  disabled?: boolean;
  /** Expose the upload trigger so sidebar can invoke it */
  uploadTriggerRef?: React.MutableRefObject<(() => void) | null>;
}

export default function PreviewInput({ onSend, onOpenPromptLibrary, onOpenEvents, onOpenNeoserra, disabled, uploadTriggerRef }: PreviewInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pcmRecorderRef = useRef<PcmRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Upload state
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | 'uploading'; message: string } | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);

  // Auto-dismiss upload status after 4s
  useEffect(() => {
    if (uploadStatus && uploadStatus.type !== 'uploading') {
      const timer = setTimeout(() => setUploadStatus(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const recorder = await startPcmRecording();
      pcmRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingElapsed(0);
      recordingTimerRef.current = setInterval(() => setRecordingElapsed((e) => e + 1), 1000);
    } catch {
      setUploadStatus({
        type: 'error',
        message: 'Microphone access denied. Please allow microphone permissions.',
      });
    }
  };

  const stopRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const recorder = pcmRecorderRef.current;
    pcmRecorderRef.current = null;
    setIsRecording(false);

    if (!recorder) return;

    setIsTranscribing(true);
    try {
      const wavBlob = await recorder.stop();
      if (wavBlob.size < 1000) {
        setUploadStatus({ type: 'error', message: 'Recording too short — try again' });
        return;
      }

      const { text } = await transcribeAudio(wavBlob);
      if (text) {
        setValue((prev) => (prev ? prev + ' ' + text : text));
        inputRef.current?.focus();
      }
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Transcription failed',
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Upload handlers ──
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Expose upload trigger to parent via ref
  useEffect(() => {
    if (uploadTriggerRef) {
      uploadTriggerRef.current = handleUploadClick;
    }
  }, [uploadTriggerRef, handleUploadClick]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploadStatus({ type: 'uploading', message: `Uploading ${file.name}...` });

    try {
      const result = await uploadDocument(file);
      if (result.ingestion_error) {
        setUploadStatus({
          type: 'error',
          message: `${result.filename} saved but indexing failed: ${result.ingestion_error}`,
        });
      } else if (result.chunks_created === 0) {
        setUploadStatus({
          type: 'error',
          message: `${result.filename} saved but produced 0 chunks. The file may be empty or unreadable.`,
        });
      } else {
        setUploadedDocs((prev) => [
          ...prev.filter((d) => d.filename !== result.filename),
          { filename: result.filename, chunks: result.chunks_created },
        ]);
        setUploadStatus({
          type: 'success',
          message: `${result.filename} indexed (${result.chunks_created} chunks ready for RAG)`,
        });
      }
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Upload failed',
      });
    }
  };

  const removeDoc = (filename: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.filename !== filename));
  };

  const hasContent = value.trim().length > 0;

  // Status colors
  const statusColors = {
    uploading: { bg: 'rgba(22,45,80,0.06)', border: 'rgba(22,45,80,0.12)', color: 'var(--p-navy, #162d50)' },
    success: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)', color: '#059669' },
    error: { bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.12)', color: '#dc2626' },
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 px-4 md:px-8 md:pb-5"
      style={{ paddingBottom: actionsOpen ? 0 : 20 }}
    >
      {/* Fade gradient */}
      <div
        className="absolute top-[-32px] left-0 right-0 h-8 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--p-sand))' }}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.md,.html,.csv,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="mx-auto" style={{ maxWidth: 620 }}>
        {/* Upload status toast */}
        {uploadStatus && (
          <div
            className="mb-2 flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[12px] font-light"
            style={{
              fontFamily: 'var(--sans)',
              background: statusColors[uploadStatus.type].bg,
              border: `1px solid ${statusColors[uploadStatus.type].border}`,
              color: statusColors[uploadStatus.type].color,
            }}
          >
            {uploadStatus.type === 'uploading' && (
              <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin shrink-0" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
            )}
            {uploadStatus.type === 'success' && (
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            )}
            {uploadStatus.type === 'error' && (
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            )}
            <span className="truncate">{uploadStatus.message}</span>
            {uploadStatus.type !== 'uploading' && (
              <button
                onClick={() => setUploadStatus(null)}
                className="ml-auto shrink-0 p-0.5 rounded-full opacity-40 hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: 'currentColor' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* RAG document pills */}
        {uploadedDocs.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-[9px] font-bold tracking-[0.1em] uppercase mr-0.5" style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted)' }}>
              RAG
            </span>
            {uploadedDocs.map((doc) => (
              <span
                key={doc.filename}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-[3px] rounded-full text-[11px] transition-all"
                style={{
                  fontFamily: 'var(--sans)',
                  background: 'rgba(22,45,80,0.06)',
                  border: '1px solid rgba(22,45,80,0.1)',
                  color: 'var(--p-navy, #162d50)',
                }}
              >
                <svg className="w-3 h-3 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className="truncate max-w-[120px]">{doc.filename}</span>
                <span className="text-[9px] opacity-40 tabular-nums">{doc.chunks}</span>
                <button
                  onClick={() => removeDoc(doc.filename)}
                  className="p-0.5 rounded-full opacity-30 hover:opacity-70 transition-opacity cursor-pointer"
                  style={{ color: 'currentColor' }}
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ─── Mobile: full-bleed surface with tools + input (md:hidden) ─── */}

        {/* Full-width surface — breaks out of max-width container and px-4 parent */}
        <div
          className="md:hidden relative transition-all duration-[400ms]"
          style={{
            /* Break out of the mx-auto max-w-620 + px-4 parent to go edge-to-edge */
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
            width: '100vw',
            /* Surface background — only visible when open */
            background: actionsOpen ? 'var(--p-elevated)' : 'transparent',
            borderTop: actionsOpen ? '1px solid var(--p-elevated-border)' : '1px solid transparent',
            boxShadow: actionsOpen
              ? '0 -8px 40px -8px rgba(0,0,0,0.06)'
              : 'none',
            borderRadius: actionsOpen ? '24px 24px 0 0' : '0',
            transitionTimingFunction: 'var(--p-ease, cubic-bezier(0.22,1,0.36,1))',
            /* Pad the content back to match the original container inset */
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: actionsOpen ? 20 : 0,
            paddingBottom: actionsOpen ? 'max(16px, env(safe-area-inset-bottom))' : 4,
          }}
        >
          {/* Tools grid — height-animated */}
          <div
            className="overflow-hidden transition-all duration-[350ms]"
            style={{
              maxHeight: actionsOpen ? 280 : 0,
              opacity: actionsOpen ? 1 : 0,
              transitionTimingFunction: 'var(--p-ease, cubic-bezier(0.22,1,0.36,1))',
              pointerEvents: actionsOpen ? 'auto' : 'none',
            }}
          >
            <div
              className="grid gap-[10px] pb-3"
              style={{ gridTemplateColumns: '1fr 1fr' }}
            >
              <MobileGridAction
                label="Prompts"
                subtitle="Browse templates"
                stagger={1}
                open={actionsOpen}
                onClick={() => { onOpenPromptLibrary(); setActionsOpen(false); }}
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
              </MobileGridAction>
              <MobileGridAction
                label="Events"
                subtitle="SBDC calendar"
                stagger={2}
                open={actionsOpen}
                onClick={() => { onOpenEvents?.(); setActionsOpen(false); }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </MobileGridAction>
              <MobileGridAction
                label="Upload"
                subtitle="Add a document"
                stagger={3}
                open={actionsOpen}
                onClick={() => { handleUploadClick(); setActionsOpen(false); }}
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </MobileGridAction>
              <MobileGridAction
                label={isRecording ? formatRecordingTime(recordingElapsed) : isTranscribing ? 'Transcribing' : 'Record'}
                subtitle={isRecording ? 'Tap to stop' : isTranscribing ? 'Please wait…' : 'Voice input'}
                stagger={4}
                open={actionsOpen}
                active={isRecording}
                loading={isTranscribing}
                onClick={() => { toggleRecording(); }}
              >
                <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
              </MobileGridAction>
              <MobileGridAction
                label="Neoserra"
                subtitle="Client lookup"
                stagger={5}
                open={actionsOpen}
                onClick={() => { onOpenNeoserra?.(); setActionsOpen(false); }}
              >
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </MobileGridAction>
            </div>
          </div>

          {/* Input row: + button + pill — sits inside the surface */}
          <div className="flex items-center gap-2.5">
            {/* + / × toggle — very subtle active state */}
            <button
              onClick={() => setActionsOpen((o) => !o)}
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-all duration-300 active:scale-[0.92]"
              style={{
                background: actionsOpen ? 'rgba(22,45,80,0.07)' : 'var(--p-elevated)',
                border: actionsOpen ? '1.5px solid rgba(22,45,80,0.12)' : '1.5px solid var(--p-line)',
                color: actionsOpen ? 'var(--p-navy)' : 'var(--p-muted)',
                boxShadow: actionsOpen
                  ? 'none'
                  : '0 1px 4px rgba(0,0,0,0.06)',
                transitionTimingFunction: 'var(--p-ease, cubic-bezier(0.22,1,0.36,1))',
              }}
            >
              <svg
                className="w-[22px] h-[22px] transition-transform duration-300"
                style={{
                  transform: actionsOpen ? 'rotate(45deg)' : 'none',
                  transitionTimingFunction: 'var(--p-ease, cubic-bezier(0.22,1,0.36,1))',
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* Input pill */}
            <div
              className="flex-1 flex items-center gap-0 transition-all duration-200"
              style={{
                background: actionsOpen ? 'rgba(0,0,0,0.03)' : 'var(--p-elevated)',
                border: focused ? '2px solid var(--p-accent)' : actionsOpen ? '1px solid var(--p-line)' : '2px solid var(--p-line)',
                borderRadius: 100,
                padding: '6px 6px 6px 20px',
                height: 56,
                boxShadow: focused
                  ? '0 2px 16px -4px rgba(22,45,80,0.1)'
                  : actionsOpen
                    ? 'none'
                    : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div className="relative flex-1" style={{ height: 22 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder=""
                  disabled={disabled}
                  className="w-full border-none outline-none bg-transparent text-[17px] font-light"
                  style={{
                    fontFamily: 'var(--sans)',
                    color: 'var(--p-ink)',
                    height: 22,
                    lineHeight: '22px',
                  }}
                />
                <div className="absolute left-0 top-0 h-[24px] pointer-events-none" style={{ top: -2 }}>
                  <AnimatedPlaceholder visible={value.length === 0 && !isRecording && !isTranscribing} fontSize={18} />
                </div>
              </div>

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={!hasContent || disabled}
                className="w-[42px] h-[42px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 disabled:cursor-not-allowed shrink-0"
                style={{
                  background: hasContent && !disabled ? 'var(--p-accent)' : 'var(--p-send-idle)',
                  color: hasContent && !disabled ? 'var(--p-accent-contrast)' : 'var(--p-muted)',
                  border: 'none',
                }}
              >
                <svg className="w-[24px] h-[24px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: original pill layout (hidden on mobile) */}
        <div
          className="hidden md:flex items-center gap-2"
        >
          <div
            className="flex-1 flex items-center gap-0 transition-all duration-200"
            style={{
              background: 'var(--p-elevated)',
              border: focused ? '2px solid var(--p-accent)' : '2px solid var(--p-line)',
              borderRadius: 100,
              padding: '6px 6px 6px 20px',
              height: 60,
              boxShadow: focused
                ? '0 2px 16px -4px rgba(22,45,80,0.1)'
                : '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
          <div className="relative flex-1" style={{ height: 22 }}>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder=""
              disabled={disabled}
              className="w-full border-none outline-none bg-transparent text-[17px] font-light"
              style={{
                fontFamily: 'var(--sans)',
                color: 'var(--p-ink)',
                height: 22,
                lineHeight: '22px',
              }}
            />
            <div className="absolute left-0 top-0 h-[24px] pointer-events-none" style={{ top: -2 }}>
              <AnimatedPlaceholder visible={value.length === 0 && !isRecording && !isTranscribing} fontSize={18} />
            </div>
          </div>

          <div className="flex items-center gap-[1px] shrink-0">
            {/* Prompts */}
            <InputAction title="Prompts" onClick={onOpenPromptLibrary}>
              <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </InputAction>
            {/* Attach */}
            <InputAction
              title="Upload document for RAG"
              onClick={handleUploadClick}
              disabled={uploadStatus?.type === 'uploading'}
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48" />
            </InputAction>
            {/* Voice input */}
            <div className="relative">
              <button
                onClick={toggleRecording}
                disabled={isTranscribing}
                title={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Voice input'}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-[120ms] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  border: 'none',
                  background: isRecording ? 'rgba(239,68,68,0.1)' : isTranscribing ? 'rgba(245,158,11,0.1)' : 'transparent',
                  color: isRecording ? '#ef4444' : isTranscribing ? '#d97706' : 'var(--p-muted)',
                  opacity: isRecording || isTranscribing ? 1 : 0.7,
                }}
                onMouseEnter={(e) => { if (!isRecording && !isTranscribing) { e.currentTarget.style.background = 'var(--p-hover)'; e.currentTarget.style.color = 'var(--p-ink)'; e.currentTarget.style.opacity = '1'; } }}
                onMouseLeave={(e) => { if (!isRecording && !isTranscribing) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--p-muted)'; e.currentTarget.style.opacity = '0.7'; } }}
              >
                {isTranscribing ? (
                  <svg className="w-[18px] h-[18px] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
                  </svg>
                )}
                {isRecording && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              {isRecording && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap pointer-events-none flex items-center gap-2"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    color: '#ef4444',
                    fontFamily: 'var(--sans)',
                    animation: 'pvEnter 0.2s ease both',
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  {formatRecordingTime(recordingElapsed)}
                </div>
              )}
            </div>
            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!hasContent || disabled}
              className="w-[44px] h-[44px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 disabled:cursor-not-allowed shrink-0"
              style={{
                background: hasContent && !disabled ? 'var(--p-accent)' : 'var(--p-send-idle)',
                color: hasContent && !disabled ? 'var(--p-accent-contrast)' : 'var(--p-muted)',
                border: 'none',
              }}
              onMouseEnter={(e) => { if (hasContent && !disabled) { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 2px 12px -2px rgba(22,45,80,0.35)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg className="w-[25px] h-[25px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
        </div>

        <p className="hidden md:block text-center mt-[5px]" style={{ fontSize: 9, color: 'var(--p-muted)' }}>
          Enter to send &middot; Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}

/** 2-column grid action — horizontal icon + text, choreographed entrance */
function MobileGridAction({ label, subtitle, stagger, open, active, loading, onClick, children }: {
  label: string;
  subtitle?: string;
  stagger: number;
  open: boolean;
  active?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  // Staggered delay: 40ms apart, starting at 60ms after tray begins expanding
  const delay = 60 + (stagger - 1) * 40;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl cursor-pointer transition-all duration-150 active:scale-[0.97]"
      style={{
        fontFamily: 'var(--sans)',
        background: active
          ? 'rgba(239,68,68,0.06)'
          : loading
            ? 'rgba(245,158,11,0.05)'
            : 'var(--p-hover, rgba(0,0,0,0.03))',
        border: active
          ? '1.5px solid rgba(239,68,68,0.18)'
          : '1.5px solid var(--p-elevated-border)',
        padding: '14px 14px',
        opacity: open ? 1 : 0,
        transform: open ? 'none' : 'translateY(8px)',
        transition: `opacity 0.3s var(--p-ease) ${delay}ms, transform 0.3s var(--p-ease) ${delay}ms, background 0.15s ease, border-color 0.15s ease`,
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-[14px] shrink-0"
        style={{
          width: 46,
          height: 46,
          background: active
            ? 'rgba(239,68,68,0.10)'
            : loading
              ? 'rgba(245,158,11,0.08)'
              : 'var(--p-elevated)',
          boxShadow: active || loading
            ? 'none'
            : '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
          color: active ? '#ef4444' : loading ? '#d97706' : 'var(--p-navy, #162d50)',
          position: 'relative',
        }}
      >
        {loading ? (
          <svg className="w-[21px] h-[21px] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-[21px] h-[21px]" style={{ opacity: active ? 0.9 : 0.7 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {children}
          </svg>
        )}
        {active && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        )}
      </div>
      {/* Text */}
      <div className="flex flex-col items-start min-w-0">
        <span
          className="text-[13px] font-semibold leading-tight"
          style={{ color: active ? '#ef4444' : loading ? '#d97706' : 'var(--p-ink)' }}
        >
          {label}
        </span>
        {subtitle && (
          <span
            className="text-[11px] font-normal leading-tight mt-0.5 tracking-[0.01em]"
            style={{ color: 'var(--p-muted)' }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </button>
  );
}

function InputAction({ title, onClick, disabled, children }: { title: string; onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-[120ms] disabled:opacity-20 disabled:cursor-not-allowed"
      style={{ border: 'none', background: 'transparent', color: 'var(--p-muted)', opacity: 0.7 }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = 'var(--p-hover)'; e.currentTarget.style.color = 'var(--p-ink)'; e.currentTarget.style.opacity = '1'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--p-muted)'; e.currentTarget.style.opacity = '0.7'; }}
    >
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>{children}</svg>
    </button>
  );
}
