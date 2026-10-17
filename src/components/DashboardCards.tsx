import { motion } from 'framer-motion'
import { MessageSquare, Wrench, Sparkles, Brain, Clock, Palette, User } from 'lucide-react'
import { useApp } from '../context/AppContext'

export function DashboardCards() {
  const { conversations, setView, deleteConversation, setCurrentConversationId } = useApp()

  const features = [
    { icon: Brain, title: 'Smart Conversations', desc: 'Natural, context-aware dialogue' },
    { icon: Sparkles, title: 'Creative Tools', desc: 'Write, code, and generate ideas' },
    { icon: Palette, title: 'Personalized Experience', desc: 'Themes and backgrounds your way' },
    { icon: MessageSquare, title: 'Nature-Inspired Workspace', desc: 'A peaceful, beautiful interface' },
  ]

  const quickTools = [
    { label: 'Write', icon: Sparkles },
    { label: 'Code', icon: Wrench },
    { label: 'Image', icon: Sparkles },
    { label: 'Summarize', icon: MessageSquare },
    { label: 'Brainstorm', icon: Brain },
  ]

  const recent = conversations.slice(0, 4)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
      {/* Recent Conversations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass rounded-3xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-cloud-cyan" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-primary">Recent Conversations</h3>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-secondary py-4 text-center">No conversations yet. Start chatting!</p>
        ) : (
          <div className="space-y-2">
            {recent.map((conv) => (
              <div
                key={conv.id}
                className="glass glass-hover rounded-2xl p-3 cursor-pointer group"
                onClick={() => {
                  setCurrentConversationId(conv.id)
                  setView('chat')
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{conv.title}</p>
                    <p className="text-xs text-secondary mt-0.5">
                      {new Date(conv.updatedAt).toLocaleDateString()} · {conv.messages.length} msgs
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Delete this conversation?')) deleteConversation(conv.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-200 transition-all p-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="glass rounded-3xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-cloud-cyan" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-primary">Quick Tools</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickTools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.label}
                onClick={() => setView('create')}
                className="glass glass-hover rounded-xl px-3 py-2 flex items-center gap-1.5 text-xs font-medium text-primary"
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                {tool.label}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setView('create')}
          className="w-full mt-4 glass glass-hover rounded-2xl py-2.5 text-sm font-medium text-primary"
        >
          Explore all tools →
        </button>
      </motion.div>

      {/* About Cloud AI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="glass rounded-3xl p-5"
      >
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-cloud-cyan" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-primary">Cloud AI</h3>
        </div>
        <p className="text-sm text-secondary mb-4">More than an assistant. It's your cloud companion.</p>
        <div className="space-y-2.5">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl glass flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-cloud-cyan" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary">{f.title}</p>
                  <p className="text-xs text-secondary">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
        <button
          onClick={() => setView('tools')}
          className="w-full mt-4 glass glass-hover rounded-2xl py-2.5 text-sm font-medium text-primary flex items-center justify-center gap-1.5"
        >
          Explore the possibilities →
        </button>
      </motion.div>
    </div>
  )
}
