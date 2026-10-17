import { AnimatePresence, motion } from 'framer-motion'
import { Home, MessageSquare, Sparkles, Wrench, Settings } from 'lucide-react'
import { AppProvider, useApp } from './context/AppContext'
import { BackgroundLayer } from './components/BackgroundLayer'
import { Sidebar } from './components/Sidebar'
import { ThemeToggle } from './components/ThemeToggle'
import { WeatherWidget } from './components/WeatherWidget'
import { HeroSection } from './components/HeroSection'
import { ChatWorkspace } from './components/ChatWorkspace'
import { CreativeStudio } from './components/CreativeStudio'
import { SettingsPanel } from './components/SettingsPanel'
import { HistoryView } from './components/HistoryView'
import { ToolsView } from './components/ToolsView'
import type { ViewName } from './types'

const MOBILE_NAV: { id: ViewName; icon: typeof Home; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'create', icon: Sparkles, label: 'Create' },
  { id: 'tools', icon: Wrench, label: 'Tools' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

function MobileNav() {
  const { view, setView } = useApp()
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-2">
      <div className="glass-strong rounded-2xl flex justify-around p-1.5 no-select">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active ? 'text-cloud-cyan' : 'text-secondary'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TopBar() {
  const { setSidebarOpen } = useApp()
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-20 p-3 flex items-center justify-between">
      <button
        onClick={() => setSidebarOpen(true)}
        className="glass rounded-xl w-10 h-10 flex items-center justify-center text-primary"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="flex items-center gap-2">
        <WeatherWidget />
        <ThemeToggle />
      </div>
    </div>
  )
}

function DesktopTopBar() {
  return (
    <div className="hidden md:flex fixed top-0 right-0 z-20 p-4 items-center gap-3">
      <WeatherWidget />
      <ThemeToggle />
    </div>
  )
}

function Content() {
  const { view } = useApp()

  return (
    <div className="flex-1 min-w-0 relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {view === 'home' && <HeroSection />}
          {view === 'chat' && <ChatWorkspace />}
          {view === 'create' && <CreativeStudio />}
          {view === 'tools' && <ToolsView />}
          {view === 'history' && <HistoryView />}
          {view === 'settings' && <SettingsPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function AppInner() {
  return (
    <div className="flex min-h-screen">
      <BackgroundLayer />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <DesktopTopBar />
        <Content />
      </div>
      <MobileNav />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
