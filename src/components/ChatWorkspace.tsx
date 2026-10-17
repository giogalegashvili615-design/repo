import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

export function ChatWorkspace() {
  const {
    currentConversation,
    isGenerating,
    sendMessage,
    newConversation,
    clearCurrentConversation,
    regenerateLastResponse,
  } = useApp()

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [currentConversation?.messages, isGenerating])

  const messages = currentConversation?.messages || []
  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Chat header */}
      <div className="glass rounded-2xl mx-4 mt-4 px-4 py-3 flex items-center justify-between no-select">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cloud-cyan" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-primary">
            {currentConversation?.title || 'New Conversation'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={newConversation}
            className="glass glass-hover rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
          {hasMessages && (
            <button
              onClick={() => {
                if (confirm('Clear this conversation? This cannot be undone.')) {
                  clearCurrentConversation()
                }
              }}
              className="glass glass-hover rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-red-300 hover:text-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="scale-75 mb-2">
              <div className="animate-float">
                <div className="text-6xl">☁️</div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-primary mb-1">Start a conversation</h2>
            <p className="text-sm text-secondary max-w-sm">
              Ask me anything — I can help with writing, coding, brainstorming, and more.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MessageBubble
                  message={msg}
                  isLast={i === messages.length - 1 && msg.role === 'assistant'}
                  onRegenerate={regenerateLastResponse}
                />
              </motion.div>
            ))}
            {isGenerating && <TypingIndicator />}
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <ChatInput compact />
      </div>
    </div>
  )
}
