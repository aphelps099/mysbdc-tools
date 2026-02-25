'use client';

import { useState, useCallback, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import PromptLibrary from '@/components/prompts/PromptLibrary';
import PromptComposer from '@/components/prompts/PromptComposer';
import AIPolicyModal from '@/components/compliance/AIPolicyModal';
import EventsFeed from '@/components/events/EventsFeed';
import GuidedTour from '@/components/onboarding/GuidedTour';
import AboutMenu from '@/components/layout/AboutMenu';
import type { EventAction } from '@/components/events/EventsFeed';
import NeoserraPanel from '@/components/neoserra/NeoserraPanel';
import type { NeoserraAction } from '@/components/neoserra/NeoserraPanel';
import { useChat } from '@/hooks/useChat';
import { useConversations } from '@/hooks/useConversations';
import { useEvents } from '@/hooks/useEvents';
import { usePrompts } from '@/hooks/usePrompts';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import { getToken } from '@/lib/api';
import type { Prompt } from '@/lib/types';
import type { WorkflowMeta, EventItem } from '@/lib/api';

export default function ChatPage() {
  // ── Auth guard — redirect to /login if no token ──
  useEffect(() => {
    if (!getToken()) {
      window.location.href = '/login';
    }
  }, []);

  // ── Model selection ──
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');

  // ── Conversations ──
  const convos = useConversations();

  const {
    messages,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    clearMessages,
    loadMessages,
  } = useChat({ conversationId: convos.currentId, model: selectedModel });

  const { prompts } = usePrompts();
  const eventsData = useEvents();
  const backend = useBackendStatus();
  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false);
  const [aiPolicyOpen, setAIPolicyOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [neoserraOpen, setNeoserraOpen] = useState(false);
  const [composerPrompt, setComposerPrompt] = useState<Prompt | null>(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Show guided tour once for new users — desktop only (sidebar elements are hidden on mobile)
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('sbdc_tour_seen')) {
      if (window.innerWidth >= 768) {
        setTourOpen(true);
      }
    }
  }, []);

  const handleSend = useCallback(async (content: string) => {
    let convoId = convos.currentId;
    // Auto-create a conversation if there isn't one yet
    if (!convoId) {
      convoId = await convos.startNewConversation();
      if (!convoId) {
        // Fallback: send without persistence
        sendMessage(content);
        return;
      }
    }
    // Pass the convoId directly in case state hasn't updated yet
    // Await so we refresh the sidebar AFTER streaming completes
    await sendMessage(content, convoId);
    convos.refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convos.currentId, sendMessage]);

  const handleNewChat = useCallback(() => {
    clearMessages();
    convos.clearCurrent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearMessages]);

  const handleSelectConversation = useCallback(async (id: string) => {
    const convo = await convos.loadConversation(id);
    if (convo) {
      loadMessages(
        convo.messages.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.created_at),
          hasCompliance: m.has_compliance,
        }))
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMessages]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    await convos.removeConversation(id);
    // If we deleted the current conversation, clear the chat
    if (convos.currentId === id) {
      clearMessages();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convos.currentId, clearMessages]);

  // When a prompt is selected (from library or chip), open the composer
  const handleSelectPrompt = useCallback((prompt: Prompt) => {
    setPromptLibraryOpen(false);
    // If the prompt has template text with placeholders, open the composer
    if (prompt.prompt && prompt.prompt.trim()) {
      setComposerPrompt(prompt);
    } else {
      // No template — send the title/description as a message
      handleSend(`Help me with: ${prompt.title} — ${prompt.description}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSend]);

  // When a welcome chip is clicked, find the matching prompt and open composer
  const handleChipClick = useCallback((promptTitle: string) => {
    const match = prompts.find(
      (p) => p.title.toLowerCase() === promptTitle.toLowerCase()
    );
    if (match) {
      const mapped: Prompt = {
        id: match.id,
        title: match.title,
        category: match.category,
        categoryLabel: match.categoryLabel,
        description: match.description,
        tags: match.tags || [],
        prompt: match.prompt || '',
        isWorkflow: match.isWorkflow || false,
        workflowId: match.workflowId,
      };
      setComposerPrompt(mapped);
    } else {
      // Fallback: just send it as a chat message
      handleSend(promptTitle);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompts, handleSend]);

  // Composer sends a populated prompt to chat
  const handleComposerSend = (populatedPrompt: string) => {
    handleSend(populatedPrompt);
  };

  const handleSelectWorkflow = (workflow: WorkflowMeta) => {
    handleSend(`Start the "${workflow.name}" workflow — ${workflow.description}`);
  };

  const handleEventAction = useCallback((event: EventItem, action: EventAction) => {
    setEventsOpen(false);
    const details = [
      `Title: ${event.title}`,
      event.center ? `Center: ${event.center}` : '',
      event.date ? `Date: ${event.date}` : '',
      event.time ? `Time: ${event.time}` : '',
      event.summary ? `Description: ${event.summary}` : '',
      event.cost ? `Cost: ${event.cost}` : '',
      event.registration_url ? `Registration: ${event.registration_url}` : '',
    ].filter(Boolean).join('\n');

    if (action === 'promote') {
      handleSend(
        `Generate a promotional message for this SBDC event. Create engaging social media copy (for Facebook, LinkedIn, and email) that highlights the key benefits and includes a call to action with the registration link.\n\n${details}`
      );
    } else {
      handleSend(
        `Tell me more about this SBDC event. Summarize the key details and explain who would benefit most from attending.\n\n${details}`
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSend]);

  // Neoserra CRM — "Ask AI" sends record context to chat
  const handleNeoserraAction = useCallback((context: string, action: NeoserraAction) => {
    setNeoserraOpen(false);
    if (action === 'ask-ai') {
      handleSend(
        `I'm looking at this Neoserra CRM record. Help me understand and analyze it:\n\n${context}`
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell
      onClearChat={handleNewChat}
      onOpenAIPolicy={() => setAIPolicyOpen(true)}
      onSelectWorkflow={handleSelectWorkflow}
      onOpenPromptLibrary={() => setPromptLibraryOpen(true)}
      onOpenEvents={() => setEventsOpen(true)}
      onOpenNeoserra={() => setNeoserraOpen(true)}
      onOpenAbout={() => setAboutOpen(true)}
      conversations={convos.conversations}
      currentConversationId={convos.currentId}
      onSelectConversation={handleSelectConversation}
      onDeleteConversation={handleDeleteConversation}
    >
      <div className="flex flex-col h-full" data-tour="chat-window">
        <ChatWindow
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          onChipClick={handleChipClick}
        />

        {/* Backend connection error */}
        {backend.status === 'error' && (
          <div className="mx-4 mb-2 px-4 py-3 rounded-[var(--radius-md)] bg-red-50 border border-red-200">
            <p className="text-[14px] font-semibold text-red-700 mb-1">
              Backend unreachable
            </p>
            <p className="text-[13px] text-red-600">
              {backend.errorDetail}
            </p>
          </div>
        )}

        {/* Chat error banner */}
        {error && (
          <div className="mx-4 mb-2 px-4 py-2 rounded-[var(--radius-md)] bg-red-50 border border-red-200">
            <p className="text-[14px] text-red-700">
              {error}
            </p>
          </div>
        )}

        <ChatInput
          onSend={handleSend}
          onOpenPromptLibrary={() => setPromptLibraryOpen(true)}
          disabled={isStreaming}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      <PromptLibrary
        open={promptLibraryOpen}
        onClose={() => setPromptLibraryOpen(false)}
        onSelectPrompt={handleSelectPrompt}
      />

      <PromptComposer
        open={!!composerPrompt}
        prompt={composerPrompt}
        onClose={() => setComposerPrompt(null)}
        onSend={handleComposerSend}
      />

      <AIPolicyModal
        open={aiPolicyOpen}
        onClose={() => setAIPolicyOpen(false)}
      />

      <EventsFeed
        open={eventsOpen}
        onClose={() => setEventsOpen(false)}
        onEventAction={handleEventAction}
        events={eventsData.events}
        page={eventsData.page}
        totalPages={eventsData.totalPages}
        total={eventsData.total}
        loading={eventsData.loading}
        error={eventsData.error}
        onPageChange={eventsData.goToPage}
      />

      <GuidedTour
        open={tourOpen}
        onClose={() => {
          localStorage.setItem('sbdc_tour_seen', 'true');
          setTourOpen(false);
        }}
      />

      <AboutMenu
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      <NeoserraPanel
        open={neoserraOpen}
        onClose={() => setNeoserraOpen(false)}
        onAction={handleNeoserraAction}
      />
    </AppShell>
  );
}
