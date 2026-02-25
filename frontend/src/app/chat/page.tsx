'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import PreviewAppShell from '@/components/layout/PreviewAppShell';
import PreviewChatWindow from '@/components/chat/PreviewChatWindow';
import PreviewInput from '@/components/preview/PreviewInput';
import PromptLibrary from '@/components/prompts/PromptLibrary';
import PromptComposer from '@/components/prompts/PromptComposer';
import AIPolicyModal from '@/components/compliance/AIPolicyModal';
import AIPolicyGate from '@/components/compliance/AIPolicyGate';
import EventsFeed from '@/components/events/EventsFeed';
import PreviewAboutDrawer from '@/components/preview/PreviewAboutDrawer';
import { ThemeProvider } from '@/context/ThemeContext';
import type { EventAction } from '@/components/events/EventsFeed';
import NeoserraPanel from '@/components/neoserra/NeoserraPanel';
import type { NeoserraAction } from '@/components/neoserra/NeoserraPanel';
import ToolEngine from '@/tools/engine/ToolEngine';
import Modal from '@/components/ui/Modal';
import { getToolById } from '@/tools/tool-registry';
import type { ToolDefinition } from '@/tools/types';
import { useChat } from '@/hooks/useChat';
import { useConversations } from '@/hooks/useConversations';
import { useEvents } from '@/hooks/useEvents';
import { usePrompts } from '@/hooks/usePrompts';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import { getToken } from '@/lib/api';
import type { Prompt, MessageAction } from '@/lib/types';
import type { EventItem } from '@/lib/api';

