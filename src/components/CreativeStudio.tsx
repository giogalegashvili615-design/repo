import { motion } from 'framer-motion'
import { ImageIcon, PenLine, Code2, FileText, Lightbulb, Globe } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { CreativeTool } from '../types'

const TOOLS: CreativeTool[] = [
  {
    id: 'text-to-image',
    title: 'Text to Image',
    description: 'Generate images from text prompts',
    icon: 'image',
    color: 'from-purple-400/30 to-pink-400/20',
  },
  {
    id: 'write',
    title: 'Write',
    description: 'Generate, improve, and rewrite text',
    icon: 'pen',
    color: 'from-blue-400/30 to-cyan-400/20',
  },
  {
    id: 'code',
    title: 'Code',
    description: 'Write, explain, and debug code',
    icon: 'code',
    color: 'from-green-400/30 to-teal-400/20',
  },
  {
    id: 'summarize',
    title: 'Summarize',
    description: 'Condense long text into key points',
    icon: 'file',
    color: 'from-orange-400/30 to-yellow-400/20',
  },
  {
    id: 'brainstorm',
    title: 'Brainstorm',
    description: 'Generate ideas for projects and businesses',
    icon: 'bulb',
    color: 'from-indigo-400/30 to-violet-400/20',
  },
  {
    id: 'web-research',
    title: 'Web Research',
    description: 'Search and compile information from the web',
    icon: 'globe',
    color: 'from-sky-400/30 to-blue-400/20',
  },
]

const ICONS: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
  pen: PenLine,
  code: Code2,
  file: FileText,
  bulb: Lightbulb,
  globe: Globe,
}

export function CreativeStudio() {
  const { setView, sendMessage } = useApp()

  const handleToolClick = (tool: CreativeTool) => {
    // Pre-fill a chat with a relevant prompt
    const prompts: Record<string, string> = {
      'text-to-image': 'Generate an image of a serene mountain lake at dawn',
      write: 'Help me write a short story about a peaceful morning in the mountains',
      code: 'Help me write a React component for a glassmorphism card',
      summarize: 'Summarize the key benefits of nature-inspired workspace design',
      brainstorm: 'Brainstorm creative ideas for a nature-themed mobile app',
      'web-research': 'Research the latest trends in AI-assisted productivity tools',
    }
    setView('chat')
    sendMessage(prompts[tool.id] || `Help me with ${tool.title}`)
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create Something Amazing</h1>
        <p className="text-secondary mb-6">Turn your ideas into reality with Cloud AI.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool, i) => {
            const Icon = ICONS[tool.icon]
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                onClick={() => handleToolClick(tool)}
                className={`glass glass-hover rounded-3xl p-5 text-left bg-gradient-to-br ${tool.color}`}
              >
                <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{tool.title}</h3>
                <p className="text-sm text-white/70">{tool.description}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Feature banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass rounded-3xl mt-6 overflow-hidden relative h-40 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(90,75,255,0.4), rgba(128,209,255,0.3)), url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format)',
            }}
          />
          <div className="relative z-10 text-center">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">Big ideas start in the cloud</h3>
            <p className="text-white/80 mt-1">Let your imagination soar with Cloud AI</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
