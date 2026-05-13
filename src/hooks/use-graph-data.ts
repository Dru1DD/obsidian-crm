import { useMemo } from 'react';
import { useVaultStore } from '@/stores';
import { buildGraphData } from '@/lib/graph/builder';
import type { GraphData } from '@/types';

const EMPTY: GraphData = { nodes: [], edges: [] };

export function useGraphData(): GraphData {
  const vault = useVaultStore((s) => s.vault);
  return useMemo(() => (vault ? buildGraphData(vault) : EMPTY), [vault]);
}
