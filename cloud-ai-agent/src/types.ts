export type Role = 'user' | 'assistant' | 'system';

export type AIProvider = 'gemini' | 'anthropic';

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data: string; // base64 string without data:mime;base64 prefix
  previewUrl?: string;
  type: 'image' | 'text' | 'code' | 'other';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  thought?: string;
  attachments?: Attachment[];
  sources?: GroundingSource[];
  createdAt: number;
  modelUsed?: string;
  providerUsed?: AIProvider;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  pinned?: boolean;
  modelId: string;
  personaId: string;
  workspaceId?: string;
  systemInstruction?: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  displayName: string;
  provider: AIProvider;
  badge: string;
  description: string;
  isFree: boolean;
  supportsSearch: boolean;
  supportsThinking: boolean;
}

export interface AgentPersona {
  id: string;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
  starterPrompts: string[];
}

export interface AppSettings {
  anthropicApiKey: string;
  geminiCustomApiKey: string;
  temperature: number;
  theme: 'dark' | 'light' | 'system';
  speechVoice?: string;
  autoScroll: boolean;
  assistantNickname?: string;
  customInstructions?: string;
}
