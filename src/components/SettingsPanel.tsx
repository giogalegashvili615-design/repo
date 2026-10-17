import { motion } from 'framer-motion'
import { Palette, Check, Info } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { BACKGROUNDS } from '../lib/backgrounds'

export function SettingsPanel() {
  const { backgroundId, setBackgroundId, theme, toggleTheme, demoMode } = useApp()

  return (
    <div className="min-h-screen px-4 py-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

        {/* Theme toggle */}
        <div className="glass rounded-3xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-primary mb-3">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary">Theme Mode</p>
              <p className="text-xs text-secondary">Switch between dark and light</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-cloud-blue/60' : 'bg-cloud-cyan/40'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'left-1' : 'left-8'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Background gallery */}
        <div className="glass rounded-3xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-cloud-cyan" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-primary">Nature Backgrounds</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setBackgroundId(bg.id)}
                className={`relative rounded-2xl overflow-hidden h-24 group transition-all ${
                  backgroundId === bg.id ? 'ring-2 ring-cloud-cyan scale-[1.02]' : 'ring-1 ring-white/10'
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: bg.isGradient ? bg.gradient : `url(${bg.image})`,
                    backgroundColor: bg.isGradient ? undefined : '#0a1628',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs font-medium text-white truncate">{bg.name}</p>
                </div>
                {backgroundId === bg.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cloud-cyan flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* AI status */}
        <div className="glass rounded-3xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-cloud-cyan" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-primary">AI Provider</h3>
          </div>
          {demoMode ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-sm text-primary font-medium">Demo Mode</span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                No AI provider configured. The app uses simulated responses clearly labeled as demo content.
                To connect a real AI, set up a backend proxy and configure{' '}
                <code className="text-cloud-cyan">VITE_AI_API_URL</code> in your environment.
                See <code className="text-cloud-cyan">.env.example</code> for instructions.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-primary font-medium">AI provider connected</span>
            </div>
          )}
        </div>

        {/* About */}
        <div className="glass rounded-3xl p-5">
          <h3 className="text-sm font-semibold text-primary mb-2">About Cloud AI</h3>
          <p className="text-xs text-secondary leading-relaxed">
            Cloud AI is a nature-inspired AI workspace built with React, TypeScript, Vite, Tailwind CSS,
            and Framer Motion. It features glassmorphism design, a friendly cloud mascot, and a modular
            architecture ready for real AI integration.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
