import { useState } from 'react';
import { clsx } from 'clsx';
import { useVaultStore, useUIStore } from '@/stores';
import { useKanbanData } from '@/hooks';
import { updateFrontmatterFields } from '@/lib/parser/frontmatter';
import type { VaultFile } from '@/types';

const COLUMN_LABELS: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
  blocked: 'Blocked',
};

const PRIORITY_DOT: Record<string, string> = {
  p1: 'bg-red-500',
  p2: 'bg-amber-500',
  p3: 'bg-neutral-600',
};

function KanbanCard({
  file,
  onDragStart,
}: {
  file: VaultFile;
  onDragStart: (id: string) => void;
}) {
  const setActiveFile = useUIStore((s) => s.setActiveFile);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const fm = file.frontmatter;
  const priority = fm.priority as string | undefined;
  const type = fm.type as string | undefined;
  const due = fm.due as string | undefined;
  const rawTags = fm.tags;
  const tags = Array.isArray(rawTags) ? rawTags : typeof rawTags === 'string' ? [rawTags] : [];

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', file.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(file.id);
      }}
      onClick={() => {
        setActiveFile(file.id);
        setViewMode('document');
      }}
      className="bg-neutral-900 border border-neutral-800 rounded p-3 cursor-pointer hover:border-neutral-700 transition-colors select-none"
    >
      <div className="flex items-start gap-2">
        {priority && (
          <span
            className={clsx('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', PRIORITY_DOT[priority] ?? 'bg-neutral-600')}
            title={priority}
          />
        )}
        <span className="text-sm text-neutral-200 font-medium leading-snug">{file.name}</span>
      </div>

      {(type || due || tags.length > 0) && (
        <div className="flex flex-wrap items-center gap-1 mt-2 ml-3.5">
          {type && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500">{type}</span>
          )}
          {due && (
            <span className="text-xs text-neutral-600 font-mono">{due.slice(0, 10)}</span>
          )}
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-violet-500/60">#{String(tag)}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KanbanView() {
  const vault = useVaultStore((s) => s.vault);
  const updateFile = useVaultStore((s) => s.updateFile);
  const { columns, order } = useKanbanData();
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDrop = (status: string) => {
    if (!draggingId || !vault) return;
    const file = vault.files.get(draggingId);
    if (!file) return;
    const current = (file.frontmatter.status as string | undefined)?.toLowerCase().trim();
    if (current === status) return;
    updateFile(draggingId, updateFrontmatterFields(file.content, { status }));
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const totalCards = order.reduce((n, col) => n + (columns.get(col)?.length ?? 0), 0);

  if (!vault || totalCards === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-600 gap-2">
        <span className="text-sm">No files with a status field</span>
        <span className="text-xs text-neutral-700">
          Add <code className="font-mono bg-neutral-900 px-1 rounded">status: todo</code> to any file's frontmatter
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto p-4 items-start">
      {order.map((col) => {
        const cards = columns.get(col) ?? [];
        const label = COLUMN_LABELS[col] ?? col;
        const isOver = dragOverColumn === col;

        return (
          <div
            key={col}
            className="flex flex-col w-72 shrink-0"
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(col);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={() => handleDrop(col)}
          >
            <div
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-t border border-b-0 transition-colors',
                isOver ? 'border-violet-700 bg-violet-950/30' : 'border-neutral-800 bg-neutral-900/50',
              )}
            >
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex-1">
                {label}
              </span>
              <span className="text-xs text-neutral-700">{cards.length}</span>
            </div>
            <div
              className={clsx(
                'flex flex-col gap-2 p-2 rounded-b border overflow-y-auto flex-1 transition-colors min-h-[4rem]',
                isOver ? 'border-violet-700 bg-violet-950/10' : 'border-neutral-800 bg-neutral-900/20',
              )}
            >
              {cards.map((file) => (
                <KanbanCard
                  key={file.id}
                  file={file}
                  onDragStart={setDraggingId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
