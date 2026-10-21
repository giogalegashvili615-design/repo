import React, { useRef, useState, useEffect } from 'react';
import {
  Bot,
  Check,
  ChevronDown,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
} from 'lucide-react';
import { AgentPersona, ModelConfig } from '../types';
import { AVAILABLE_MODELS } from '../constants/models';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  selectedModel: ModelConfig;
  onSelectModel: (model: ModelConfig) => void;
  activePersona: AgentPersona;
  onOpenSettings: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  selectedModel,
  onSelectModel,
  activePersona,
  onOpenSettings,
  isLightMode,
  onToggleTheme,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="relative h-14 bg-transparent px-4 sm:px-6 flex items-center justify-between z-20 flex-shrink-0 transition-colors">
      {/* Left: Model Indicator "Cloud AI · gemini-flash-latest" */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg transition lg:hidden ${
            isLightMode ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-500 hover:text-zinc-200'
          }`}
          title="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1.5 text-xs sm:text-[13px] transition font-normal group py-1 ${
              isLightMode
                ? 'text-zinc-600 hover:text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>{selectedModel.displayName || `Cloud AI · ${selectedModel.name}`}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-transform duration-200" />
          </button>

          {/* Model Switcher Dropdown */}
          {isDropdownOpen && (
            <div
              className={`absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-2xl p-1.5 z-50 animate-modal-pop divide-y border ${
                isLightMode
                  ? 'bg-white border-zinc-200 text-zinc-900 divide-zinc-100'
                  : 'bg-[#202124] border-[#2f3136] text-zinc-100 divide-[#2b2d31]'
              }`}
            >
              <div className="p-1.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-blue-500 px-2 py-1 tracking-wider">
                  Google Gemini (Free Active Tier)
                </div>
                {AVAILABLE_MODELS.filter((m) => m.provider === 'gemini').map((model) => {
                  const isSelected = model.id === selectedModel.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                        isSelected
                          ? isLightMode
                            ? 'bg-blue-50 text-blue-900 font-medium'
                            : 'bg-[#2b2d31] text-zinc-100 font-medium'
                          : isLightMode
                          ? 'text-zinc-700 hover:bg-zinc-100'
                          : 'text-zinc-400 hover:bg-[#26282c] hover:text-zinc-200'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className={`text-[11px] ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {model.badge}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-500" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-1.5 space-y-1 pt-1.5">
                <div className="text-[10px] uppercase font-bold text-purple-500 px-2 py-1 tracking-wider">
                  Anthropic Claude
                </div>
                {AVAILABLE_MODELS.filter((m) => m.provider === 'anthropic').map((model) => {
                  const isSelected = model.id === selectedModel.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                        isSelected
                          ? isLightMode
                            ? 'bg-purple-50 text-purple-900 font-medium'
                            : 'bg-[#2b2d31] text-zinc-100 font-medium'
                          : isLightMode
                          ? 'text-zinc-700 hover:bg-zinc-100'
                          : 'text-zinc-400 hover:bg-[#26282c] hover:text-zinc-200'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className={`text-[11px] ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {model.badge}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Center: Rounded Pill with Robot & Assistant Name */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2.5">
        <button
          type="button"
          onClick={onOpenSettings}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full shadow-xs text-xs transition-all duration-200 border group ${
            isLightMode
              ? 'bg-zinc-100/90 border-zinc-200 text-zinc-800 hover:border-zinc-400 shadow-2xs'
              : 'bg-[#111214] border-[#2b2d31] text-zinc-200 hover:border-zinc-500 shadow-md'
          }`}
          title="Click to customize persona and settings"
        >
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
              isLightMode ? 'bg-zinc-200 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            <Bot className="w-3 h-3" />
          </div>
          <span className="font-medium tracking-wide text-[12px]">{activePersona.name || 'Coucou'}</span>
        </button>
      </div>

      {/* Right side: Quick Theme Switcher & Collapse */}
      <div className="flex items-center gap-2">
        {/* Instant Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className={`p-1.5 rounded-xl transition ${
            isLightMode
              ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#232428]'
          }`}
          title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Sidebar desktop collapse button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`hidden lg:flex p-1.5 rounded-xl transition ${
            isLightMode
              ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#232428]'
          }`}
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
