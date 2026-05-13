import { useState } from 'react';
import { clsx } from 'clsx';
import { useUIStore } from '@/stores';
import { useCalendarData, type CalendarEvent } from '@/hooks';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildCells(year: number, month: number): Array<{ date: Date; current: boolean }> {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: Array<{ date: Date; current: boolean }> = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), current: false });
  }

  return cells;
}

interface PopoverState {
  event: CalendarEvent;
  x: number;
  y: number;
}

function EventPopover({
  popover,
  onClose,
  onOpen,
}: {
  popover: PopoverState;
  onClose: () => void;
  onOpen: (event: CalendarEvent) => void;
}) {
  const { event, x, y } = popover;
  const fm = event.file.frontmatter;
  const fmType = fm.type != null ? String(fm.type) : null;
  const fmStatus = fm.status != null ? String(fm.status) : null;
  const fmPriority = fm.priority != null ? String(fm.priority) : null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={{ left: x, top: y }}
        className="fixed z-50 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl w-64 p-3"
      >
        <div className="flex items-start gap-2 mb-2">
          <span
            className={clsx(
              'text-xs px-1.5 py-0.5 rounded shrink-0 mt-0.5',
              event.source === 'frontmatter'
                ? 'bg-violet-900/60 text-violet-300'
                : 'bg-amber-900/50 text-amber-300',
            )}
          >
            {event.source === 'frontmatter' ? 'due date' : 'mention'}
          </span>
          <span className="text-sm font-medium text-neutral-100 leading-snug">{event.file.name}</span>
        </div>

        {event.source === 'inline' && event.context && (
          <p className="text-xs text-neutral-500 italic mb-2 leading-relaxed border-l-2 border-neutral-700 pl-2">
            {event.context}
          </p>
        )}

        {event.source === 'frontmatter' && (fmType || fmStatus || fmPriority) && (
          <div className="flex flex-wrap gap-1 mb-2">
            {fmType && (
              <span className="text-xs px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300">{fmType}</span>
            )}
            {fmStatus && (
              <span className="text-xs px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300">{fmStatus}</span>
            )}
            {fmPriority && (
              <span className="text-xs px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-400">{fmPriority}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-neutral-700/60">
          <span className="text-xs text-neutral-600 font-mono">{event.date}</span>
          <button
            onClick={() => onOpen(event)}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Open →
          </button>
        </div>
      </div>
    </>
  );
}

export default function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const setActiveFile = useUIStore((s) => s.setActiveFile);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const events = useCalendarData(year, month);

  const prev = () => {
    setPopover(null);
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const next = () => {
    setPopover(null);
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };
  const goToday = () => {
    setPopover(null);
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  const openFile = (event: CalendarEvent) => {
    setActiveFile(event.file.id);
    setViewMode('document');
    setPopover(null);
  };

  const handleEventClick = (e: React.MouseEvent<HTMLButtonElement>, event: CalendarEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const POPOVER_W = 256;
    const POPOVER_H = 150;
    const x = Math.min(rect.left, window.innerWidth - POPOVER_W - 8);
    const y = rect.bottom + POPOVER_H > window.innerHeight
      ? rect.top - POPOVER_H - 4
      : rect.bottom + 4;
    setPopover({ event, x, y });
  };

  const todayKey = localDateKey(today);
  const cells = buildCells(year, month);

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={prev}
          className="text-neutral-500 hover:text-neutral-300 transition-colors w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-800"
        >
          ‹
        </button>
        <h2 className="text-sm font-semibold text-neutral-200 min-w-[148px] text-center">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={next}
          className="text-neutral-500 hover:text-neutral-300 transition-colors w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-800"
        >
          ›
        </button>
        <button
          onClick={goToday}
          className="ml-2 text-xs text-neutral-600 hover:text-neutral-400 transition-colors px-2 py-1 rounded border border-neutral-800 hover:border-neutral-700"
        >
          Today
        </button>

        <div className="ml-auto flex items-center gap-3 text-xs text-neutral-700">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-violet-900/60 inline-block" />
            due date
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-900/50 inline-block" />
            mention
          </span>
        </div>
      </div>

      <div className="rounded border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-neutral-800">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="bg-neutral-900 px-2 py-2 text-xs text-neutral-600 text-center font-medium uppercase tracking-wide"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const key = localDateKey(cell.date);
            const dayEvents = events.get(key) ?? [];
            const isToday = key === todayKey;
            const isLastRow = i >= 35;

            return (
              <div
                key={i}
                className={clsx(
                  'bg-neutral-950 min-h-[88px] p-1.5 border-r border-b border-neutral-800/50',
                  'last:border-r-0',
                  isLastRow && 'border-b-0',
                  !cell.current && 'opacity-30',
                )}
              >
                <span
                  className={clsx(
                    'text-xs inline-flex items-center justify-center w-5 h-5 rounded-full',
                    isToday ? 'bg-violet-600 text-white font-semibold' : 'text-neutral-600',
                  )}
                >
                  {cell.date.getDate()}
                </span>

                <div className="mt-1 flex flex-col gap-0.5">
                  {dayEvents.map((ev, idx) => (
                    <button
                      key={`${ev.file.id}-${idx}`}
                      onClick={(e) => handleEventClick(e, ev)}
                      title={ev.source === 'inline' ? ev.context : ev.file.name}
                      className={clsx(
                        'text-left text-xs px-1.5 py-0.5 rounded transition-colors truncate w-full',
                        ev.source === 'frontmatter'
                          ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/70'
                          : 'bg-amber-900/30 text-amber-300 hover:bg-amber-900/60 border border-amber-900/40',
                      )}
                    >
                      {ev.file.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {popover && (
        <EventPopover
          popover={popover}
          onClose={() => setPopover(null)}
          onOpen={openFile}
        />
      )}
    </div>
  );
}
