import { memo } from 'react'
import { Copy, RefreshCw, Check, Cloud } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Message } from '../types'
import { CloudMascot } from './CloudMascot'

export const MessageBubble = memo(function MessageBubble({
  message,
  onRegenerate,
  isLast,
}: {
  message: Message
  onRegenerate?: () => void
  isLast: boolean
}) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        {isUser ? (
          <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-xs font-bold text-primary">
            You
          </div>
        ) : (
          <div className="scale-50 -m-4">
            <CloudMascot size="sm" />
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-cloud-blue/60 to-cloud-cyan/40 border border-cloud-cyan/30 text-white'
              : 'glass text-primary'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-body text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    if (!inline && match) {
                      return (
                        <SyntaxHighlighter
                          style={oneDark as any}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderRadius: '12px',
                            fontSize: '0.82rem',
                          }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      )
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          {message.isDemo && (
            <div className="mt-2 text-xs text-secondary/60 italic flex items-center gap-1">
              <Cloud className="w-3 h-3" />
              Demo response — not from a real AI
            </div>
          )}
        </div>

        {/* Actions for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-2 px-1">
            <button
              onClick={handleCopy}
              className="text-secondary hover:text-cloud-cyan transition-colors p-1"
              title="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="text-secondary hover:text-cloud-cyan transition-colors p-1"
                title="Regenerate response"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
})
