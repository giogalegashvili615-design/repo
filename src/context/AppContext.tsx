import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { ViewName, ThemeMode, Conversation, Message } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { BACKGROUNDS, DEFAULT_BACKGROUND } from '../lib/backgrounds'
import { sendChatMessage, isDemoMode } from '../lib/ai'

interface AppContextValue {
  view: ViewName
  setView: (v: ViewName) => void
  theme: ThemeMode
  toggleTheme: () => void
  backgroundId: string
  setBackgroundId: (id: string) => void
  conversations: Conversation[]
  currentConversationId: string | null
  setCurrentConversationId: (id: string | null) => void
  currentConversation: Conversation | null
  isGenerating: boolean
  sendMessage: (text: string) => Promise<void>
  newConversation: () => void
  deleteConversation: (id: string) => void
  clearCurrentConversation: () => void
  regenerateLastResponse: () => Promise<void>
  demoMode: boolean
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewName>('home')
  const [theme, setTheme] = useLocalStorage<ThemeMode>('cloudai-theme', 'dark')
  const [backgroundId, setBackgroundId] = useLocalStorage<string>('cloudai-bg', DEFAULT_BACKGROUND.id)
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('cloudai-conversations', [])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleTheme = useCallback(() => {
    setTheme((p) => (p === 'dark' ? 'light' : 'dark'))
  }, [setTheme])

  const currentConversation = conversations.find((c) => c.id === currentConversationId) || null

  const newConversation = useCallback(() => {
    setCurrentConversationId(null)
    setView('chat')
    setSidebarOpen(false)
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isGenerating) return

      // Ensure we have a conversation
      let convId = currentConversationId
      let convMessages: Message[] = []

      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }

      if (!convId) {
        convId = uid()
        convMessages = [userMsg]
        const newConv: Conversation = {
          id: convId,
          title: text.slice(0, 50),
          messages: convMessages,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        setConversations((prev) => [newConv, ...prev])
        setCurrentConversationId(convId)
      } else {
        const existing = conversations.find((c) => c.id === convId)
        convMessages = [...(existing?.messages || []), userMsg]
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, userMsg], updatedAt: Date.now() }
              : c,
          ),
        )
      }

      setIsGenerating(true)

      try {
        const apiMessages = convMessages.map((m) => ({ role: m.role, content: m.content }))
        const res = await sendChatMessage(apiMessages)

        const aiMsg: Message = {
          id: uid(),
          role: 'assistant',
          content: res.content,
          timestamp: Date.now(),
          isDemo: res.isDemo,
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, aiMsg], updatedAt: Date.now() }
              : c,
          ),
        )
      } catch (err) {
        const errMsg: Message = {
          id: uid(),
          role: 'assistant',
          content: `⚠️ **Error:** ${err instanceof Error ? err.message : 'Something went wrong'}. Please try again.`,
          timestamp: Date.now(),
        }
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, errMsg], updatedAt: Date.now() }
              : c,
          ),
        )
      } finally {
        setIsGenerating(false)
      }
    },
    [currentConversationId, conversations, isGenerating, setConversations],
  )

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (currentConversationId === id) setCurrentConversationId(null)
    },
    [currentConversationId, setConversations],
  )

  const clearCurrentConversation = useCallback(() => {
    if (!currentConversationId) return
    setConversations((prev) => prev.filter((c) => c.id !== currentConversationId))
    setCurrentConversationId(null)
  }, [currentConversationId, setConversations])

  const regenerateLastResponse = useCallback(async () => {
    if (!currentConversation || isGenerating) return
    const msgs = currentConversation.messages
    // Find last user message
    let lastUserIdx = -1
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIdx = i
        break
      }
    }
    if (lastUserIdx === -1) return

    // Remove messages after the last user message
    const keptMessages = msgs.slice(0, lastUserIdx + 1)
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversation.id
          ? { ...c, messages: keptMessages, updatedAt: Date.now() }
          : c,
      ),
    )

    setIsGenerating(true)
    try {
      const apiMessages = keptMessages.map((m) => ({ role: m.role, content: m.content }))
      const res = await sendChatMessage(apiMessages)
      const aiMsg: Message = {
        id: uid(),
        role: 'assistant',
        content: res.content,
        timestamp: Date.now(),
        isDemo: res.isDemo,
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversation.id
            ? { ...c, messages: [...keptMessages, aiMsg], updatedAt: Date.now() }
            : c,
        ),
      )
    } catch (err) {
      const errMsg: Message = {
        id: uid(),
        role: 'assistant',
        content: `⚠️ **Error:** ${err instanceof Error ? err.message : 'Something went wrong'}.`,
        timestamp: Date.now(),
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversation.id
            ? { ...c, messages: [...keptMessages, errMsg], updatedAt: Date.now() }
            : c,
        ),
      )
    } finally {
      setIsGenerating(false)
    }
  }, [currentConversation, isGenerating, setConversations])

  return (
    <AppContext.Provider
      value={{
        view,
        setView: (v) => {
          setView(v)
          setSidebarOpen(false)
        },
        theme,
        toggleTheme,
        backgroundId,
        setBackgroundId,
        conversations,
        currentConversationId,
        setCurrentConversationId,
        currentConversation,
        isGenerating,
        sendMessage,
        newConversation,
        deleteConversation,
        clearCurrentConversation,
        regenerateLastResponse,
        demoMode: isDemoMode,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
