import JSZip from 'jszip';
import type { VaultFile, VaultFolder } from '@/types';

const IGNORED = new Set(['.obsidian', '.git', '.DS_Store', 'node_modules']);
const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;

function slugify(path: string): string {
  return path.replace(/\.md$/i, '').replace(/\\/g, '/');
}

function makeFolderNode(name: string, path: string): VaultFolder {
  return { id: slugify(path) || name, name, path, children: [] };
}

function makeFileNode(name: string, path: string, content: string): VaultFile {
  const rawLinks = [...content.matchAll(WIKILINK_RE)].map(m => m[1].trim());
  return {
    id: slugify(path),
    name: name.replace(/\.md$/i, ''),
    path,
    extension: name.split('.').pop()?.toLowerCase() ?? '',
    content,
    frontmatter: {},
    outlinks: rawLinks,
    backlinks: [],
  };
}

// ── Folder drop via DataTransfer API ─────────────────────────────────────────

async function readEntry(entry: FileSystemEntry, basePath: string): Promise<VaultFolder | VaultFile | null> {
  const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

  if (IGNORED.has(entry.name)) return null;

  if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const folder = makeFolderNode(entry.name, relativePath);
    const childEntries = await readDirectoryEntries(dirEntry);
    const settled = await Promise.all(childEntries.map(e => readEntry(e, relativePath)));
    folder.children = settled.filter(Boolean) as Array<VaultFile | VaultFolder>;
    folder.children.sort(sortNodes);
    return folder;
  }

  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    const file = await new Promise<File>((res, rej) => fileEntry.file(res, rej));
    if (!entry.name.endsWith('.md')) return null;
    const content = await file.text();
    return makeFileNode(entry.name, relativePath, content);
  }

  return null;
}

function readDirectoryEntries(dir: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = dir.createReader();
    const all: FileSystemEntry[] = [];
    const read = () => {
      reader.readEntries(entries => {
        if (entries.length === 0) return resolve(all);
        all.push(...entries);
        read();
      }, reject);
    };
    read();
  });
}

export async function parseDroppedItems(items: DataTransferItemList): Promise<VaultFolder> {
  const entries: FileSystemEntry[] = [];
  for (let i = 0; i < items.length; i++) {
    const entry = items[i].webkitGetAsEntry();
    if (entry) entries.push(entry);
  }

  if (entries.length === 1 && entries[0].isDirectory) {
    const root = await readEntry(entries[0], '') as VaultFolder;
    return root;
  }

  const root = makeFolderNode('vault', '');
  const settled = await Promise.all(entries.map(e => readEntry(e, '')));
  root.children = settled.filter(Boolean) as Array<VaultFile | VaultFolder>;
  root.children.sort(sortNodes);
  return root;
}

// ── Zip archive ───────────────────────────────────────────────────────────────

export async function parseZipArchive(file: File): Promise<VaultFolder> {
  const zip = await JSZip.loadAsync(file);
  const rootName = file.name.replace(/\.zip$/i, '');
  const root = makeFolderNode(rootName, rootName);
  const folderMap = new Map<string, VaultFolder>();
  folderMap.set('', root);

  const mdFiles = Object.values(zip.files).filter(f => !f.dir && f.name.endsWith('.md'));

  for (const zipFile of mdFiles) {
    const parts = zipFile.name.split('/');
    const fileName = parts[parts.length - 1];
    if (IGNORED.has(parts[0])) continue;

    let current = root;
    let currentPath = '';

    for (let i = 0; i < parts.length - 1; i++) {
      const segment = parts[i];
      if (IGNORED.has(segment)) break;
      const nextPath = currentPath ? `${currentPath}/${segment}` : segment;
      if (!folderMap.has(nextPath)) {
        const folder = makeFolderNode(segment, nextPath);
        current.children.push(folder);
        folderMap.set(nextPath, folder);
      }
      current = folderMap.get(nextPath)!;
      currentPath = nextPath;
    }

    const content = await zipFile.async('text');
    const filePath = currentPath ? `${currentPath}/${fileName}` : fileName;
    current.children.push(makeFileNode(fileName, filePath, content));
  }

  sortTree(root);
  return root;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortNodes(a: VaultFile | VaultFolder, b: VaultFile | VaultFolder): number {
  const aIsFolder = 'children' in a;
  const bIsFolder = 'children' in b;
  if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
  return a.name.localeCompare(b.name);
}

function sortTree(folder: VaultFolder): void {
  folder.children.sort(sortNodes);
  for (const child of folder.children) {
    if ('children' in child) sortTree(child);
  }
}
