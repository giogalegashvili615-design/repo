import { motion } from 'framer-motion'
import { MessageSquare, Sparkles, Compass } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CloudMascot } from './CloudMascot'
import { ChatInput } from './ChatInput'
import { DashboardCards } from './DashboardCards'

export function HeroSection() {
  const { setView, sendMessage, demoMode } = useApp()

  const quickActions = [
    { label: 'Chat', icon: MessageSquare, view: 'chat' as const },
    { label: 'Create', icon: Sparkles, view: 'create' as const },
    { label: 'Explore', icon: Compass, view: 'tools' as const },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero center */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Cloud AI
          </h1>
          <p className="text-lg md:text-xl text-white/80 mt-3 font-light">
            Your ideas, my intelligence. Together in the cloud.
          </p>
        </motion.div>

        {/* Quick action pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex gap-2.5 mb-8"
        >
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => setView(action.view)}
                className="glass glass-hover rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-medium text-white"
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {action.label}
              </button>
            )
          })}
        </motion.div>

        {/* Mascot + speech bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative flex items-center gap-4 mb-8"
        >
          <CloudMascot size="lg" />
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-strong rounded-2xl rounded-bl-sm px-4 py-3 max-w-[240px]"
          >
            <p className="text-sm text-white leading-relaxed">
              Hi! I'm Cloud AI ☁️<br />
              What would you like to do today?
            </p>
          </motion.div>
        </motion.div>

        {/* Prompt bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-2xl"
        >
          <ChatInput />
          {demoMode && (
            <p className="text-center text-xs text-white/50 mt-2.5">
              Running in demo mode — connect an AI provider in Settings for real responses
            </p>
          )}
        </motion.div>
      </div>

      {/* Dashboard cards */}
      <div className="px-4 pb-8">
        <DashboardCards />
      </div>
    </div>
  )
}
