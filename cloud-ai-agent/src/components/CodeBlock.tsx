import React, { useState } from 'react';
import { Check, Copy, Play } from 'lucide-react';
import { ArtifactModal } from './ArtifactModal';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'text', value }) => {
  const [copied, setCopied] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  const cleanLang = (language || '').toLowerCase().trim();
  const isPreviewable =
    cleanLang === 'html' ||
    cleanLang === 'xml' ||
    cleanLang === 'svg' ||
    cleanLang === 'javascript' ||
    cleanLang === 'js' ||
    cleanLang === 'css' ||
    value.includes('<html') ||
    value.includes('<!DOCTYPE') ||
    value.trim().startsWith('<svg');

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="relative my-4 rounded-xl border border-slate-800 bg-slate-950/90 shadow-lg overflow-hidden group">
        {/* Code header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
          <span className="font-semibold text-slate-300 uppercase tracking-wider">
            {cleanLang || 'code'}
          </span>

          <div className="flex items-center space-x-2">
            {isPreviewable && (
              <button
                type="button"
                onClick={() => setIsSandboxOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition text-xs font-medium"
              >
                <Play className="w-3 h-3 fill-current" />
                Live Preview
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-sans"
              title="Copy Code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code body */}
        <div className="p-4 overflow-x-auto font-mono text-xs sm:text-sm text-slate-200 leading-relaxed selection:bg-indigo-500/30">
          <pre>{value}</pre>
        </div>
      </div>

      {isPreviewable && (
        <ArtifactModal
          isOpen={isSandboxOpen}
          onClose={() => setIsSandboxOpen(false)}
          code={value}
          language={cleanLang}
          title={`Artifact Sandbox (${cleanLang})`}
        />
      )}
    </>
  );
};
