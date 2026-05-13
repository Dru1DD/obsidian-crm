import { clsx } from 'clsx';
import { useUIStore, useVaultStore } from '@/stores';
import type { ViewMode } from '@/types';

const MODES: { value: ViewMode; label: string; title: string }[] = [
  { value: 'document', label: '≡', title: 'Document' },
  { value: 'graph', label: '⬡', title: 'Graph' },
  { value: 'split', label: '⊞', title: 'Split' },
  { value: 'kanban', label: '▤', title: 'Board' },
  { value: 'calendar', label: '▦', title: 'Calendar' },
];

const DOC_MODES = new Set<ViewMode>(['document', 'split']);

export default function ViewToggle() {
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const isEditing = useUIStore((s) => s.isEditing);
  const setEditing = useUIStore((s) => s.setEditing);
  const showFrontmatter = useUIStore((s) => s.showFrontmatter);
  const toggleFrontmatter = useUIStore((s) => s.toggleFrontmatter);
  const activeFileId = useUIStore((s) => s.activeFileId);
  const dirtyFiles = useVaultStore((s) => s.dirtyFiles);

  const inDocMode = DOC_MODES.has(viewMode);
  const canEdit = activeFileId !== null && inDocMode;
  const canShowFrontmatter = activeFileId !== null && viewMode === 'document' && !isEditing;
  const isDirty = activeFileId !== null && dirtyFiles.has(activeFileId);

  return (
    <div className="flex items-center gap-1 px-3 h-9 border-b border-neutral-800 bg-neutral-950 shrink-0">
      <button
        onClick={toggleSidebar}
        title="Toggle sidebar"
        className={clsx(
          'px-2 py-1 text-xs rounded transition-colors mr-2',
          sidebarCollapsed ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-300 bg-neutral-800',
        )}
      >
        ☰
      </button>

      <div className="flex-1" />

      {(canEdit || canShowFrontmatter) && (
        <div className="flex items-center gap-1 mr-2">
          {isDirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Unsaved changes" />
          )}
          {canEdit && (
            <button
              onClick={() => setEditing(!isEditing)}
              title={isEditing ? 'Switch to view mode' : 'Edit file'}
              className={clsx(
                'px-2 py-1 text-xs rounded transition-colors',
                isEditing ? 'text-violet-400 bg-neutral-800' : 'text-neutral-500 hover:text-neutral-300',
              )}
            >
              ✎
            </button>
          )}
          {canShowFrontmatter && (
            <button
              onClick={toggleFrontmatter}
              title={showFrontmatter ? 'Hide properties' : 'Show properties'}
              className={clsx(
                'px-2 py-1 text-xs rounded transition-colors',
                showFrontmatter ? 'text-violet-400 bg-neutral-800' : 'text-neutral-500 hover:text-neutral-300',
              )}
            >
              ⊟
            </button>
          )}
        </div>
      )}

      <div className="flex rounded overflow-hidden border border-neutral-800">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setViewMode(m.value)}
            title={m.title}
            className={clsx(
              'px-3 py-1 text-xs transition-colors',
              viewMode === m.value
                ? 'bg-neutral-700 text-neutral-100'
                : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
