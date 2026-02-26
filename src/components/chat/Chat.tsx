'use client';

import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent } from 'react';
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

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content:
    "I'm your NorCal SBDC brand assistant. I can help you draft social posts, email copy, newsletter content, success stories, talking points, and more.\n\nWhat would you like to create?",
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    [input, isStreaming, messages, unlocked],
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
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <form className="chat-input-area" onSubmit={handleSubmit}>
        <div className="chat-input-inner">
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
