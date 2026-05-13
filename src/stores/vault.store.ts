import { create } from 'zustand';
import JSZip from 'jszip';
import type { Vault, VaultFile } from '@/types';
import { loadVault, type VaultSource } from '@/lib/parser';
import { parseFrontmatterFromContent } from '@/lib/parser/frontmatter';

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;

interface VaultStore {
  vault: Vault | null;
  loading: boolean;
  error: string | null;
  dirtyFiles: Set<string>;
  directoryHandle: FileSystemDirectoryHandle | null;
  loadVault: (source: VaultSource) => Promise<void>;
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
  updateFile: (id: string, content: string) => void;
  createFile: (folderPath: string, filename: string) => string | null;
  exportVault: () => Promise<void>;
  saveToFolder: () => Promise<void>;
  reset: () => void;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  vault: null,
  loading: false,
  error: null,
  dirtyFiles: new Set(),
  directoryHandle: null,

  setDirectoryHandle: (handle) => set({ directoryHandle: handle }),

  loadVault: async (source) => {
    set({ loading: true, error: null });
    try {
      const vault = await loadVault(source);
      set({ vault, loading: false, dirtyFiles: new Set() });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  updateFile: (id, content) =>
    set((s) => {
      if (!s.vault) return s;
      const file = s.vault.files.get(id);
      if (!file) return s;

      const frontmatter = parseFrontmatterFromContent(content);

      const rawLinks = [...content.matchAll(WIKILINK_RE)].map((m) => m[1].trim());

      const updatedFile: VaultFile = { ...file, content, frontmatter, outlinks: rawLinks };
      const newFiles = new Map(s.vault.files);
      newFiles.set(id, updatedFile);

      const dirty = new Set(s.dirtyFiles);
      dirty.add(id);

      return { vault: { ...s.vault, files: newFiles }, dirtyFiles: dirty };
    }),

  createFile: (folderPath, filename) => {
    const { vault, dirtyFiles } = get();
    if (!vault) return null;

    const name = filename.replace(/\.md$/i, '').trim();
    if (!name) return null;

    const filePath = folderPath ? `${folderPath}/${name}.md` : `${name}.md`;
    const fileId = filePath.replace(/\.md$/i, '');

    if (vault.files.has(fileId)) return null;

    const newFile: VaultFile = {
      id: fileId,
      name,
      path: filePath,
      extension: 'md',
      content: `# ${name}\n`,
      frontmatter: {},
      outlinks: [],
      backlinks: [],
    };

    const parentFolder = folderPath
      ? (vault.folders.get(folderPath) ?? vault.root)
      : vault.root;

    parentFolder.children.push(newFile);
    parentFolder.children.sort((a, b) => {
      const aIsFolder = 'children' in a;
      const bIsFolder = 'children' in b;
      if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    const newFiles = new Map(vault.files);
    newFiles.set(fileId, newFile);

    const dirty = new Set(dirtyFiles);
    dirty.add(fileId);

    set({ vault: { ...vault, files: newFiles }, dirtyFiles: dirty });

    return fileId;
  },

  exportVault: async () => {
    const { vault } = get();
    if (!vault) return;

    const zip = new JSZip();
    for (const file of vault.files.values()) {
      zip.file(file.path, file.content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vault.name}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  saveToFolder: async () => {
    const { vault, dirtyFiles, directoryHandle } = get();
    if (!vault || !directoryHandle || dirtyFiles.size === 0) return;

    for (const fileId of dirtyFiles) {
      const file = vault.files.get(fileId);
      if (!file) continue;

      const parts = file.path.split('/');
      let dir: FileSystemDirectoryHandle = directoryHandle;
      for (let i = 0; i < parts.length - 1; i++) {
        dir = await dir.getDirectoryHandle(parts[i], { create: true });
      }
      const fileHandle = await dir.getFileHandle(parts[parts.length - 1], { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file.content);
      await writable.close();
    }

    set({ dirtyFiles: new Set() });
  },

  reset: () => set({ vault: null, loading: false, error: null, dirtyFiles: new Set(), directoryHandle: null }),
}));
