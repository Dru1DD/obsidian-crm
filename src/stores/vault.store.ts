import { create } from 'zustand';
import type { Vault } from '@/types';
import { loadVault, type VaultSource } from '@/lib/parser';

interface VaultStore {
  vault: Vault | null;
  loading: boolean;
  error: string | null;
  loadVault: (source: VaultSource) => Promise<void>;
  reset: () => void;
}

export const useVaultStore = create<VaultStore>((set) => ({
  vault: null,
  loading: false,
  error: null,
  loadVault: async (source) => {
    set({ loading: true, error: null });
    try {
      const vault = await loadVault(source);
      set({ vault, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
  reset: () => set({ vault: null, loading: false, error: null }),
}));
