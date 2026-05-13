import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useVaultStore, useUIStore } from '@/stores';
import type { VaultSource } from '@/lib/parser';
import type { VaultFolder } from '@/types';

function getTopTabs(root: VaultFolder): string | null {
  const folders = root.children.filter(c => 'children' in c);
  if (folders.length > 0) return (folders[0] as VaultFolder).name;
  return null;
}

export default function UploadZone() {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadVault = useVaultStore((s) => s.loadVault);
  const loading = useVaultStore((s) => s.loading);
  const error = useVaultStore((s) => s.error);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const navigate = useNavigate();

  const setDirectoryHandle = useVaultStore((s) => s.setDirectoryHandle);

  const handleSource = useCallback(async (source: VaultSource, dirHandle?: FileSystemDirectoryHandle) => {
    await loadVault(source);
    setDirectoryHandle(dirHandle ?? null);
    const vault = useVaultStore.getState().vault;
    if (vault) {
      const firstTab = getTopTabs(vault.root);
      if (firstTab) setActiveTab(firstTab);
      navigate('/vault');
    }
  }, [loadVault, setDirectoryHandle, setActiveTab, navigate]);

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const items = e.dataTransfer.items;
    if (!items) return;

    const files = [...e.dataTransfer.files];
    const zip = files.find(f => f.name.endsWith('.zip'));
    if (zip) {
      handleSource({ type: 'zip', file: zip });
    } else {
      let dirHandle: FileSystemDirectoryHandle | undefined;
      if (items[0] && 'getAsFileSystemHandle' in items[0]) {
        const h = await (items[0] as DataTransferItem & { getAsFileSystemHandle(): Promise<FileSystemHandle | null> }).getAsFileSystemHandle();
        if (h?.kind === 'directory') dirHandle = h as FileSystemDirectoryHandle;
      }
      handleSource({ type: 'folder', items }, dirHandle);
    }
  }, [handleSource]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleSource({ type: 'zip', file });
  }, [handleSource]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Vault Explorer</h1>
        <p className="text-neutral-400 text-sm">Drop an Obsidian vault folder or zip archive to begin</p>
      </div>

      <motion.div
        animate={dragging ? { scale: 1.02, borderColor: '#7c3aed' } : { scale: 1, borderColor: '#2e2e3e' }}
        transition={{ duration: 0.15 }}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={clsx(
          'relative w-full max-w-lg border-2 border-dashed rounded-xl p-16 flex flex-col items-center gap-4 cursor-pointer transition-colors',
          dragging ? 'bg-violet-950/20' : 'bg-neutral-900/50 hover:bg-neutral-900',
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          className="sr-only"
          onChange={onFileInput}
        />

        <div className="w-14 h-14 rounded-xl bg-neutral-800 flex items-center justify-center">
          <FolderIcon />
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-neutral-400">Parsing vault…</span>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-neutral-200 font-medium text-sm">Drop folder or .zip</p>
              <p className="text-neutral-500 text-xs mt-1">or click to browse</p>
            </div>
          </>
        )}
      </motion.div>

      {error && (
        <p className="text-red-400 text-sm max-w-sm text-center">{error}</p>
      )}

      <div className="flex gap-6 text-xs text-neutral-600">
        <span>Markdown rendering</span>
        <span>·</span>
        <span>Knowledge graph</span>
        <span>·</span>
        <span>Local processing</span>
      </div>
    </div>
  );
}

function FolderIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
