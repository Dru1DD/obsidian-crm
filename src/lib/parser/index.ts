import type { Vault, VaultFile, VaultFolder, VaultNode } from '@/types';
import { parseDroppedItems, parseZipArchive } from './file-tree';
import { parseFrontmatter } from './frontmatter';
import { resolveLinks } from './resolver';

export type VaultSource =
  | { type: 'folder'; items: DataTransferItemList }
  | { type: 'zip'; file: File };

function collectFiles(node: VaultNode, files: Map<string, VaultFile>, folders: Map<string, VaultFolder>): void {
  if ('children' in node) {
    folders.set(node.id, node);
    for (const child of node.children) collectFiles(child, files, folders);
  } else {
    files.set(node.id, node);
  }
}

export async function loadVault(source: VaultSource): Promise<Vault> {
  const root = source.type === 'zip'
    ? await parseZipArchive(source.file)
    : await parseDroppedItems(source.items);

  const files = new Map<string, VaultFile>();
  const folders = new Map<string, VaultFolder>();
  collectFiles(root, files, folders);

  parseFrontmatter(files);
  resolveLinks(files);

  return { name: root.name, root, files, folders };
}
