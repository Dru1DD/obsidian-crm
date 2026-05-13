import { useVaultStore, useUIStore } from '@/stores';
import type { VaultFile } from '@/types';

export function useActiveFile(): VaultFile | null {
  const vault = useVaultStore((s) => s.vault);
  const activeFileId = useUIStore((s) => s.activeFileId);
  if (!vault || !activeFileId) return null;
  return vault.files.get(activeFileId) ?? null;
}
