import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="glass glass-hover rounded-full w-10 h-10 flex items-center justify-center text-primary transition-all"
      aria-label="Toggle theme"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
      </motion.div>
    </button>
  )
}
