import { useMemo } from 'react';
import { useVaultStore } from '@/stores';
import type { VaultFile } from '@/types';

export interface CalendarEvent {
  file: VaultFile;
  date: string;       // YYYY-MM-DD
  source: 'frontmatter' | 'inline';
  context?: string;   // surrounding line for inline events
}

function parseDateStr(str: string): Date | null {
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function inMonth(key: string, year: number, month: number): boolean {
  const d = parseDateStr(key);
  return d !== null && d.getFullYear() === year && d.getMonth() === month;
}

function getMarkdownBody(content: string): string {
  if (!content.startsWith('---')) return content;
  const closeIdx = content.indexOf('\n---', 3);
  if (closeIdx === -1) return content;
  const bodyStart = content.indexOf('\n', closeIdx + 4);
  return bodyStart === -1 ? '' : content.slice(bodyStart + 1);
}

// Matches bare ISO dates: 2024-01-15. The /g flag is reset manually before each exec call.
const INLINE_DATE_RE = /\b(\d{4}-\d{2}-\d{2})\b/g;

export function useCalendarData(year: number, month: number): Map<string, CalendarEvent[]> {
  const vault = useVaultStore((s) => s.vault);

  return useMemo(() => {
    const events = new Map<string, CalendarEvent[]>();
    if (!vault) return events;

    const push = (key: string, event: CalendarEvent) => {
      if (!events.has(key)) events.set(key, []);
      events.get(key)!.push(event);
    };

    for (const file of vault.files.values()) {
      const frontmatterDates = new Set<string>();

      // 1. Frontmatter due / date fields
      const raw = (file.frontmatter.due ?? file.frontmatter.date) as string | undefined;
      if (raw && typeof raw === 'string') {
        const key = String(raw).slice(0, 10);
        if (inMonth(key, year, month)) {
          frontmatterDates.add(key);
          push(key, { file, date: key, source: 'frontmatter' });
        }
      }

      // 2. Inline ISO date mentions in the markdown body
      const body = getMarkdownBody(file.content);
      const seenInline = new Set<string>();

      for (const line of body.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        INLINE_DATE_RE.lastIndex = 0;
        let match;
        while ((match = INLINE_DATE_RE.exec(trimmed)) !== null) {
          const key = match[1];
          if (frontmatterDates.has(key) || seenInline.has(key)) continue;
          if (!inMonth(key, year, month)) continue;
          seenInline.add(key);
          push(key, {
            file,
            date: key,
            source: 'inline',
            context: trimmed.length > 80 ? trimmed.slice(0, 77) + '…' : trimmed,
          });
        }
      }
    }

    return events;
  }, [vault, year, month]);
}
