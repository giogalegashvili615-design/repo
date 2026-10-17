import { motion } from 'framer-motion'
import { MessageSquare, Trash2, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'

export function HistoryView() {
  const { conversations, setCurrentConversationId, setView, deleteConversation, newConversation } = useApp()

  return (
    <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">History</h1>
          <button
            onClick={newConversation}
            className="glass glass-hover rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-medium text-primary"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {conversations.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-secondary mx-auto mb-4" strokeWidth={1} />
            <h3 className="text-lg font-semibold text-primary mb-1">No conversations yet</h3>
            <p className="text-sm text-secondary">Start a new chat to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass glass-hover rounded-2xl p-4 cursor-pointer group flex items-center justify-between"
                onClick={() => {
                  setCurrentConversationId(conv.id)
                  setView('chat')
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{conv.title}</p>
                  <p className="text-xs text-secondary mt-1">
                    {new Date(conv.updatedAt).toLocaleString()} · {conv.messages.length} messages
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Delete this conversation?')) deleteConversation(conv.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-200 transition-all p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
