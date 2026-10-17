import { motion, AnimatePresence } from 'framer-motion'
import { Home, MessageSquare, Sparkles, Wrench, History, Settings, Cloud, Plus, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { ViewName } from '../types'

const NAV_ITEMS: { id: ViewName; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'create', label: 'Create', icon: Sparkles },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { view, setView, sidebarOpen, setSidebarOpen, newConversation, demoMode } = useApp()

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : undefined }}
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 p-3
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          transition-transform duration-300 ease-out
        `}
      >
        <div className="glass rounded-3xl h-full flex flex-col p-4 no-select">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute inset-0 bg-cloud-cyan/30 blur-xl rounded-full" />
                <Cloud className="w-7 h-7 text-cloud-cyan relative z-10" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-bold text-primary tracking-tight">Cloud AI</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-secondary hover:text-primary p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New chat button */}
          <button
            onClick={newConversation}
            className="glass glass-hover rounded-2xl px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-primary mb-4 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = view === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'text-white'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-cloud-blue/40 to-cloud-cyan/30 border border-cloud-cyan/30"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" strokeWidth={1.5} />
                  <span className="relative z-10">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Status */}
          <div className="glass rounded-2xl p-3 mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-xs font-medium text-primary">Online</span>
            </div>
            <p className="text-xs text-secondary">
              {demoMode ? 'Demo mode — connect AI in Settings' : 'Always here for you'}
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
