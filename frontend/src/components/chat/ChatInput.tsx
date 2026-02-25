'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { uploadDocument, transcribeAudio } from '@/lib/api';
import { startPcmRecording, PcmRecorder } from '@/lib/audioUtils';
import AnimatedPlaceholder from '@/components/ui/AnimatedPlaceholder';

interface UploadedDoc {
  filename: string;
  chunks: number;
}

const AVAILABLE_MODELS = [
  { id: 'gpt-4o-mini', label: '4o mini' },
  { id: 'gpt-5-mini', label: '5 mini' },
];

interface ChatInputProps {
  onSend: (message: string) => void;
  onOpenPromptLibrary: () => void;
  disabled?: boolean;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

export default function ChatInput({ onSend, onOpenPromptLibrary, disabled, selectedModel, onModelChange }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | 'uploading'; message: string } | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pcmRecorderRef = useRef<PcmRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Auto-resize textarea — grow up to 5 lines, then scroll
  const maxRows = 5;
  const lineHeight = 19 * 1.6; // 19px font × 1.6 leading = 30.4px per line
  const maxHeight = Math.round(lineHeight * maxRows); // ~152px

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
      el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [value, maxHeight]);

  // Auto-dismiss status banner after 4s
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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
        textareaRef.current?.focus();
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

  const hasContent = value.trim().length > 0;

  return (
    <div className="px-2 pb-3 pt-2 sm:px-5 sm:pb-5">
      {/* Upload status toast */}
      {uploadStatus && (
        <div
          className={`
            mb-2.5 flex items-center gap-2.5 px-4 py-2.5 rounded-[16px] text-[13px]
            backdrop-blur-sm transition-all duration-300
            ${uploadStatus.type === 'uploading'
              ? 'bg-[var(--navy)]/[0.06] text-[var(--navy)] border border-[var(--navy)]/10'
              : ''}
            ${uploadStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : ''}
            ${uploadStatus.type === 'error'
              ? 'bg-red-50 text-red-600 border border-red-200/60'
              : ''}
          `}
        >
          {uploadStatus.type === 'uploading' && (
            <svg className="w-3.5 h-3.5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
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
          <span className="font-light truncate">{uploadStatus.message}</span>
          {uploadStatus.type !== 'uploading' && (
            <button
              onClick={() => setUploadStatus(null)}
              className="ml-auto shrink-0 p-0.5 rounded-full text-current opacity-40 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* RAG document pills */}
      {uploadedDocs.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[var(--text-tertiary)] mr-1">
            RAG
          </span>
          {uploadedDocs.map((doc) => (
            <span
              key={doc.filename}
              className="
                inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1
                text-[11px] font-normal tracking-[0.01em]
                bg-[var(--navy)]/[0.06] text-[var(--navy)]
                border border-[var(--navy)]/10
                rounded-full
                transition-all duration-150
                hover:bg-[var(--navy)]/[0.1]
              "
            >
              <svg className="w-3 h-3 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span className="truncate max-w-[120px]">{doc.filename}</span>
              <span className="text-[9px] opacity-40 tabular-nums">{doc.chunks}</span>
              <button
                onClick={() => removeDoc(doc.filename)}
                className="p-0.5 rounded-full hover:bg-[var(--navy)]/15 text-[var(--navy)] opacity-30 hover:opacity-70 transition-opacity cursor-pointer"
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
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

      {/* ── Main input container ── */}
      <div
        className={`
          relative
          bg-white
          rounded-[20px]
          border
          transition-all duration-200 ease-[var(--ease)]
          ${isFocused
            ? 'border-[var(--navy)]/25 shadow-[0_0_0_3px_rgba(15,28,46,0.06),0_2px_16px_rgba(0,0,0,0.06)]'
            : 'border-[var(--rule)] shadow-[0_1px_8px_rgba(0,0,0,0.04)]'}
          ${disabled ? 'opacity-60' : ''}
        `}
      >
        {/* Recording / transcribing indicator */}
        {(isRecording || isTranscribing) && (
          <div
            className={`
              flex items-center gap-2.5 px-5 pt-3 pb-1
              text-[12px] font-semibold tracking-[0.04em]
              transition-all duration-200
              ${isRecording ? 'text-red-500' : 'text-amber-600'}
            `}
          >
            {isRecording ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span>Recording {formatRecordingTime(recordingElapsed)}</span>
                <button
                  onClick={stopRecording}
                  className="ml-auto text-[10px] font-bold tracking-[0.06em] uppercase px-3 py-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Stop
                </button>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Transcribing...</span>
              </>
            )}
          </div>
        )}

        {/* Textarea with animated placeholder */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="chat-input"
            name="chat-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder=""
            disabled={disabled}
            rows={1}
            className="
              w-full resize-none bg-transparent overflow-hidden
              px-5 pt-4 pb-1
              text-[19px] leading-[1.6] font-[var(--era-text)] font-normal
              text-[var(--text-primary)]
              focus:outline-none
              disabled:cursor-not-allowed
            "
          />
          <div className="absolute left-5 top-4 h-[28px] pointer-events-none">
            <AnimatedPlaceholder visible={value.length === 0 && !isRecording && !isTranscribing} />
          </div>
        </div>

        {/* Bottom toolbar — inside the card */}
        <div className="flex items-center justify-between px-2.5 pb-2.5">
          {/* Left actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onOpenPromptLibrary}
              className="
                group relative p-2 rounded-[10px]
                text-[var(--text-tertiary)]/60
                hover:text-[var(--navy)] hover:bg-[var(--navy)]/[0.06]
                active:scale-95
                transition-all duration-150
                cursor-pointer
              "
              title="Browse Prompts"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
              </svg>
            </button>
            <button
              onClick={handleUploadClick}
              disabled={uploadStatus?.type === 'uploading'}
              className="
                group relative p-2 rounded-[10px]
                text-[var(--text-tertiary)]/60
                hover:text-[var(--navy)] hover:bg-[var(--navy)]/[0.06]
                active:scale-95
                transition-all duration-150
                cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent
              "
              title="Upload document for RAG"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
              </svg>
            </button>
            <button
              onClick={toggleRecording}
              disabled={isTranscribing}
              className={`
                group relative p-2 rounded-[10px]
                active:scale-95
                transition-all duration-150
                cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent
                ${isRecording
                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                  : isTranscribing
                    ? 'text-amber-500 bg-amber-50'
                    : 'text-[var(--text-tertiary)]/60 hover:text-[var(--navy)] hover:bg-[var(--navy)]/[0.06]'}
              `}
              title={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Voice input'}
            >
              {isTranscribing ? (
                <svg className="w-[18px] h-[18px] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              )}
              {isRecording && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!hasContent || disabled}
            className={`
              shrink-0 w-11 h-11
              flex items-center justify-center
              rounded-[14px]
              transition-all duration-200 ease-[var(--ease)]
              cursor-pointer
              ${hasContent && !disabled
                ? 'bg-[var(--navy)] text-white shadow-[0_2px_8px_rgba(15,28,46,0.25)] hover:shadow-[0_4px_14px_rgba(15,28,46,0.3)] hover:brightness-125 active:scale-95'
                : 'bg-[var(--cream)] text-[var(--text-tertiary)]/40 cursor-not-allowed'}
            `}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer row: model toggle + hint */}
      <div className="flex items-center justify-between mt-1.5 px-1">
        {/* Model toggle pills */}
        {onModelChange ? (
          <div className="flex items-center gap-0.5 rounded-full bg-[var(--cream)]/80 p-0.5">
            {AVAILABLE_MODELS.map((m) => {
              const isActive = (selectedModel || 'gpt-4o-mini') === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onModelChange(m.id)}
                  className={`
                    px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-[0.03em]
                    transition-all duration-150 cursor-pointer
                    ${isActive
                      ? 'bg-white text-[var(--text-secondary)] shadow-[0_0.5px_2px_rgba(0,0,0,0.1)]'
                      : 'text-[var(--text-tertiary)]/50 hover:text-[var(--text-tertiary)]'}
                  `}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div />
        )}
        <span className="text-[11px] text-[var(--text-tertiary)]/40 font-light tracking-[0.01em]">
          Enter to send, Shift + Enter for new line
        </span>
      </div>
    </div>
  );
}
