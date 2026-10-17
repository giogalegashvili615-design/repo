import { motion } from 'framer-motion'
import { Wrench, PenLine, Code2, FileText, Lightbulb, Globe, Brain, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'

const TOOLS = [
  { title: 'Writing Assistant', desc: 'Generate, improve, rewrite, and brainstorm text for any purpose.', icon: PenLine, prompt: 'Help me write a professional email' },
  { title: 'Code Helper', desc: 'Write code, explain errors, and debug programming problems.', icon: Code2, prompt: 'Help me debug a JavaScript error' },
  { title: 'Image Generation', desc: 'Generate images from text descriptions and prompts.', icon: Zap, prompt: 'Generate an image of a misty mountain landscape' },
  { title: 'Summarizer', desc: 'Condense long articles, documents, and text into key points.', icon: FileText, prompt: 'Summarize the benefits of remote work' },
  { title: 'Brainstorming', desc: 'Generate ideas for businesses, projects, and creative work.', icon: Lightbulb, prompt: 'Brainstorm ideas for a sustainable startup' },
  { title: 'Web Research', desc: 'Search and compile information from across the web.', icon: Globe, prompt: 'Research the latest AI design trends' },
  { title: 'Smart Analysis', desc: 'Analyze text, data, and patterns for insights.', icon: Brain, prompt: 'Analyze the tone of a product description' },
  { title: 'Quick Actions', desc: 'Fast access to common tasks and templates.', icon: Wrench, prompt: 'Give me a quick template for a meeting agenda' },
]

export function ToolsView() {
  const { setView, sendMessage } = useApp()

  return (
    <div className="min-h-screen px-4 py-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Tools</h1>
        <p className="text-secondary mb-6">Quick access to everything Cloud AI can do.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon
            return (
              <motion.button
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => {
                  setView('chat')
                  sendMessage(tool.prompt)
                }}
                className="glass glass-hover rounded-3xl p-5 text-left flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-cloud-cyan" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-primary mb-1">{tool.title}</h3>
                  <p className="text-sm text-secondary">{tool.desc}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
