'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

import { streamChat } from '@/lib/api';
import type { Message, MessageAction } from '@/lib/types';

interface UseChatOptions {
  conversationId?: string | null;
  model?: string;
  workflowId?: string | null;
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [hasCompliance, setHasCompliance] = useState(false);
  const [error, setError] = useState('');
  const streamingRef = useRef('');

  // Keep a ref to the latest conversationId so sendMessage always has it
  const convoIdRef = useRef(options.conversationId);
  useEffect(() => {
    convoIdRef.current = options.conversationId;
  }, [options.conversationId]);

  /**
   * Send a message. Optional overrideConvoId lets the caller pass a
   * freshly-created conversation ID that hasn't flowed through state yet.
   */
  const sendMessage = useCallback(async (content: string, overrideConvoId?: string) => {
    setError('');
    setHasCompliance(false);

    const activeConvoId = overrideConvoId || convoIdRef.current || undefined;

    // Add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Build conversation history from current messages + the new user msg
    const currentMessages = [...messages, userMsg];
    const history = currentMessages.map((m) => ({ role: m.role, content: m.content }));

    // Start streaming
    setIsStreaming(true);
    setStreamingContent('');
    streamingRef.current = '';

    let complianceNeeded = false;
    let pendingActions: MessageAction[] | undefined;

    try {
      await streamChat(content, history, {
        onToken: (text) => {
          streamingRef.current += text;
          setStreamingContent(streamingRef.current);
        },
        onDone: (usage, responseModel) => {
          const finalContent = streamingRef.current;
          const assistantMsg: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: finalContent,
            timestamp: new Date(),
            hasCompliance: complianceNeeded,
            model: responseModel,
            actions: pendingActions,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setStreamingContent('');
          setIsStreaming(false);
        },
        onCompliance: () => {
          complianceNeeded = true;
          setHasCompliance(true);
        },
        onActions: (actions) => {
          pendingActions = actions;
        },
        onError: (message) => {
          setError(message);
          setStreamingContent('');
          setIsStreaming(false);
        },
      }, {
        conversationId: activeConvoId,
        model: options.model || undefined,
        workflowId: options.workflowId || undefined,
      });
    } catch {
      setError('Connection failed. Is the backend running?');
      setStreamingContent('');
      setIsStreaming(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    setIsStreaming(false);
    setHasCompliance(false);
    setError('');
  }, []);

  const loadMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
    setStreamingContent('');
    setIsStreaming(false);
    setHasCompliance(false);
    setError('');
  }, []);

  return {
    messages,
    isStreaming,
    streamingContent,
    hasCompliance,
    error,
    sendMessage,
    clearMessages,
    loadMessages,
  };
}
