export interface ToolConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export type BodyElement =
  | { type: 'text'; content: string }
  | { type: 'label'; content: string }
  | { type: 'static'; content: string }
  | { type: 'br' }
  | { type: 'token'; id: string; label: string; placeholder?: string; tip?: string }
  | { type: 'pills'; id: string; label: string; options: string[]; allowCustom?: boolean; tip?: string }
  | { type: 'block'; id: string; label: string; placeholder?: string; tip?: string }
  | { type: 'upload'; id: string; label: string; accept?: string; tip?: string }
  | { type: 'multi'; id: string; label: string; placeholder?: string; max?: number; tip?: string }
  | { type: 'or' };

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  tag: string;
  tagColor: string;
  version: string;
  config: ToolConfig;
  body: BodyElement[];
}

export interface CategoryInfo {
  id: string;
  label: string;
  color: string;
}
