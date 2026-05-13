import { clsx } from 'clsx';
import { useNavigate } from 'react-router';
import { useVaultStore, useUIStore } from '@/stores';
import type { VaultFolder } from '@/types';
import { isVaultFolder } from '@/types';

export default function TabBar() {
  const vault = useVaultStore((s) => s.vault);
  const reset = useVaultStore((s) => s.reset);
  const exportVault = useVaultStore((s) => s.exportVault);
  const saveToFolder = useVaultStore((s) => s.saveToFolder);
  const dirtyCount = useVaultStore((s) => s.dirtyFiles.size);
  const hasDirectoryHandle = useVaultStore((s) => s.directoryHandle !== null);
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const setActiveFile = useUIStore((s) => s.setActiveFile);
  const navigate = useNavigate();

  if (!vault) return null;

  const topFolders = vault.root.children.filter(isVaultFolder) as VaultFolder[];

  const handleTabClick = (name: string) => {
    setActiveTab(name);
    setActiveFile(null);
  };

  const handleClose = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="flex items-center border-b border-neutral-800 bg-neutral-950 px-3 h-10 gap-1 shrink-0">
      <span className="text-xs text-neutral-600 mr-2 font-mono">{vault.name}</span>

      <div className="w-px h-4 bg-neutral-800 mr-2" />

      {topFolders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => handleTabClick(folder.name)}
          className={clsx(
            'px-3 py-1 text-xs rounded transition-colors whitespace-nowrap',
            activeTab === folder.name
              ? 'bg-neutral-800 text-neutral-100'
              : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900',
          )}
        >
          {folder.name}
        </button>
      ))}

      <div className="flex-1" />

      {dirtyCount > 0 && (
        <span className="text-xs text-amber-500/70 mr-1">
          {dirtyCount} unsaved
        </span>
      )}

      {hasDirectoryHandle && (
        <button
          onClick={saveToFolder}
          title="Save changes to original folder"
          className={clsx(
            'text-xs transition-colors px-2 py-1',
            dirtyCount > 0
              ? 'text-amber-400 hover:text-amber-200'
              : 'text-neutral-500 hover:text-neutral-300',
          )}
        >
          ↑ Save
        </button>
      )}

      <button
        onClick={exportVault}
        title="Export vault as ZIP"
        className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors px-2 py-1"
      >
        ↓ ZIP
      </button>

      <div className="w-px h-4 bg-neutral-800 mx-1" />

      <button
        onClick={handleClose}
        className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors px-2 py-1"
        title="Close vault"
      >
        ✕
      </button>
    </div>
  );
}
