import { create } from 'zustand';
import type { ViewMode } from '@/types';

interface UIStore {
  activeFileId: string | null;
  activeTab: string | null;
  sidebarCollapsed: boolean;
  viewMode: ViewMode;
  graphFocusedNodeId: string | null;
  isEditing: boolean;
  showFrontmatter: boolean;
  setActiveFile: (id: string | null) => void;
  setActiveTab: (name: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  setGraphFocusedNode: (id: string | null) => void;
  setEditing: (editing: boolean) => void;
  toggleFrontmatter: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeFileId: null,
  activeTab: null,
  sidebarCollapsed: false,
  viewMode: 'document',
  graphFocusedNodeId: null,
  isEditing: false,
  showFrontmatter: false,
  setActiveFile: (id) => set({ activeFileId: id, isEditing: false }),
  setActiveTab: (name) => set({ activeTab: name }),
  setViewMode: (mode) => set({ viewMode: mode, isEditing: false }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setGraphFocusedNode: (id) => set({ graphFocusedNodeId: id }),
  setEditing: (editing) => set({ isEditing: editing }),
  toggleFrontmatter: () => set((s) => ({ showFrontmatter: !s.showFrontmatter })),
}));
