import { useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { VaultNode } from '@/types';
import { isVaultFile, isVaultFolder } from '@/types';
import { useUIStore } from '@/stores';

interface Props {
  node: VaultNode;
  depth: number;
}

export default function FileTreeNode({ node, depth }: Props) {
  const [open, setOpen] = useState(depth === 0);
  const activeFileId = useUIStore((s) => s.activeFileId);
  const setActiveFile = useUIStore((s) => s.setActiveFile);

  const indent = depth * 12;

  if (isVaultFile(node)) {
    const active = activeFileId === node.id;
    return (
      <button
        onClick={() => setActiveFile(node.id)}
        style={{ paddingLeft: 8 + indent }}
        className={clsx(
          'w-full text-left flex items-center gap-2 py-1 pr-3 rounded text-sm transition-colors group',
          active
            ? 'bg-violet-600/20 text-violet-300'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60',
        )}
      >
        <FileIcon active={active} />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  if (isVaultFolder(node)) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ paddingLeft: 8 + indent }}
          className="w-full text-left flex items-center gap-1.5 py-1 pr-3 rounded text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 transition-colors"
        >
          <ChevronIcon open={open} />
          <FolderIcon />
          <span className="truncate font-medium">{node.name}</span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              {node.children.map((child) => (
                <FileTreeNode key={child.id} node={child} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}

function FileIcon({ active }: { active: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? '#a78bfa' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.15 }}
      width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round"
    >
      <polyline points="9,18 15,12 9,6" />
    </motion.svg>
  );
}
