import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowUp,
  Brain,
  Globe,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  RotateCcw,
  Square,
  X,
} from 'lucide-react';
import { Attachment, ModelConfig } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChatInputProps {
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
  selectedModel: ModelConfig;
  enableSearch: boolean;
  onToggleSearch: () => void;
  enableThinking: boolean;
  onToggleThinking: () => void;
  isLightMode?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  onRegenerate,
  canRegenerate,
  selectedModel,
  enableSearch,
  onToggleSearch,
  enableThinking,
  onToggleThinking,
  isLightMode = false,
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Voice dictation
  const { isListening, isSupported: isSpeechSupported, toggleListening } =
    useSpeechRecognition({
      onTranscript: (transcript) => {
        setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
      },
    });

  // Close plus menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${Math.max(24, newHeight)}px`;
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming) {
      onStopStreaming();
      return;
    }

    if (!content.trim() && attachments.length === 0) return;

    onSendMessage(content.trim(), attachments);
    setContent('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');

      if (isImage) {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1] || '';
          const newAtt: Attachment = {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            mimeType: file.type || 'image/png',
            size: file.size,
            data: base64Data,
            previewUrl: result,
            type: 'image',
          };
          setAttachments((prev) => [...prev, newAtt]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => {
          const textContent = reader.result as string;
          const base64Data = btoa(unescape(encodeURIComponent(textContent)));
          const newAtt: Attachment = {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            mimeType: file.type || 'text/plain',
            size: file.size,
            data: base64Data,
            type: file.name.match(/\.(ts|tsx|js|jsx|py|html|css|json)$/i)
              ? 'code'
              : 'text',
          };
          setAttachments((prev) => [...prev, newAtt]);
        };
        reader.readAsText(file);
      }
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const hasInput = content.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-4">
      {/* Attachment previews above input */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 animate-fade-in">
          {attachments.map((att) => (
            <div
              key={att.id}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs border ${
                isLightMode
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                  : 'bg-[#25262a] border-[#34363d] text-zinc-200'
              }`}
            >
              {att.type === 'image' && att.previewUrl ? (
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="w-5 h-5 object-cover rounded"
                />
              ) : (
                <Paperclip className="w-3.5 h-3.5 text-blue-500" />
              )}
              <span className="max-w-[120px] truncate">{att.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="p-0.5 hover:bg-zinc-300 dark:hover:bg-[#34363d] rounded text-zinc-500 hover:text-black dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pill Input Container */}
      <div
        className={`relative flex items-center rounded-full px-3 py-2 transition-all duration-200 border ${
          isLightMode
            ? 'bg-white border-[#e5e7eb] focus-within:border-zinc-400 shadow-sm'
            : 'bg-[#28292d] border-[#36383e] focus-within:border-[#4b4e57] shadow-lg'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept="image/*,.txt,.md,.json,.js,.jsx,.ts,.tsx,.py,.html,.css"
        />

        {/* Left "+" Button with Quick Action Dropdown */}
        <div className="relative flex-shrink-0" ref={plusMenuRef}>
          <button
            type="button"
            onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
            className={`w-7 h-7 flex items-center justify-center transition rounded-full ${
              isLightMode
                ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-zinc-400 hover:text-white hover:bg-[#34363b]'
            }`}
            title="Add attachments or tools"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Plus popup menu */}
          {isPlusMenuOpen && (
            <div
              className={`absolute left-0 bottom-10 w-56 rounded-2xl shadow-2xl p-1.5 z-50 animate-modal-pop text-xs space-y-0.5 border ${
                isLightMode
                  ? 'bg-white border-zinc-200 text-zinc-800'
                  : 'bg-[#202124] border-[#34363d] text-zinc-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsPlusMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                  isLightMode
                    ? 'hover:bg-zinc-100 text-zinc-800'
                    : 'text-zinc-300 hover:bg-[#2b2d31] hover:text-white'
                }`}
              >
                <Paperclip className="w-4 h-4 text-blue-500" />
                <span>Upload files / images</span>
              </button>

              {selectedModel.supportsSearch && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleSearch();
                    setIsPlusMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    isLightMode
                      ? 'hover:bg-zinc-100 text-zinc-800'
                      : 'text-zinc-300 hover:bg-[#2b2d31] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span>Search Grounding</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      enableSearch ? 'bg-blue-500/20 text-blue-500' : 'text-zinc-400'
                    }`}
                  >
                    {enableSearch ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              {selectedModel.supportsThinking && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleThinking();
                    setIsPlusMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    isLightMode
                      ? 'hover:bg-zinc-100 text-zinc-800'
                      : 'text-zinc-300 hover:bg-[#2b2d31] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span>Extended Thinking</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      enableThinking ? 'bg-purple-500/20 text-purple-500' : 'text-zinc-400'
                    }`}
                  >
                    {enableThinking ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={() => {
                    toggleListening();
                    setIsPlusMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                    isLightMode
                      ? 'hover:bg-zinc-100 text-zinc-800'
                      : 'text-zinc-300 hover:bg-[#2b2d31] hover:text-white'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Mic className="w-4 h-4 text-blue-500" />
                  )}
                  <span>{isListening ? 'Stop dictation' : 'Voice input'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Input Textarea */}
        <div className="flex-1 px-2.5">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Message Cloud AI'}
            rows={1}
            className={`w-full bg-transparent text-[14px] sm:text-[15px] resize-none focus:outline-none leading-relaxed overflow-y-auto ${
              isLightMode
                ? 'text-zinc-900 placeholder-[#8e8ea0]'
                : 'text-zinc-100 placeholder-[#757982]'
            }`}
            style={{ maxHeight: '180px' }}
          />
        </div>

        {/* Circular Send / Stop Button */}
        <div className="flex-shrink-0">
          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStreaming}
              className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-xs"
              title="Stop generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasInput}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-xs ${
                hasInput
                  ? isLightMode
                    ? 'bg-black text-white hover:bg-zinc-800 cursor-pointer scale-105'
                    : 'bg-zinc-100 text-zinc-950 hover:bg-white cursor-pointer scale-105'
                  : isLightMode
                  ? 'bg-zinc-200 text-zinc-400 cursor-default'
                  : 'bg-[#3c3e44] text-[#8e929b] cursor-default'
              }`}
              title="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Footer Below Input */}
      <div
        className={`flex items-center justify-between text-[11px] mt-2.5 px-2 flex-wrap gap-2 transition-colors ${
          isLightMode ? 'text-[#8e8ea0]' : 'text-[#757982]'
        }`}
      >
        {canRegenerate ? (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isStreaming}
            className={`flex items-center gap-1.5 transition text-[11px] cursor-pointer disabled:opacity-50 ${
              isLightMode ? 'hover:text-zinc-800' : 'hover:text-zinc-300'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Regenerate</span>
          </button>
        ) : (
          <div />
        )}

        <div className="text-[11px] text-center sm:text-right flex-1 sm:flex-initial">
          Free chat with Gemini. On Google&apos;s free tier, messages may be used to improve its models; pick the local option for privacy.
        </div>
      </div>
    </div>
  );
};
