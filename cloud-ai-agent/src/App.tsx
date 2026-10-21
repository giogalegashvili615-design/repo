/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { WorkspaceModal } from './components/WorkspaceModal';
import { AGENT_PERSONAS, AVAILABLE_MODELS } from './constants/models';
import { streamChat } from './services/chatService';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import {
  AgentPersona,
  AppSettings,
  Attachment,
  ChatSession,
  Message,
  ModelConfig,
  Workspace,
} from './types';

const STORAGE_KEY_CHATS = 'cloud_ai_chats_v2';
const STORAGE_KEY_SETTINGS = 'cloud_ai_settings_v2';
const STORAGE_KEY_WORKSPACES = 'cloud_ai_workspaces_v2';

export default function App() {
  // App Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      anthropicApiKey: '',
      geminiCustomApiKey: '',
      temperature: 0.7,
      theme: 'dark',
      autoScroll: true,
      assistantNickname: 'Coucou',
    };
  });

  // Workspaces
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKSPACES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      { id: 'ws-1', name: 'Personal' },
      { id: 'ws-2', name: 'Work' },
    ];
  });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // Chats list matching screenshot seed
  const [chats, setChats] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }

    // Seed matching user screenshot
    const seedChat1: ChatSession = {
      id: 'chat-seed-1',
      title: '2+2',
      createdAt: Date.now() - 1000 * 60 * 15,
      updatedAt: Date.now() - 1000 * 60 * 15,
      modelId: 'gemini-3.8-flash',
      personaId: 'general',
      messages: [
        {
          id: 'msg-u1',
          role: 'user',
          content: 'tell me the top 5 places to visit in Paris',
          createdAt: Date.now() - 1000 * 60 * 14,
        },
        {
          id: 'msg-a1',
          role: 'assistant',
          content: `1. **Eiffel Tower (*Tour Eiffel*):**
* Built by Gustave Eiffel for the 1889 World's Fair, this 330-meter wrought-iron lattice tower is the most iconic symbol of Paris.

2. **The Louvre Museum (*Musée du Louvre*):**
* The world's most-visited art museum and a historic palace, home to famous masterpieces such as Leonardo da Vinci's **Mona Lisa** and the ancient Greek sculpture **Venus de Milo**.

3. **Notre-Dame Cathedral (*Notre-Dame de Paris*):**
* A masterwork of French Gothic architecture located on the Île de la Cité, famous for its rose windows, flying buttresses, and bells.

4. **Champs-Élysées & Arc de Triomphe:**
* One of the most famous avenues in the world, leading up to Napoleon's triumphal arch honoring French military victories.

5. **Montmartre & Sacré-Cœur Basilica:**
* A historic hilltop district known for its artistic heritage (home to Picasso, Van Gogh, and Dalí in their time), cobblestone streets, and the white-domed Basilica with panoramic views of the city.

---

Would you like travel recommendations, historical background, or information on a specific topic about Paris?`,
          createdAt: Date.now() - 1000 * 60 * 13,
          modelUsed: 'gemini-flash-latest',
        },
      ],
    };

    const seedChat2: ChatSession = {
      id: 'chat-seed-2',
      title: 'gio',
      createdAt: Date.now() - 1000 * 60 * 60,
      updatedAt: Date.now() - 1000 * 60 * 60,
      modelId: 'gemini-3.8-flash',
      personaId: 'general',
      messages: [
        {
          id: 'msg-u2',
          role: 'user',
          content: 'Hello gio',
          createdAt: Date.now() - 1000 * 60 * 59,
        },
        {
          id: 'msg-a2',
          role: 'assistant',
          content: 'Hello! How can I assist you today?',
          createdAt: Date.now() - 1000 * 60 * 58,
          modelUsed: 'gemini-flash-latest',
        },
      ],
    };

    return [seedChat1, seedChat2];
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => chats[0]?.id || '');
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(() => AVAILABLE_MODELS[0]);
  const [activePersona, setActivePersona] = useState<AgentPersona>(() => AGENT_PERSONAS[0]);
  const [enableSearch, setEnableSearch] = useState<boolean>(false);
  const [enableThinking, setEnableThinking] = useState<boolean>(false);

  // Modals & Sidebar UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Streaming State
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech TTS
  const { isPlaying, activeMessageId, voices, speak, stop } = useSpeechSynthesis();

  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const isLightMode =
    settings.theme === 'light' ||
    (settings.theme === 'system' && !systemPrefersDark);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isLightMode) {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    }
  }, [isLightMode]);

  const handleToggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: isLightMode ? 'dark' : 'light',
    }));
  }, [isLightMode]);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
    } catch (e) {
      console.warn('Failed to save chats:', e);
    }
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(workspaces));
    } catch (e) {
      console.warn('Failed to save workspaces:', e);
    }
  }, [workspaces]);

  // Filter chats by workspace if selected
  const displayedChats = activeWorkspaceId
    ? chats.filter((c) => c.workspaceId === activeWorkspaceId)
    : chats;

  const activeChat =
    displayedChats.find((c) => c.id === activeChatId) ||
    displayedChats[0] ||
    chats[0];

  // Auto-scroll
  useEffect(() => {
    if (settings.autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages, isStreaming, settings.autoScroll]);

  // Shortcut Ctrl+K / Cmd+K for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Create new chat
  const handleNewChat = useCallback(() => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }

    const newChat: ChatSession = {
      id: Math.random().toString(36).substring(7),
      title: 'New chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelId: selectedModel.id,
      personaId: activePersona.id,
      workspaceId: activeWorkspaceId || undefined,
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, [isStreaming, selectedModel.id, activePersona.id, activeWorkspaceId]);

  // Delete chat
  const handleDeleteChat = useCallback(
    (id: string) => {
      setChats((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (filtered.length === 0) {
          const fresh: ChatSession = {
            id: Math.random().toString(36).substring(7),
            title: 'New chat',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
            modelId: selectedModel.id,
            personaId: activePersona.id,
            workspaceId: activeWorkspaceId || undefined,
          };
          setActiveChatId(fresh.id);
          return [fresh];
        }
        if (activeChatId === id) {
          setActiveChatId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeChatId, selectedModel.id, activePersona.id, activeWorkspaceId]
  );

  const handleTogglePin = useCallback((id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  }, []);

  const handleRenameChat = useCallback((id: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  }, []);

  // Workspace actions
  const handleCreateWorkspace = useCallback((name: string) => {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspaceId(newWs.id);
  }, []);

  const handleDeleteWorkspace = useCallback(
    (id: string) => {
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      if (activeWorkspaceId === id) {
        setActiveWorkspaceId(null);
      }
    },
    [activeWorkspaceId]
  );

  // Stop streaming
  const handleStopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChatId) return c;
        const lastMsg = c.messages[c.messages.length - 1];
        if (lastMsg && lastMsg.isStreaming) {
          const updated = [...c.messages];
          updated[updated.length - 1] = {
            ...lastMsg,
            isStreaming: false,
          };
          return { ...c, messages: updated };
        }
        return c;
      })
    );
  }, [activeChatId]);

  // Core stream orchestrator
  const executeGeneration = useCallback(
    async (messagesToSend: Message[], chatId: string) => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      setIsStreaming(true);

      const assistantMessageId = Math.random().toString(36).substring(7);

      const initialAssistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        modelUsed: selectedModel.name,
        providerUsed: selectedModel.provider,
        isStreaming: true,
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            updatedAt: Date.now(),
            messages: [...c.messages, initialAssistantMessage],
          };
        })
      );

      const apiKeyToUse =
        selectedModel.provider === 'anthropic'
          ? settings.anthropicApiKey
          : settings.geminiCustomApiKey;

      await streamChat({
        messages: messagesToSend,
        provider: selectedModel.provider,
        model: selectedModel.id,
        systemInstruction: activePersona.systemPrompt,
        enableSearch: selectedModel.supportsSearch ? enableSearch : false,
        enableThinking: selectedModel.supportsThinking ? enableThinking : false,
        apiKey: apiKeyToUse,
        signal: abortController.signal,
        onDelta: (textChunk) => {
          setChats((prev) =>
            prev.map((c) => {
              if (c.id !== chatId) return c;
              const msgs = [...c.messages];
              const idx = msgs.findIndex((m) => m.id === assistantMessageId);
              if (idx !== -1) {
                msgs[idx] = {
                  ...msgs[idx],
                  content: msgs[idx].content + textChunk,
                };
              }
              return { ...c, messages: msgs };
            })
          );
        },
        onThought: (thoughtChunk) => {
          setChats((prev) =>
            prev.map((c) => {
              if (c.id !== chatId) return c;
              const msgs = [...c.messages];
              const idx = msgs.findIndex((m) => m.id === assistantMessageId);
              if (idx !== -1) {
                msgs[idx] = {
                  ...msgs[idx],
                  thought: (msgs[idx].thought || '') + thoughtChunk,
                };
              }
              return { ...c, messages: msgs };
            })
          );
        },
        onSources: (sources) => {
          setChats((prev) =>
            prev.map((c) => {
              if (c.id !== chatId) return c;
              const msgs = [...c.messages];
              const idx = msgs.findIndex((m) => m.id === assistantMessageId);
              if (idx !== -1) {
                msgs[idx] = {
                  ...msgs[idx],
                  sources,
                };
              }
              return { ...c, messages: msgs };
            })
          );
        },
        onDone: () => {
          setIsStreaming(false);
          abortControllerRef.current = null;
          setChats((prev) =>
            prev.map((c) => {
              if (c.id !== chatId) return c;
              const msgs = [...c.messages];
              const idx = msgs.findIndex((m) => m.id === assistantMessageId);
              if (idx !== -1) {
                msgs[idx] = {
                  ...msgs[idx],
                  isStreaming: false,
                };
              }
              return { ...c, messages: msgs };
            })
          );
        },
        onError: (err) => {
          setIsStreaming(false);
          abortControllerRef.current = null;
          setChats((prev) =>
            prev.map((c) => {
              if (c.id !== chatId) return c;
              const msgs = [...c.messages];
              const idx = msgs.findIndex((m) => m.id === assistantMessageId);
              if (idx !== -1) {
                let friendly = err.message || 'The model is temporarily busy. Please try again.';
                try {
                  const parsed = JSON.parse(err.message);
                  friendly = parsed.error?.message || parsed.message || friendly;
                } catch {
                  // raw
                }
                msgs[idx] = {
                  ...msgs[idx],
                  content:
                    msgs[idx].content.trim()
                      ? `${msgs[idx].content}\n\n*Notice: ${friendly}*`
                      : `*Temporary issue: ${friendly}. Please click "Regenerate" below to retry.*`,
                  isStreaming: false,
                };
              }
              return { ...c, messages: msgs };
            })
          );
        },
      });
    },
    [
      selectedModel,
      activePersona,
      enableSearch,
      enableThinking,
      settings.anthropicApiKey,
      settings.geminiCustomApiKey,
    ]
  );

  // Send message
  const handleSendMessage = useCallback(
    (content: string, attachments: Attachment[]) => {
      if (!activeChat) return;

      const userMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'user',
        content,
        attachments: attachments.length > 0 ? attachments : undefined,
        createdAt: Date.now(),
      };

      const isFirst = activeChat.messages.length === 0;
      let newTitle = activeChat.title;
      if (isFirst && content) {
        newTitle = content.slice(0, 30) + (content.length > 30 ? '...' : '');
      }

      const updatedMessages = [...activeChat.messages, userMessage];

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChat.id) return c;
          return {
            ...c,
            title: newTitle,
            updatedAt: Date.now(),
            messages: updatedMessages,
          };
        })
      );

      executeGeneration(updatedMessages, activeChat.id);
    },
    [activeChat, executeGeneration]
  );

  // Regenerate last assistant response
  const handleRegenerate = useCallback(() => {
    if (!activeChat || activeChat.messages.length === 0) return;

    const messages = [...activeChat.messages];
    if (messages[messages.length - 1].role === 'assistant') {
      messages.pop();
    }

    setChats((prev) =>
      prev.map((c) => (c.id === activeChat.id ? { ...c, messages } : c))
    );

    executeGeneration(messages, activeChat.id);
  }, [activeChat, executeGeneration]);

  const handleClearAllChats = useCallback(() => {
    const fresh: ChatSession = {
      id: Math.random().toString(36).substring(7),
      title: 'New chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelId: selectedModel.id,
      personaId: activePersona.id,
      workspaceId: activeWorkspaceId || undefined,
    };
    setChats([fresh]);
    setActiveChatId(fresh.id);
  }, [selectedModel.id, activePersona.id, activeWorkspaceId]);

  const activeWorkspaceName =
    workspaces.find((w) => w.id === activeWorkspaceId)?.name || null;

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden antialiased transition-colors duration-200 ${
        isLightMode
          ? 'bg-white text-zinc-900 selection:bg-blue-500/20 selection:text-blue-900'
          : 'bg-[#1a1a1c] text-zinc-100 selection:bg-blue-600/30 selection:text-blue-200'
      }`}
    >
      {/* Sidebar matching screenshot */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={displayedChats}
        activeChatId={activeChat?.id || null}
        onSelectChat={(id) => setActiveChatId(id)}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onTogglePin={handleTogglePin}
        onRenameChat={handleRenameChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWorkspaces={() => setIsWorkspaceModalOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        activeWorkspaceName={activeWorkspaceName}
        isLightMode={isLightMode}
      />

      {/* Main chat column */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden min-w-0 transition-colors duration-200 ${
          isLightMode ? 'bg-white' : 'bg-[#1a1a1c]'
        }`}
      >
        {/* Header with Cloud AI · gemini-flash-latest and top center Coucou pill */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          selectedModel={selectedModel}
          onSelectModel={(model) => setSelectedModel(model)}
          activePersona={activePersona}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isLightMode={isLightMode}
          onToggleTheme={handleToggleTheme}
        />

        {/* Message Thread */}
        <main className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {!activeChat || activeChat.messages.length === 0 ? (
            <EmptyState
              selectedModel={selectedModel}
              activePersona={activePersona}
              onSelectPrompt={(prompt) => handleSendMessage(prompt, [])}
              isLightMode={isLightMode}
            />
          ) : (
            <div className="flex-1 py-4">
              {activeChat.messages.map((message, idx) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isLatestAssistant={
                    message.role === 'assistant' &&
                    idx === activeChat.messages.length - 1
                  }
                  onRegenerate={handleRegenerate}
                  isSpeaking={isPlaying && activeMessageId === message.id}
                  onSpeak={(text, id) => speak(text, id, settings.speechVoice)}
                  onStopSpeak={stop}
                  isLightMode={isLightMode}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </main>

        {/* Bottom Input Area matching screenshot */}
        <footer className="w-full flex-shrink-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            onStopStreaming={handleStopStreaming}
            onRegenerate={handleRegenerate}
            canRegenerate={Boolean(activeChat && activeChat.messages.length > 0)}
            selectedModel={selectedModel}
            enableSearch={enableSearch}
            onToggleSearch={() => setEnableSearch(!enableSearch)}
            enableThinking={enableThinking}
            onToggleThinking={() => setEnableThinking(!enableThinking)}
            isLightMode={isLightMode}
          />
        </footer>
      </div>

      {/* Settings Modal (ChatGPT style) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        activePersona={activePersona}
        onSelectPersona={(persona) => setActivePersona(persona)}
        voices={voices}
        onClearAllChats={handleClearAllChats}
        isLightMode={isLightMode}
      />

      {/* Export Modal */}
      {activeChat && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          chat={activeChat}
          isLightMode={isLightMode}
        />
      )}

      {/* Workspace Switcher Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={(id) => setActiveWorkspaceId(id)}
        onCreateWorkspace={handleCreateWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        isLightMode={isLightMode}
      />
    </div>
  );
}
