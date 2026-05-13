export type ViewMode = 'document' | 'graph' | 'split' | 'kanban' | 'calendar';

export interface UIState {
  activeFileId: string | null;
  activeTab: string | null;
  sidebarCollapsed: boolean;
  viewMode: ViewMode;
  graphFocusedNodeId: string | null;
  isEditing: boolean;
  showFrontmatter: boolean;
}
