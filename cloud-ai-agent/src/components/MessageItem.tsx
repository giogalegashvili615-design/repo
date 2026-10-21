import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Globe,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Message } from '../types';
import { CodeBlock } from './CodeBlock';

interface MessageItemProps {
  message: Message;
  isLatestAssistant: boolean;
  onRegenerate?: () => void;
  isSpeaking?: boolean;
  onSpeak?: (text: string, id: string) => void;
  onStopSpeak?: () => void;
  isLightMode?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLatestAssistant,
  onRegenerate,
  isSpeaking = false,
  onSpeak,
  onStopSpeak,
  isLightMode = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTtsToggle = () => {
    if (isSpeaking && onStopSpeak) {
      onStopSpeak();
    } else if (onSpeak) {
      onSpeak(message.content, message.id);
    }
  };

  if (isUser) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-3 flex justify-end animate-message-enter">
        <div
          className={`max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm sm:text-[15px] leading-relaxed shadow-xs transition-colors ${
            isLightMode
              ? 'bg-[#f4f4f4] text-[#0d0d0d] border border-zinc-200/60'
              : 'bg-[#2b2d31] text-zinc-100'
          }`}
        >
          {/* User Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className={`p-1 rounded-lg text-xs max-w-xs overflow-hidden border ${
                    isLightMode
                      ? 'bg-white border-zinc-300 text-zinc-800'
                      : 'bg-[#202124] border-[#3b3e45] text-zinc-300'
                  }`}
                >
                  {att.type === 'image' && att.previewUrl ? (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="px-2 py-1 font-mono text-[11px] truncate">
                      {att.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div
      className={`w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 animate-message-enter transition-colors ${
        isLightMode ? 'text-[#0d0d0d]' : 'text-zinc-200'
      }`}
    >
      {/* Thought / Reasoning trace */}
      {message.thought && (
        <div
          className={`mb-3 rounded-xl border overflow-hidden transition-colors ${
            isLightMode
              ? 'border-zinc-200 bg-zinc-50'
              : 'border-[#34363d] bg-[#161719]'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsThoughtExpanded(!isThoughtExpanded)}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition ${
              isLightMode
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#202226]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-blue-500" />
              <span>Thought Process</span>
            </div>
            {isThoughtExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          {isThoughtExpanded && (
            <div
              className={`px-3.5 py-2.5 text-xs font-mono border-t whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto ${
                isLightMode
                  ? 'text-zinc-600 bg-zinc-100/50 border-zinc-200'
                  : 'text-zinc-400 bg-[#121315] border-[#26282e]'
              }`}
            >
              {message.thought}
            </div>
          )}
        </div>
      )}

      {/* Main markdown content with high-contrast typography */}
      <div className="text-[14px] sm:text-[15px] leading-relaxed space-y-3 font-normal">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              if (!inline && match) {
                return <CodeBlock language={match[1]} value={codeString} />;
              }
              if (!inline && codeString.includes('\n')) {
                return <CodeBlock language="text" value={codeString} />;
              }
              return (
                <code
                  className={`px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm font-medium ${
                    isLightMode
                      ? 'bg-zinc-100 text-blue-600 border border-zinc-200'
                      : 'bg-[#27282c] text-blue-300'
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            p({ children }) {
              return <p className="mb-2 leading-relaxed">{children}</p>;
            },
            strong({ children }) {
              return (
                <strong
                  className={`font-semibold ${
                    isLightMode ? 'text-black font-bold' : 'text-zinc-100'
                  }`}
                >
                  {children}
                </strong>
              );
            },
            ul({ children }) {
              return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal pl-5 my-2 space-y-1.5">{children}</ol>;
            },
            li({ children }) {
              return (
                <li
                  className={`pl-1 leading-relaxed ${
                    isLightMode ? 'text-zinc-800' : 'text-zinc-300'
                  }`}
                >
                  {children}
                </li>
              );
            },
            hr() {
              return (
                <hr
                  className={`my-4 border ${
                    isLightMode ? 'border-zinc-200' : 'border-[#32343a]'
                  }`}
                />
              );
            },
            a({ href, children }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 underline underline-offset-2 inline-flex items-center gap-1 font-medium"
                >
                  {children}
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
              );
            },
            table({ children }) {
              return (
                <div
                  className={`overflow-x-auto my-3 rounded-lg border ${
                    isLightMode ? 'border-zinc-200' : 'border-[#32343a]'
                  }`}
                >
                  <table
                    className={`min-w-full divide-y text-left text-xs sm:text-sm ${
                      isLightMode ? 'divide-zinc-200' : 'divide-[#32343a]'
                    }`}
                  >
                    {children}
                  </table>
                </div>
              );
            },
            th({ children }) {
              return (
                <th
                  className={`px-3.5 py-2 font-semibold ${
                    isLightMode
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'bg-[#242529] text-zinc-200'
                  }`}
                >
                  {children}
                </th>
              );
            },
            td({ children }) {
              return (
                <td
                  className={`px-3.5 py-2 border-t ${
                    isLightMode
                      ? 'border-zinc-200 text-zinc-700'
                      : 'border-[#32343a] text-zinc-300'
                  }`}
                >
                  {children}
                </td>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>

        {message.isStreaming && (
          <span
            className={`inline-block w-2 h-4 ml-1 rounded-xs animate-cursor-blink align-middle ${
              isLightMode ? 'bg-zinc-900' : 'bg-zinc-200'
            }`}
          />
        )}
      </div>

      {/* Sources list if search was enabled */}
      {message.sources && message.sources.length > 0 && (
        <div
          className={`mt-3 pt-2 border-t ${
            isLightMode ? 'border-zinc-200' : 'border-[#2d2f34]'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 text-xs mb-2 ${
              isLightMode ? 'text-zinc-500' : 'text-zinc-400'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Sources ({message.sources.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {message.sources.map((src, idx) => (
              <a
                key={idx}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition border ${
                  isLightMode
                    ? 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
                    : 'bg-[#25262a] hover:bg-[#2e3035] border-[#34363d] text-zinc-300'
                }`}
              >
                <span className="text-blue-500 text-[10px] font-mono">{idx + 1}.</span>
                <span className="truncate max-w-[200px]">{src.title || src.uri}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons: Copy & Listen */}
      <div
        className={`flex items-center gap-3 mt-2 pt-1 text-xs transition-colors ${
          isLightMode ? 'text-[#8e8ea0]' : 'text-[#757982]'
        }`}
      >
        <button
          type="button"
          onClick={handleCopy}
          className={`transition font-normal cursor-pointer flex items-center gap-1 py-0.5 px-1 rounded ${
            isLightMode ? 'hover:text-black hover:bg-zinc-100' : 'hover:text-zinc-200 hover:bg-[#25262a]'
          }`}
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        <button
          type="button"
          onClick={handleTtsToggle}
          className={`transition font-normal cursor-pointer flex items-center gap-1 py-0.5 px-1 rounded ${
            isLightMode ? 'hover:text-black hover:bg-zinc-100' : 'hover:text-zinc-200 hover:bg-[#25262a]'
          } ${isSpeaking ? 'text-blue-500' : ''}`}
          title={isSpeaking ? 'Stop audio' : 'Listen aloud'}
        >
          {isSpeaking ? <VolumeX className="w-3 h-3 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
          <span>{isSpeaking ? 'Playing' : 'Listen'}</span>
        </button>
      </div>
    </div>
  );
};
