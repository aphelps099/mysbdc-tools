'use client';

import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import './chat.css';

/* ═══════════════════════════════════════════════════════
   Chat — NorCal SBDC Brand Resource Chat Interface
   Streaming Claude chat with locked (brand-only) and
   unlocked (full assistant) modes.
   ═══════════════════════════════════════════════════════ */

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FileAttachment {
  name: string;
  content: string;
  size: number;
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content:
    "I'm your NorCal SBDC brand assistant. I can help you draft social posts, email copy, newsletter content, success stories, talking points, and more.\n\nWhat would you like to create?",
};

const MAX_FILE_SIZE = 100_000;
const MAX_TOTAL_SIZE = 500_000;
const MAX_FILES = 5;
const ALLOWED_EXTENSIONS = ['.txt', '.csv', '.md', '.json', '.html', '.pdf'];

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pages.push(tc.items.map((item: any) => item.str).join(' '));
  }
  return pages.join('\n\n');
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [fileError, setFileError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages or streaming content
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [input]);

  // ── Copy to clipboard ──
  const handleCopy = useCallback(async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  }, []);

  // ── File upload ──
  const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    e.target.value = '';
    setFileError('');

    if (files.length + selected.length > MAX_FILES) {
      setFileError(`Maximum ${MAX_FILES} files allowed`);
      setTimeout(() => setFileError(''), 5000);
      return;
    }

    const currentTotal = files.reduce((s, f) => s + f.size, 0);
    const results: FileAttachment[] = [];
    const errors: string[] = [];

    for (const file of selected) {
      const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        errors.push(`${file.name}: unsupported type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: exceeds 100KB`);
        continue;
      }
      const newTotal = currentTotal + results.reduce((s, f) => s + f.size, 0) + file.size;
      if (newTotal > MAX_TOTAL_SIZE) {
        errors.push('Total file size exceeds 500KB');
        break;
      }
      if (files.some((f) => f.name === file.name)) {
        errors.push(`${file.name}: already attached`);
        continue;
      }

      try {
        const content = ext === '.pdf'
          ? await extractPdfText(file)
          : await readFileAsText(file);
        results.push({ name: file.name, content, size: file.size });
      } catch (err) {
        errors.push(err instanceof Error ? err.message : `Failed to read ${file.name}`);
      }
    }

    if (results.length) setFiles((prev) => [...prev, ...results]);
    if (errors.length) {
      setFileError(errors.join('; '));
      setTimeout(() => setFileError(''), 5000);
    }
  }, [files]);

  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ── Handle submit ──
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isStreaming) return;

      // Unlock detection
      if (trimmed.toLowerCase() === 'unlock') {
        setUnlocked(true);
        setInput('');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
        return;
      }

      const userMessage: Message = { role: 'user', content: trimmed };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput('');
      setIsStreaming(true);

      // Add empty assistant message for streaming
      const assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages([...updatedMessages, assistantMessage]);

      try {
        // Send only user/assistant messages (skip welcome if it's the only prior message)
        const apiMessages = updatedMessages.filter(
          (_, i) => !(i === 0 && updatedMessages[i] === WELCOME_MESSAGE),
        );

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            unlocked,
            fileContext: files.length > 0
              ? files.map((f) => ({ name: f.name, content: f.content }))
              : undefined,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Request failed' }));
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: 'assistant',
              content: err.error || 'Something went wrong. Please try again.',
            };
            return copy;
          });
          setIsStreaming(false);
          return;
        }

        // Stream the response
        const reader = res.body?.getReader();
        if (!reader) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: 'assistant',
              content: 'No response received. Please try again.',
            };
            return copy;
          });
          setIsStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let accumulated = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          // Update the last message with accumulated text
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: 'assistant',
              content: accumulated,
            };
            return copy;
          });
        }
      } catch {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: 'Connection error. Please check your network and try again.',
          };
          return copy;
        });
      } finally {
        setIsStreaming(false);
        textareaRef.current?.focus();
      }
    },
    [input, isStreaming, messages, unlocked, files],
  );

  // Enter to submit (Shift+Enter for newline)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className="chat-container">
      {/* ── Header ── */}
      <header className="chat-header">
        <div className="chat-header-left">
          <Link href="/" className="chat-back-btn" aria-label="Back to tools">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </Link>
          <span className="chat-title">Brand Chat</span>
        </div>

        <span
          className={`chat-mode-pill ${
            unlocked ? 'chat-mode-pill--unlocked' : 'chat-mode-pill--locked'
          }`}
        >
          <span className="chat-mode-dot" />
          {unlocked ? 'Full Assistant' : 'Brand Resources'}
        </span>
      </header>

      {/* ── Unlock toast ── */}
      {showToast && (
        <div className="chat-unlock-toast">Full Assistant Mode Activated</div>
      )}

      {/* ── Messages ── */}
      <div className="chat-messages">
        <div className="chat-messages-inner">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-message chat-message--${msg.role}`}
            >
              <div className={`chat-bubble chat-bubble--${msg.role}`}>
                {msg.content}
                {/* Show typing indicator for empty streaming assistant message */}
                {msg.role === 'assistant' &&
                  msg.content === '' &&
                  isStreaming &&
                  i === messages.length - 1 && (
                    <div className="chat-typing" style={{ marginTop: 0, padding: 0, background: 'transparent', boxShadow: 'none' }}>
                      <span className="chat-typing-dot" />
                      <span className="chat-typing-dot" />
                      <span className="chat-typing-dot" />
                    </div>
                  )}
                {/* Copy button on assistant messages */}
                {msg.role === 'assistant' && msg.content && (
                  <button
                    className={`chat-copy-btn${copiedIdx === i ? ' chat-copy-btn--copied' : ''}`}
                    onClick={() => handleCopy(msg.content, i)}
                    aria-label={copiedIdx === i ? 'Copied' : 'Copy message'}
                  >
                    {copiedIdx === i ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <form className="chat-input-area" onSubmit={handleSubmit}>
        {/* File chips */}
        {files.length > 0 && (
          <div className="chat-files-bar">
            {files.map((f, i) => (
              <span key={f.name} className="chat-file-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="chat-file-chip-name">{f.name}</span>
                <span className="chat-file-chip-size">
                  {f.size < 1024 ? `${f.size}B` : `${Math.round(f.size / 1024)}KB`}
                </span>
                <button
                  type="button"
                  className="chat-file-chip-remove"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${f.name}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* File error */}
        {fileError && <div className="chat-file-error">{fileError}</div>}

        <div className="chat-input-inner">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(',')}
            multiple
            onChange={handleFileSelect}
            className="chat-file-input-hidden"
          />

          {/* Attach button */}
          <button
            type="button"
            className="chat-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || files.length >= MAX_FILES}
            aria-label="Attach files"
            title={`Attach files (${ALLOWED_EXTENSIONS.join(', ')})`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              unlocked
                ? 'Ask anything...'
                : 'Draft a social post, email, talking points...'
            }
            disabled={isStreaming}
            rows={1}
            aria-label="Chat message"
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
