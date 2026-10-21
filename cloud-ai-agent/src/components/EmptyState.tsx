import React from 'react';
import { AgentPersona, ModelConfig } from '../types';

interface EmptyStateProps {
  selectedModel: ModelConfig;
  activePersona: AgentPersona;
  onSelectPrompt: (prompt: string) => void;
  isLightMode?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  selectedModel,
  activePersona,
  onSelectPrompt,
  isLightMode = false,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-2xl mx-auto text-center animate-message-enter my-auto select-none">
      {/* Blue Circle Icon */}
      <div className="w-12 h-12 rounded-full bg-[#3b82f6] shadow-lg shadow-blue-500/20 mb-4 flex items-center justify-center animate-pulse">
        <span className="w-4 h-4 rounded-full bg-white opacity-90" />
      </div>

      <h1
        className={`text-xl sm:text-2xl font-semibold tracking-tight mb-2 transition-colors ${
          isLightMode ? 'text-zinc-900' : 'text-zinc-100'
        }`}
      >
        How can I help you today?
      </h1>

      <p
        className={`text-xs sm:text-sm max-w-md mx-auto mb-6 transition-colors ${
          isLightMode ? 'text-zinc-500' : 'text-[#757982]'
        }`}
      >
        Cloud AI powered by {selectedModel.name}. Free chatting with Gemini, plus Anthropic Claude API support.
      </p>

      {/* Suggested quick prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left max-w-xl">
        {activePersona.starterPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className={`p-3.5 rounded-2xl border transition-all duration-150 text-left text-xs ${
              isLightMode
                ? 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-zinc-300 shadow-2xs hover:shadow-xs'
                : 'bg-[#202124] hover:bg-[#28292d] border-[#2b2d31] hover:border-[#383a40] text-zinc-300 hover:text-white'
            }`}
          >
            <p className="line-clamp-2 leading-relaxed font-normal">&ldquo;{prompt}&rdquo;</p>
          </button>
        ))}
      </div>
    </div>
  );
};
