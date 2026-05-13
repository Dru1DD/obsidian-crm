import { clsx } from 'clsx';
import { useUIStore } from '@/stores';
import type { ViewMode } from '@/types';

const MODES: { value: ViewMode; label: string; title: string }[] = [
  { value: 'document', label: '≡', title: 'Document' },
  { value: 'graph', label: '⬡', title: 'Graph' },
  { value: 'split', label: '⊞', title: 'Split' },
];

export default function ViewToggle() {
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

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
