'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchConversations,
  createConversation,
  fetchConversation,
  deleteConversation as apiDeleteConversation,
} from '@/lib/api';
import type { ConversationSummary, ConversationDetail } from '@/lib/api';

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchConversations(50);
      setConversations(data.conversations);
    } catch (err) {
      console.warn('[SBDC] Conversations: fetch failed —', err);
    }
  }, []);

  // Load conversation list on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const startNewConversation = useCallback(async (): Promise<string> => {
    try {
      const convo = await createConversation();
      console.log('[SBDC] Conversation created:', convo.id);
      setCurrentId(convo.id);
      await refresh();
      return convo.id;
    } catch (err) {
      console.error('[SBDC] Conversations: create failed —', err);
      return '';
    }
  }, [refresh]);

  const loadConversation = useCallback(async (id: string): Promise<ConversationDetail | null> => {
    setLoading(true);
    try {
      const convo = await fetchConversation(id);
      setCurrentId(id);
      return convo;
    } catch (err) {
      console.warn('[SBDC] Conversations: load failed —', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeConversation = useCallback(async (id: string) => {
    try {
      await apiDeleteConversation(id);
      if (currentId === id) {
        setCurrentId(null);
      }
      await refresh();
    } catch (err) {
      console.warn('[SBDC] Conversations: delete failed —', err);
    }
  }, [currentId, refresh]);

  const clearCurrent = useCallback(() => {
    setCurrentId(null);
  }, []);

  return {
    conversations,
    currentId,
    loading,
    refresh,
    startNewConversation,
    loadConversation,
    removeConversation,
    clearCurrent,
  };
}
