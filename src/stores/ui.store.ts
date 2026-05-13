import { create } from 'zustand';
import type { ViewMode } from '@/types';

interface UIStore {
  activeFileId: string | null;
  activeTab: string | null;
  sidebarCollapsed: boolean;
  viewMode: ViewMode;
  graphFocusedNodeId: string | null;
  setActiveFile: (id: string | null) => void;
  setActiveTab: (name: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  setGraphFocusedNode: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeFileId: null,
  activeTab: null,
  sidebarCollapsed: false,
  viewMode: 'document',
  graphFocusedNodeId: null,
  setActiveFile: (id) => set({ activeFileId: id }),
  setActiveTab: (name) => set({ activeTab: name }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setGraphFocusedNode: (id) => set({ graphFocusedNodeId: id }),
}));
