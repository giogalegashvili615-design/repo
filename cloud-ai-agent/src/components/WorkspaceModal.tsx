import React, { useState } from 'react';
import { Check, Folder, Plus, Trash2, X } from 'lucide-react';
import { Workspace } from '../types';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelectWorkspace: (id: string | null) => void;
  onCreateWorkspace: (name: string) => void;
  onDeleteWorkspace: (id: string) => void;
  isLightMode?: boolean;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
  isLightMode = false,
}) => {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className={`relative w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-modal-pop ${
          isLightMode
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#1f2023] border-[#32343a] text-zinc-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isLightMode ? 'border-zinc-200 bg-zinc-50' : 'border-[#2d2f34] bg-[#1a1b1e]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Folder className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold">Workspaces</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition ${
              isLightMode ? 'hover:bg-zinc-200 text-zinc-500' : 'hover:bg-[#2c2e33] text-zinc-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className={`text-xs ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Workspaces organize your conversations into separate project environments.
          </p>

          <div className="space-y-1 max-h-60 overflow-y-auto">
            {/* None / All option */}
            <button
              onClick={() => {
                onSelectWorkspace(null);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition ${
                activeWorkspaceId === null
                  ? isLightMode
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'bg-[#2b2d31] text-zinc-100 font-medium'
                  : isLightMode
                  ? 'text-zinc-600 hover:bg-zinc-50'
                  : 'text-zinc-400 hover:bg-[#26282d] hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <span>No workspace (All chats)</span>
              </div>
              {activeWorkspaceId === null && <Check className="w-4 h-4 text-blue-500" />}
            </button>

            {/* Custom Workspaces */}
            {workspaces.map((ws) => {
              const isSelected = ws.id === activeWorkspaceId;
              return (
                <div
                  key={ws.id}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer ${
                    isSelected
                      ? isLightMode
                        ? 'bg-zinc-100 text-zinc-900 font-medium'
                        : 'bg-[#2b2d31] text-zinc-100 font-medium'
                      : isLightMode
                      ? 'text-zinc-600 hover:bg-zinc-50'
                      : 'text-zinc-400 hover:bg-[#26282d] hover:text-zinc-200'
                  }`}
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{ws.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isSelected && <Check className="w-4 h-4 text-blue-500 mr-1" />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWorkspace(ws.id);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition"
                      title="Delete workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* New Workspace Input */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Workspace name..."
                autoFocus
                className={`flex-1 rounded-xl px-3 py-1.5 text-xs border focus:outline-none focus:border-blue-500 ${
                  isLightMode
                    ? 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                    : 'bg-[#161719] border-[#383b42] text-zinc-200 placeholder-zinc-500'
                }`}
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-[#2a2c31] text-zinc-400 text-xs transition"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed text-xs transition mt-2 ${
                isLightMode
                  ? 'border-zinc-300 text-zinc-600 hover:text-black hover:border-zinc-400'
                  : 'border-[#34363d] text-zinc-400 hover:text-zinc-200 hover:border-zinc-500'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create new workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
