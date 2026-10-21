import React, { useState } from 'react';
import {
  Edit2,
  Pin,
  PinOff,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  onOpenWorkspaces: () => void;
  onOpenExport: () => void;
  activeWorkspaceName: string | null;
  isLightMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onTogglePin,
  onRenameChat,
  onOpenSettings,
  onOpenWorkspaces,
  onOpenExport,
  activeWorkspaceName,
  isLightMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter chats by search
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      chat.title.toLowerCase().includes(q) ||
      chat.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  });

  const startRename = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar drawer with light & dark theme styling */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-60 sm:w-64 flex flex-col transition-all duration-200 select-none ${
          isLightMode
            ? 'bg-[#f7f7f8] border-r border-[#e5e7eb] text-[#0d0d0d]'
            : 'bg-[#131416] border-r border-[#202124] text-zinc-100'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0 lg:overflow-hidden'
        }`}
      >
        {/* Brand Header */}
        <div className="pt-5 px-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-[#3b82f6] shadow-sm flex-shrink-0 animate-pulse" />
            <span className="text-[15px] font-semibold tracking-tight">Cloud AI</span>
          </div>
          <button
            onClick={onToggle}
            className={`p-1 rounded lg:hidden ${
              isLightMode ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New chat button matching "+ New chat" */}
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={onNewChat}
            className={`flex items-center gap-2 text-[13px] transition py-1 font-normal group ${
              isLightMode
                ? 'text-zinc-700 hover:text-black'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            <span>New chat</span>
          </button>
        </div>

        {/* Search chats input */}
        <div className="px-3 pb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats (Ctrl+K)"
            className={`w-full rounded-lg px-3 py-2 text-xs transition focus:outline-none ${
              isLightMode
                ? 'bg-white border border-[#e5e7eb] text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 shadow-xs'
                : 'bg-[#202124] border border-[#2b2d31] text-zinc-200 placeholder-[#757982] focus:border-zinc-600'
            }`}
          />
        </div>

        {/* Chat List - active chat as rounded pill */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 py-1">
          {filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isEditing = editingId === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-all duration-150 ${
                  isActive
                    ? isLightMode
                      ? 'bg-[#ececf1] text-[#0d0d0d] font-medium shadow-2xs'
                      : 'bg-[#2b2d31] text-zinc-100 font-normal shadow-2xs'
                    : isLightMode
                    ? 'text-zinc-600 hover:text-zinc-900 hover:bg-[#ececf1]/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1b1e]'
                }`}
              >
                <div className="truncate flex-1 pr-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveRename(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(chat.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className={`border rounded px-1.5 py-0.5 text-xs w-full focus:outline-none ${
                        isLightMode
                          ? 'bg-white border-blue-500 text-zinc-900'
                          : 'bg-[#18191c] border-blue-500 text-zinc-100'
                      }`}
                    />
                  ) : (
                    <span className="truncate">{chat.title || 'Untitled conversation'}</span>
                  )}
                </div>

                {/* Actions on hover */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(chat.id);
                      }}
                      className={`p-0.5 rounded transition ${
                        isLightMode ? 'text-zinc-400 hover:text-zinc-800' : 'text-zinc-500 hover:text-zinc-200'
                      }`}
                      title={chat.pinned ? 'Unpin' : 'Pin'}
                    >
                      {chat.pinned ? (
                        <PinOff className="w-3 h-3 text-blue-500" />
                      ) : (
                        <Pin className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => startRename(chat, e)}
                      className={`p-0.5 rounded transition ${
                        isLightMode ? 'text-zinc-400 hover:text-zinc-800' : 'text-zinc-500 hover:text-zinc-200'
                      }`}
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="p-0.5 rounded text-zinc-400 hover:text-red-500 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom navigation links */}
        <div
          className={`p-4 border-t space-y-2.5 text-[13px] ${
            isLightMode ? 'border-[#e5e7eb]' : 'border-[#202124]'
          }`}
        >
          <div
            className={`text-[12px] leading-tight ${
              isLightMode ? 'text-[#8e8ea0]' : 'text-[#757982]'
            }`}
          >
            {activeWorkspaceName ? `Workspace: ${activeWorkspaceName}` : 'No workspace selected'}
          </div>

          <button
            type="button"
            onClick={onOpenExport}
            className={`block text-left transition ${
              isLightMode ? 'text-zinc-700 hover:text-black' : 'text-zinc-300 hover:text-white'
            }`}
          >
            Export chat
          </button>

          <button
            type="button"
            onClick={onOpenWorkspaces}
            className={`block text-left transition ${
              isLightMode ? 'text-zinc-700 hover:text-black' : 'text-zinc-300 hover:text-white'
            }`}
          >
            Choose workspace
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className={`block text-left transition ${
              isLightMode ? 'text-zinc-700 hover:text-black' : 'text-zinc-300 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>
      </aside>
    </>
  );
};
