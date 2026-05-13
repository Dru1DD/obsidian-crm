export type ViewMode = 'document' | 'graph' | 'split';

export interface UIState {
  activeFileId: string | null;
  activeTab: string | null;
  sidebarCollapsed: boolean;
  viewMode: ViewMode;
  graphFocusedNodeId: string | null;
}
