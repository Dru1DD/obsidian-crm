import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVaultStore, useUIStore } from '@/stores';
import { isVaultFolder } from '@/types';
import type { VaultFolder } from '@/types';
import FileTree from '@/components/navigation/FileTree';

export default function Sidebar() {
  const vault = useVaultStore((s) => s.vault);
  const createFile = useVaultStore((s) => s.createFile);
  const activeTab = useUIStore((s) => s.activeTab);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const setActiveFile = useUIStore((s) => s.setActiveFile);
  const setEditing = useUIStore((s) => s.setEditing);
  const setViewMode = useUIStore((s) => s.setViewMode);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!vault) return null;

  const activeFolder: VaultFolder | null = activeTab
    ? (vault.root.children.find(
        (c) => isVaultFolder(c) && c.name === activeTab,
      ) as VaultFolder | undefined) ?? null
    : vault.root;

  const targetFolder = activeFolder ?? vault.root;

  const startCreating = () => {
    setCreating(true);
    setNewName('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancelCreating = () => {
    setCreating(false);
    setNewName('');
  };

  const confirmCreate = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) { cancelCreating(); return; }
    const id = createFile(targetFolder.path, trimmed);
    if (id) {
      setViewMode('document');
      setActiveFile(id);
      setEditing(true);
    }
    cancelCreating();
  };

  return (
    <AnimatePresence initial={false}>
      {!sidebarCollapsed && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col border-r border-neutral-800 bg-neutral-950 overflow-hidden shrink-0"
        >
          <div className="flex items-center px-3 h-8 border-b border-neutral-800 shrink-0">
            <span className="text-xs text-neutral-700 font-mono flex-1 truncate">
              {targetFolder.name}
            </span>
            <button
              onClick={startCreating}
              title="New file"
              className="text-neutral-600 hover:text-neutral-300 transition-colors text-base leading-none px-0.5"
            >
              +
            </button>
          </div>

          {creating && (
            <div className="px-2 py-1.5 border-b border-neutral-800 shrink-0">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmCreate(newName);
                  if (e.key === 'Escape') cancelCreating();
                }}
                onBlur={() => { if (!newName.trim()) cancelCreating(); }}
                placeholder="filename.md"
                className="w-full bg-neutral-800 border border-neutral-700 focus:border-violet-700 rounded px-2 py-1 text-xs text-neutral-200 outline-none transition-colors"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-2">
            {activeFolder ? (
              <FileTree folder={activeFolder} />
            ) : (
              <FileTree folder={vault.root} />
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
