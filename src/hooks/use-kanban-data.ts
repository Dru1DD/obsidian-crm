import { useMemo } from 'react';
import { useVaultStore } from '@/stores';
import type { VaultFile } from '@/types';

export const KANBAN_COLUMNS = ['todo', 'in-progress', 'done', 'blocked'] as const;

export function useKanbanData(): { columns: Map<string, VaultFile[]>; order: string[] } {
  const vault = useVaultStore((s) => s.vault);

  return useMemo(() => {
    const columns = new Map<string, VaultFile[]>(KANBAN_COLUMNS.map((c) => [c, []]));
    const order: string[] = [...KANBAN_COLUMNS];

    if (!vault) return { columns, order };

    for (const file of vault.files.values()) {
      const status = file.frontmatter.status as string | undefined;
      if (!status) continue;
      const col = status.toLowerCase().trim();
      if (!columns.has(col)) {
        columns.set(col, []);
        order.push(col);
      }
      columns.get(col)!.push(file);
    }

    return { columns, order };
  }, [vault]);
}
