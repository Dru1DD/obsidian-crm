import { useUIStore } from '@/stores';
import { useActiveFile } from '@/hooks';
import MarkdownView from '@/components/markdown/MarkdownView';
import EditorView from '@/components/markdown/EditorView';
import GraphCanvas from '@/components/graph/GraphCanvas';
import KanbanView from '@/components/kanban/KanbanView';
import CalendarView from '@/components/calendar/CalendarView';
import FrontmatterPanel from '@/components/frontmatter/FrontmatterPanel';
import ViewToggle from './ViewToggle';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-neutral-600 gap-2">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
      </svg>
      <span className="text-sm">Select a file</span>
    </div>
  );
}

export default function ContentArea() {
  const viewMode = useUIStore((s) => s.viewMode);
  const isEditing = useUIStore((s) => s.isEditing);
  const showFrontmatter = useUIStore((s) => s.showFrontmatter);
  const activeFile = useActiveFile();

  const docContent = activeFile
    ? isEditing
      ? <EditorView key={activeFile.id} file={activeFile} />
      : <MarkdownView file={activeFile} />
    : <EmptyState />;

  const showPanel = showFrontmatter && activeFile && viewMode === 'document' && !isEditing;

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <ViewToggle />

      {viewMode === 'document' && (
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto min-w-0">
            {docContent}
          </div>
          {showPanel && <FrontmatterPanel key={activeFile!.id} file={activeFile!} />}
        </div>
      )}

      {viewMode === 'graph' && (
        <div className="flex-1">
          <GraphCanvas />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto border-r border-neutral-800">
            {docContent}
          </div>
          <div className="flex-1">
            <GraphCanvas />
          </div>
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <KanbanView />
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="flex-1 overflow-y-auto">
          <CalendarView />
        </div>
      )}
    </div>
  );
}
