/** Shared TypeScript interfaces */

export interface MessageAction {
  label: string;
  action: 'send' | 'command';
  value: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasCompliance?: boolean;
  model?: string;
  actions?: MessageAction[];
}

/** Inline prompt body element types for the mad-libs editor */
export type PromptBodyElement =
  | { t: 'text'; c: string }
  | { t: 'label'; c: string }
  | { t: 'token'; id: string; label: string; ph: string; tip: string }
  | { t: 'pills'; id: string; label: string; opts: string[]; custom?: boolean; tip: string }
  | { t: 'block'; id: string; label: string; ph: string; tip: string; opt?: boolean }
  | { t: 'upload'; id: string; label: string; accept: string; hint: string }
  | { t: 'or' }
  | { t: 'multi'; id: string; label: string; ph: string; max: number; tip: string };

export interface Prompt {
  id: number;
  title: string;
  category: string;
  categoryLabel: string;
  description: string;
  tags: string[];
  prompt: string;
  isWorkflow?: boolean;
  workflowId?: string;
  body?: PromptBodyElement[];
}

export interface PromptCategory {
  id: string;
  label: string;
  count: number;
}

export interface PromptLibraryData {
  prompts: Prompt[];
  categories: PromptCategory[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  instruction: string;
}

export interface Usage {
  input_tokens: number;
  output_tokens: number;
}

export interface ChatRequest {
  message: string;
  conversation_history: { role: string; content: string }[];
  use_rag: boolean;
  model?: string;
  workflow_id?: string;
}
