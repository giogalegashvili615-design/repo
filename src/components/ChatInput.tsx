import { useState, useRef, type KeyboardEvent } from 'react'
import { Send, Paperclip, Mic, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'

interface ChatInputProps {
  compact?: boolean
}

export function ChatInput({ compact = false }: ChatInputProps) {
  const { sendMessage, isGenerating } = useApp()
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (!text.trim() || isGenerating) return
    sendMessage(text)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const autoResize = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 200) + 'px'
    }
  }

  return (
    <div className={`glass rounded-3xl p-2 flex items-end gap-1.5 ${compact ? 'max-w-2xl' : ''}`}>
      <button aria-label="Attach file" className="p-2.5 text-secondary hover:text-cloud-cyan transition-colors rounded-xl hover:bg-white/10">
        <Paperclip className="w-5 h-5" strokeWidth={1.5} />
      </button>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          autoResize()
        }}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything..."
        rows={1}
        className="flex-1 bg-transparent text-primary placeholder:text-secondary/60 resize-none outline-none py-2.5 px-1 text-sm leading-relaxed max-h-[200px]"
      />

      <button aria-label="Voice input" className="p-2.5 text-secondary hover:text-cloud-cyan transition-colors rounded-xl hover:bg-white/10">
        <Mic className="w-5 h-5" strokeWidth={1.5} />
      </button>

      <button
        aria-label="Send message"
        onClick={handleSubmit}
        disabled={!text.trim() || isGenerating}
        className={`p-2.5 rounded-xl transition-all ${
          text.trim() && !isGenerating
            ? 'bg-gradient-to-br from-cloud-blue to-cloud-cyan text-white shadow-lg shadow-cloud-cyan/30 hover:scale-105'
            : 'bg-white/10 text-secondary cursor-not-allowed'
        }`}
      >
        {isGenerating ? (
          <Sparkles className="w-5 h-5 animate-spin" strokeWidth={1.5} />
        ) : (
          <Send className="w-5 h-5" strokeWidth={1.5} />
        )}
      </button>
    </div>
  )
}
