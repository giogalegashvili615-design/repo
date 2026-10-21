import React, { useState } from 'react';
import { Check, Copy, Download, FileJson, FileText, X } from 'lucide-react';
import { ChatSession } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: ChatSession;
  isLightMode?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  chat,
  isLightMode = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    let md = `# ${chat.title}\n\n`;
    md += `*Exported from Cloud AI on ${new Date().toLocaleString()}*\n`;
    md += `*Model: ${chat.modelId}*\n\n---\n\n`;

    chat.messages.forEach((msg) => {
      const sender = msg.role === 'user' ? '### User' : `### Cloud AI (${msg.modelUsed || 'AI'})`;
      md += `${sender}\n\n${msg.content}\n\n`;
      if (msg.sources && msg.sources.length > 0) {
        md += `**Sources:**\n`;
        msg.sources.forEach((s) => {
          md += `- [${s.title}](${s.uri})\n`;
        });
        md += '\n';
      }
      md += '---\n\n';
    });
    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(chat, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className={`relative w-full max-w-md border rounded-2xl shadow-2xl p-6 animate-modal-pop ${
          isLightMode
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#1e1f23] border-[#32343a] text-zinc-100'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isLightMode ? 'border-zinc-200' : 'border-[#2d2f34]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-semibold">Export Conversation</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition ${
              isLightMode ? 'hover:bg-zinc-100 text-zinc-500' : 'hover:bg-[#2b2d31] text-zinc-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className={`text-xs my-4 ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Export &ldquo;{chat.title}&rdquo; ({chat.messages.length} messages) into your preferred format:
        </p>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition ${
              isLightMode
                ? 'border-zinc-200 hover:bg-zinc-50 text-zinc-800'
                : 'border-[#2f3136] bg-[#17181a] hover:bg-[#25262a] text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Copy className="w-4 h-4 text-blue-500" />
              <div className="text-left">
                <div className="text-xs font-semibold">Copy Markdown</div>
                <div className={`text-[11px] ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Copy formatted text to clipboard
                </div>
              </div>
            </div>
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : null}
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition ${
              isLightMode
                ? 'border-zinc-200 hover:bg-zinc-50 text-zinc-800'
                : 'border-[#2f3136] bg-[#17181a] hover:bg-[#25262a] text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-blue-500" />
              <div className="text-left">
                <div className="text-xs font-semibold">Download Markdown (.md)</div>
                <div className={`text-[11px] ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Standard markdown document
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition ${
              isLightMode
                ? 'border-zinc-200 hover:bg-zinc-50 text-zinc-800'
                : 'border-[#2f3136] bg-[#17181a] hover:bg-[#25262a] text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileJson className="w-4 h-4 text-blue-500" />
              <div className="text-left">
                <div className="text-xs font-semibold">Download JSON (.json)</div>
                <div className={`text-[11px] ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Full conversation object
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
