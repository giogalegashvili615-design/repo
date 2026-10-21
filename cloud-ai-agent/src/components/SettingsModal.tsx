import React, { useState } from 'react';
import {
  Brain,
  Check,
  ChevronRight,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Key,
  Moon,
  Save,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  Tv,
  User,
  Volume2,
  X,
} from 'lucide-react';
import { AgentPersona, AppSettings } from '../types';
import { AGENT_PERSONAS } from '../constants/models';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  activePersona: AgentPersona;
  onSelectPersona: (persona: AgentPersona) => void;
  voices: SpeechSynthesisVoice[];
  onClearAllChats: () => void;
  isLightMode: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  activePersona,
  onSelectPersona,
  voices,
  onClearAllChats,
  isLightMode,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'personalization' | 'speech' | 'keys' | 'data'>('general');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(settings.theme || 'dark');
  const [anthropicKey, setAnthropicKey] = useState(settings.anthropicApiKey || '');
  const [geminiKey, setGeminiKey] = useState(settings.geminiCustomApiKey || '');
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [temperature, setTemperature] = useState(settings.temperature ?? 0.7);
  const [selectedVoice, setSelectedVoice] = useState(settings.speechVoice || '');
  const [autoScroll, setAutoScroll] = useState(settings.autoScroll ?? true);
  const [assistantNickname, setAssistantNickname] = useState(settings.assistantNickname || 'Coucou');
  const [customInstructions, setCustomInstructions] = useState(settings.customInstructions || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmClearChats, setConfirmClearChats] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      theme,
      anthropicApiKey: anthropicKey.trim(),
      geminiCustomApiKey: geminiKey.trim(),
      temperature,
      speechVoice: selectedVoice,
      autoScroll,
      assistantNickname: assistantNickname.trim() || 'Coucou',
      customInstructions: customInstructions.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    onSaveSettings({
      ...settings,
      theme: newTheme,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      {/* Modal Container matching ChatGPT settings dialog */}
      <div
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden animate-modal-pop transition-colors duration-200 ${
          isLightMode
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#1e1f23] border-[#2f3136] text-zinc-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLightMode ? 'border-zinc-200 bg-zinc-50/50' : 'border-[#2d2f34] bg-[#1a1b1e]'
          }`}
        >
          <h2 className="text-base font-semibold tracking-tight">Settings</h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isLightMode
                ? 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800'
                : 'hover:bg-[#2b2d31] text-zinc-400 hover:text-zinc-100'
            }`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Body: Tabs on left, Content on right (ChatGPT desktop style) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[380px]">
          {/* Left Navigation Tabs */}
          <div
            className={`w-full md:w-52 border-b md:border-b-0 md:border-r p-2 flex md:flex-col gap-1 overflow-x-auto flex-shrink-0 ${
              isLightMode ? 'bg-zinc-50/70 border-zinc-200' : 'bg-[#18191c] border-[#2d2f34]'
            }`}
          >
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition text-left whitespace-nowrap ${
                activeTab === 'general'
                  ? isLightMode
                    ? 'bg-zinc-200/80 text-zinc-900'
                    : 'bg-[#2b2d31] text-zinc-100'
                  : isLightMode
                  ? 'text-zinc-600 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-[#222428] hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>General</span>
            </button>

            <button
              onClick={() => setActiveTab('personalization')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition text-left whitespace-nowrap ${
                activeTab === 'personalization'
                  ? isLightMode
                    ? 'bg-zinc-200/80 text-zinc-900'
                    : 'bg-[#2b2d31] text-zinc-100'
                  : isLightMode
                  ? 'text-zinc-600 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-[#222428] hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Personalization</span>
            </button>

            <button
              onClick={() => setActiveTab('keys')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition text-left whitespace-nowrap ${
                activeTab === 'keys'
                  ? isLightMode
                    ? 'bg-zinc-200/80 text-zinc-900'
                    : 'bg-[#2b2d31] text-zinc-100'
                  : isLightMode
                  ? 'text-zinc-600 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-[#222428] hover:text-zinc-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>API Keys</span>
            </button>

            <button
              onClick={() => setActiveTab('speech')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition text-left whitespace-nowrap ${
                activeTab === 'speech'
                  ? isLightMode
                    ? 'bg-zinc-200/80 text-zinc-900'
                    : 'bg-[#2b2d31] text-zinc-100'
                  : isLightMode
                  ? 'text-zinc-600 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-[#222428] hover:text-zinc-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Speech & Voice</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition text-left whitespace-nowrap ${
                activeTab === 'data'
                  ? isLightMode
                    ? 'bg-zinc-200/80 text-zinc-900'
                    : 'bg-[#2b2d31] text-zinc-100'
                  : isLightMode
                  ? 'text-zinc-600 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-[#222428] hover:text-zinc-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Data Controls</span>
            </button>
          </div>

          {/* Right Content Pane */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Theme Selector (Segmented Control matching ChatGPT) */}
                <div className="flex items-center justify-between pb-4 border-b border-inherit">
                  <div>
                    <div className="font-medium">Theme</div>
                    <div className={`text-xs ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Select your interface appearance
                    </div>
                  </div>

                  <div
                    className={`flex items-center p-1 rounded-xl border ${
                      isLightMode
                        ? 'bg-zinc-100 border-zinc-200'
                        : 'bg-[#16171a] border-[#2d2f34]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleThemeChange('light')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        theme === 'light'
                          ? isLightMode
                            ? 'bg-white text-zinc-900 shadow-xs'
                            : 'bg-[#2b2d31] text-white shadow-xs'
                          : isLightMode
                          ? 'text-zinc-500 hover:text-zinc-900'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleThemeChange('dark')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        theme === 'dark'
                          ? isLightMode
                            ? 'bg-white text-zinc-900 shadow-xs'
                            : 'bg-[#2b2d31] text-white shadow-xs'
                          : isLightMode
                          ? 'text-zinc-500 hover:text-zinc-900'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleThemeChange('system')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        theme === 'system'
                          ? isLightMode
                            ? 'bg-white text-zinc-900 shadow-xs'
                            : 'bg-[#2b2d31] text-white shadow-xs'
                          : isLightMode
                          ? 'text-zinc-500 hover:text-zinc-900'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>System</span>
                    </button>
                  </div>
                </div>

                {/* Creativity / Temperature */}
                <div className="space-y-2 pb-4 border-b border-inherit">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Model Creativity (Temperature)</div>
                      <div className={`text-xs ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Lower values are more factual; higher values are more creative
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                      {temperature.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Precise (0.0)</span>
                    <span>Balanced (0.7)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>

                {/* Auto Scroll toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto-scroll during response</div>
                    <div className={`text-xs ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Automatically follow text down the page as it streams
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Personalization Tab */}
            {activeTab === 'personalization' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Assistant Display Nickname</label>
                  <p className={`text-xs mb-2 ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Shown on the top pill badge (like &ldquo;Coucou&rdquo; in reference screenshot)
                  </p>
                  <input
                    type="text"
                    value={assistantNickname}
                    onChange={(e) => setAssistantNickname(e.target.value)}
                    placeholder="Coucou"
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-blue-500 ${
                      isLightMode
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        : 'bg-[#161719] border-[#32343a] text-zinc-100'
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <label className="block font-medium mb-1">Preset Agent Persona</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {AGENT_PERSONAS.map((p) => {
                      const isSel = p.id === activePersona.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => onSelectPersona(p)}
                          className={`p-3 rounded-xl border text-left transition ${
                            isSel
                              ? 'border-blue-500 bg-blue-500/10'
                              : isLightMode
                              ? 'border-zinc-200 hover:bg-zinc-50'
                              : 'border-[#2f3136] hover:bg-[#25272c]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs">{p.name}</span>
                            {isSel && <Check className="w-3.5 h-3.5 text-blue-500" />}
                          </div>
                          <p className={`text-[11px] line-clamp-2 ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {p.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block font-medium mb-1">Custom Instructions (Optional)</label>
                  <p className={`text-xs mb-2 ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    What would you like the AI to keep in mind across all conversations?
                  </p>
                  <textarea
                    rows={3}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. Always respond in concise bullet points, specialize in modern TypeScript..."
                    className={`w-full rounded-xl p-3 text-xs border focus:outline-none focus:border-blue-500 resize-none ${
                      isLightMode
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        : 'bg-[#161719] border-[#32343a] text-zinc-100'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'keys' && (
              <div className="space-y-4">
                {/* Gemini Free Key Status */}
                <div
                  className={`p-4 rounded-xl border ${
                    isLightMode ? 'bg-blue-50/50 border-blue-200' : 'bg-blue-950/20 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="font-semibold text-xs sm:text-sm">Google Gemini (Active & Free)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 font-semibold">
                      Connected
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isLightMode ? 'text-zinc-600' : 'text-zinc-300'}`}>
                    Gemini 3 Flash, Flash-Lite, and Argon are pre-connected using your Google AI Studio key with zero configuration needed.
                  </p>
                </div>

                {/* Anthropic Claude API Key */}
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isLightMode ? 'bg-purple-50/40 border-purple-200' : 'bg-purple-950/20 border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span className="font-semibold text-xs sm:text-sm">Anthropic Claude API</span>
                    </div>
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-purple-500 hover:underline flex items-center gap-1 font-medium"
                    >
                      Get Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className={`text-xs ${isLightMode ? 'text-zinc-600' : 'text-zinc-300'}`}>
                    Enter your Anthropic API Key (sk-ant-...) to unlock Claude 3.7 Sonnet (Extended Thinking) and Claude 3.5 Sonnet. Stored securely in your browser.
                  </p>
                  <div className="relative">
                    <input
                      type={showAnthropicKey ? 'text' : 'password'}
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      placeholder="sk-ant-api03-..."
                      className={`w-full rounded-xl px-3 py-2 text-xs border font-mono pr-9 focus:outline-none focus:border-purple-500 ${
                        isLightMode
                          ? 'bg-white border-zinc-300 text-zinc-900'
                          : 'bg-[#161719] border-[#32343a] text-zinc-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                      className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-200"
                    >
                      {showAnthropicKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Speech Tab */}
            {activeTab === 'speech' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Text-to-Speech Voice</label>
                  <p className={`text-xs mb-3 ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Choose the voice used when reading assistant answers aloud
                  </p>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className={`w-full rounded-xl p-2.5 text-xs border focus:outline-none focus:border-blue-500 ${
                      isLightMode
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        : 'bg-[#161719] border-[#32343a] text-zinc-100'
                    }`}
                  >
                    <option value="">Default System Natural Voice</option>
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Data Controls Tab */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-inherit">
                  <div>
                    <div className="font-medium text-rose-500">Clear All Conversations</div>
                    <div className={`text-xs ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Permanently delete all stored chats and history
                    </div>
                  </div>

                  {confirmClearChats ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClearAllChats();
                          setConfirmClearChats(false);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearChats(false)}
                        className="px-2.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClearChats(true)}
                      className="px-3 py-1.5 rounded-xl border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 text-xs font-medium transition"
                    >
                      Clear chats
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-6 py-3.5 border-t ${
            isLightMode ? 'border-zinc-200 bg-zinc-50/50' : 'border-[#2d2f34] bg-[#1a1b1e]'
          }`}
        >
          <span className={`text-xs ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Preferences saved to browser storage
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                isLightMode ? 'hover:bg-zinc-200 text-zinc-600' : 'hover:bg-[#2b2d31] text-zinc-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
