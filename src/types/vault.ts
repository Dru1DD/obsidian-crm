export interface VaultFile {
  id: string;
  name: string;
  path: string;
  extension: string;
  content: string;
  frontmatter: Record<string, unknown>;
  outlinks: string[];
  backlinks: string[];
}

export interface VaultFolder {
  id: string;
  name: string;
  path: string;
  children: Array<VaultFile | VaultFolder>;
}

export type VaultNode = VaultFile | VaultFolder;

export interface Vault {
  name: string;
  root: VaultFolder;
  files: Map<string, VaultFile>;
  folders: Map<string, VaultFolder>;
}

export function isVaultFile(node: VaultNode): node is VaultFile {
  return 'content' in node;
}

export function isVaultFolder(node: VaultNode): node is VaultFolder {
  return 'children' in node;
}