export default function ChatPage() {
  // ── Auth guard ──
  useEffect(() => {
    if (!getToken()) {
      window.location.href = '/login';
    }
  }, []);

  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const uploadTriggerRef = useRef<(() => void) | null>(null);
  const convos = useConversations();

  const {
    messages,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    clearMessages,
    loadMessages,
  } = useChat({ conversationId: convos.currentId, model: selectedModel, workflowId: activeWorkflowId });

  const { prompts } = usePrompts();
  const eventsData = useEvents();
  const backend = useBackendStatus();
  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false);
  const [aiPolicyOpen, setAIPolicyOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [neoserraOpen, setNeoserraOpen] = useState(false);
  const [composerPrompt, setComposerPrompt] = useState<Prompt | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);

  const handleSend = useCallback(async (content: string) => {
    let convoId = convos.currentId;
    if (!convoId) {
      convoId = await convos.startNewConversation();
      if (!convoId) {
        sendMessage(content);
        return;
      }
    }
    await sendMessage(content, convoId);
    convos.refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convos.currentId, sendMessage]);

  const handleNewChat = useCallback(() => {
    clearMessages();
    convos.clearCurrent();
    setActiveWorkflowId(null);
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
          actions: m.metadata?.actions,
        }))
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMessages]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    await convos.removeConversation(id);
    if (convos.currentId === id) {
      clearMessages();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convos.currentId, clearMessages]);

  const handleSelectPrompt = useCallback((prompt: Prompt) => {
    setPromptLibraryOpen(false);
    // Start a workflow
    if (prompt.isWorkflow && prompt.workflowId) {
      setActiveWorkflowId(prompt.workflowId);
      handleSend('start');
      return;
    }
    if ((prompt.prompt && prompt.prompt.trim()) || (prompt.body && prompt.body.length > 0)) {
      setComposerPrompt(prompt);
    } else {
      handleSend(`Help me with: ${prompt.title} — ${prompt.description}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSend]);

  const handleChipClick = useCallback((promptTitle: string) => {
    const match = prompts.find(
      (p) => p.title.toLowerCase() === promptTitle.toLowerCase()
    );
    if (match) {
      setComposerPrompt({
        id: match.id,
        title: match.title,
        category: match.category,
        categoryLabel: match.categoryLabel,
        description: match.description,
        tags: match.tags || [],
        prompt: match.prompt || '',
        isWorkflow: match.isWorkflow || false,
        workflowId: match.workflowId,
        ...(match.body ? { body: match.body } : {}),
      });
    } else {
      handleSend(promptTitle);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompts, handleSend]);

  const handleComposerSend = (populatedPrompt: string) => {
    handleSend(populatedPrompt);
  };

  const handleToolClick = useCallback((toolId: string) => {
    const tool = getToolById(toolId);
    if (tool) {
      setActiveTool(tool);
    }
  }, []);

  const handleToolSend = useCallback((compiledPrompt: string) => {
    handleSend(compiledPrompt);
    setTimeout(() => setActiveTool(null), 600);
  }, [handleSend]);

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
      handleSend(`Generate a promotional message for this SBDC event. Create engaging social media copy (for Facebook, LinkedIn, and email) that highlights the key benefits and includes a call to action with the registration link.\n\n${details}`);
    } else {
      handleSend(`Tell me more about this SBDC event. Summarize the key details and explain who would benefit most from attending.\n\n${details}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSend]);

  const handleActionClick = useCallback((action: MessageAction) => {
    if (action.action === 'command' && action.value === 'quit') {
      setActiveWorkflowId(null);
    }
    handleSend(action.value);
  }, [handleSend]);

  const handleNeoserraAction = useCallback((context: string, action: NeoserraAction) => {
    setNeoserraOpen(false);
    if (action === 'ask-ai') {
      handleSend(`I'm looking at this Neoserra CRM record. Help me understand and analyze it:\n\n${context}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider>
    <AIPolicyGate>
    <PreviewAppShell
      onClearChat={handleNewChat}
      onOpenPromptLibrary={() => setPromptLibraryOpen(true)}
      onOpenUpload={() => uploadTriggerRef.current?.()}
      onOpenEvents={() => setEventsOpen(true)}
      onOpenNeoserra={() => setNeoserraOpen(true)}
      onOpenAbout={() => setAboutOpen(true)}
      conversations={convos.conversations}
      currentConversationId={convos.currentId}
      onSelectConversation={handleSelectConversation}
      onDeleteConversation={handleDeleteConversation}
      selectedModel={selectedModel}
      onModelChange={setSelectedModel}
    >
      <div className="flex flex-col h-full relative">
        <PreviewChatWindow
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          onChipClick={handleChipClick}
          onToolClick={handleToolClick}
          onOpenPolicy={() => setAIPolicyOpen(true)}
          onActionClick={handleActionClick}
        />

        {/* Backend error */}
        {backend.status === 'error' && (
          <div className="mx-8 mb-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
            <p className="text-[13px] font-bold" style={{ color: '#dc2626' }}>Backend unreachable</p>
            <p className="text-[12px]" style={{ color: '#dc2626' }}>{backend.errorDetail}</p>
          </div>
        )}

        {error && (
          <div className="mx-8 mb-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
            <p className="text-[13px]" style={{ color: '#dc2626' }}>{error}</p>
          </div>
        )}

        <PreviewInput
          onSend={handleSend}
          onOpenPromptLibrary={() => setPromptLibraryOpen(true)}
          onOpenEvents={() => setEventsOpen(true)}
          onOpenNeoserra={() => setNeoserraOpen(true)}
          disabled={isStreaming}
          uploadTriggerRef={uploadTriggerRef}
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

      {/* Tool Engine Modal — homescreen buttons open templates here */}
      <Modal
        open={!!activeTool}
        onClose={() => setActiveTool(null)}
        size="full"
      >
        {activeTool && (
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <ToolEngine
              definition={activeTool}
              onSend={handleToolSend}
              onBack={() => setActiveTool(null)}
              backLabel="Close"
            />
          </div>
        )}
      </Modal>

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

      <PreviewAboutDrawer
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      <NeoserraPanel
        open={neoserraOpen}
        onClose={() => setNeoserraOpen(false)}
        onAction={handleNeoserraAction}
      />
    </PreviewAppShell>
    </AIPolicyGate>
    </ThemeProvider>
  );
}
