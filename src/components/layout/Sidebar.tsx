import { motion, AnimatePresence } from 'framer-motion';
import { useVaultStore, useUIStore } from '@/stores';
import { isVaultFolder } from '@/types';
import type { VaultFolder } from '@/types';
import FileTree from '@/components/navigation/FileTree';

export default function Sidebar() {
  const vault = useVaultStore((s) => s.vault);
  const activeTab = useUIStore((s) => s.activeTab);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  if (!vault) return null;

  const activeFolder: VaultFolder | null = activeTab
    ? (vault.root.children.find(
        (c) => isVaultFolder(c) && c.name === activeTab
      ) as VaultFolder | undefined) ?? null
    : vault.root;

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
