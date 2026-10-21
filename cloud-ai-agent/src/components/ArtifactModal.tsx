import React, { useState } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  Code,
  Eye,
} from 'lucide-react';

interface ArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  title?: string;
}

export const ArtifactModal: React.FC<ArtifactModalProps> = ({
  isOpen,
  onClose,
  code,
  language,
  title = 'Interactive Preview',
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  // Prepare iframe HTML document
  const getIframeSrcDoc = () => {
    const isHtml = language === 'html' || language === 'xml' || code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('<div');
    const isSvg = language === 'svg' || code.trim().startsWith('<svg');

    if (isSvg) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; }
    svg { max-width: 90vw; max-height: 90vh; }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
    }

    if (isHtml) {
      if (code.includes('<!DOCTYPE html>') || code.includes('<html')) {
        return code;
      }
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #ffffff; color: #0f172a; }
  </style>
</head>
<body class="p-4">
  ${code}
</body>
</html>`;
    }

    // JavaScript / TypeScript demo wrapper
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: monospace; padding: 1rem; background: #090d16; color: #f8fafc; }
    #console { white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="mb-2 text-xs uppercase tracking-wider text-emerald-400 font-bold">Execution Output:</div>
  <div id="console"></div>
  <script>
    const consoleDiv = document.getElementById('console');
    const originalLog = console.log;
    console.log = function(...args) {
      originalLog.apply(console, args);
      const line = document.createElement('div');
      line.textContent = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ');
      consoleDiv.appendChild(line);
    };
    try {
      ${code}
    } catch(e) {
      const err = document.createElement('div');
      err.style.color = '#ef4444';
      err.textContent = 'Runtime Error: ' + e.message;
      consoleDiv.appendChild(err);
    }
  </script>
</body>
</html>`;
  };

  const deviceWidthClass =
    device === 'mobile' ? 'max-w-sm' : device === 'tablet' ? 'max-w-2xl' : 'w-full';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
      <div className="relative flex flex-col w-full max-w-6xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              {title}
              <span className="text-xs font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                {language}
              </span>
            </h3>
          </div>

          {/* Center Tabs & Devices */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs font-medium">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'preview'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'code'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Source Code
              </button>
            </div>

            {activeTab === 'preview' && (
              <div className="hidden sm:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
                <button
                  onClick={() => setDevice('desktop')}
                  className={`p-1.5 rounded ${device === 'desktop' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  className={`p-1.5 rounded ${device === 'tablet' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={`p-1.5 rounded ${device === 'mobile' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            {activeTab === 'preview' && (
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Reload Preview"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-slate-950 p-4">
          {activeTab === 'preview' ? (
            <div className={`h-full transition-all duration-300 mx-auto rounded-xl overflow-hidden shadow-xl border border-slate-800 bg-white ${deviceWidthClass}`}>
              <iframe
                key={key}
                title="Sandbox Preview"
                srcDoc={getIframeSrcDoc()}
                sandbox="allow-scripts allow-modals allow-same-origin"
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="w-full h-full overflow-auto bg-slate-900 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed border border-slate-800">
              <pre>{code}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
