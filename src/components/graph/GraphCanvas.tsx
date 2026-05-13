import { useCallback, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Panel,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { clsx } from 'clsx';
import { useGraphData } from '@/hooks';
import { useUIStore } from '@/stores';
import type { GraphNode } from '@/types';
import VaultGraphNode, { type VaultNodeData, TYPE_COLORS } from './GraphNode';

const nodeTypes = { vaultNode: VaultGraphNode };

const STATUS_FILTER_COLORS: Record<string, string> = {
  done: '#10b981',
  'in-progress': '#6366f1',
  blocked: '#ef4444',
  todo: '#4b5563',
};

function circleLayout(nodes: Node[]): Node[] {
  const n = nodes.length;
  if (n === 0) return nodes;
  const radius = Math.max(200, n * 28);
  return nodes.map((node, i) => ({
    ...node,
    position: {
      x: radius * Math.cos((2 * Math.PI * i) / n),
      y: radius * Math.sin((2 * Math.PI * i) / n),
    },
  }));
}

function FilterPill({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-2 py-0.5 rounded text-xs transition-colors border',
        active
          ? 'text-white border-transparent'
          : 'bg-transparent text-neutral-500 border-neutral-700 hover:border-neutral-500',
      )}
      style={active && color ? { background: color, borderColor: color } : undefined}
    >
      {label}
    </button>
  );
}

function nodeListFromData(
  data: GraphNode[],
  activeFileId: string | null,
  linkedIds: Set<string>,
): Node[] {
  return circleLayout(
    data.map((n) => ({
      id: n.id,
      type: 'vaultNode',
      position: { x: 0, y: 0 },
      data: {
        label: n.label,
        active: n.id === activeFileId,
        linked: linkedIds.has(n.id),
        linkCount: n.linkCount,
        group: n.group,
        type: n.type,
        status: n.status,
      } satisfies VaultNodeData,
    })),
  );
}

function GraphInner() {
  const graphData = useGraphData();
  const activeFileId = useUIStore((s) => s.activeFileId);
  const setActiveFile = useUIStore((s) => s.setActiveFile);
  const { fitView } = useReactFlow();

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterTypes, setFilterTypes] = useState<Set<string>>(new Set());
  const [filterStatuses, setFilterStatuses] = useState<Set<string>>(new Set());

  const availableTypes = useMemo(() => {
    const s = new Set<string>();
    for (const n of graphData.nodes) if (n.type) s.add(n.type);
    return [...s].sort();
  }, [graphData.nodes]);

  const availableStatuses = useMemo(() => {
    const s = new Set<string>();
    for (const n of graphData.nodes) if (n.status) s.add(n.status);
    return [...s].sort();
  }, [graphData.nodes]);

  const hasFilters = filterTypes.size > 0 || filterStatuses.size > 0;
  const hasFilterOptions = availableTypes.length > 0 || availableStatuses.length > 0;

  const toggleType = (t: string) =>
    setFilterTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const toggleStatus = (s: string) =>
    setFilterStatuses((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });

  const filteredNodes = useMemo(() => {
    if (!hasFilters) return graphData.nodes;
    return graphData.nodes.filter((n) => {
      const typeOk = filterTypes.size === 0 || (n.type != null && filterTypes.has(n.type));
      const statusOk = filterStatuses.size === 0 || (n.status != null && filterStatuses.has(n.status));
      return typeOk && statusOk;
    });
  }, [graphData.nodes, filterTypes, filterStatuses, hasFilters]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(
    () => graphData.edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)),
    [graphData.edges, filteredNodeIds],
  );

  const linkedIds = useMemo(() => {
    if (!activeFileId) return new Set<string>();
    const ids = new Set<string>();
    for (const e of filteredEdges) {
      if (e.source === activeFileId) ids.add(e.target);
      if (e.target === activeFileId) ids.add(e.source);
    }
    return ids;
  }, [activeFileId, filteredEdges]);

  const builtNodes = useMemo<Node[]>(
    () => nodeListFromData(filteredNodes, activeFileId, linkedIds),
    [filteredNodes, activeFileId, linkedIds],
  );

  const builtEdges = useMemo<Edge[]>(
    () =>
      filteredEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        style: {
          stroke: e.source === activeFileId || e.target === activeFileId ? '#7c3aed' : '#2e2e3e',
          strokeWidth: e.source === activeFileId || e.target === activeFileId ? 2 : 1,
        },
        animated: e.source === activeFileId || e.target === activeFileId,
      })),
    [filteredEdges, activeFileId],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(builtNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(builtEdges);

  useEffect(() => { setNodes(builtNodes); }, [builtNodes, setNodes]);
  useEffect(() => { setEdges(builtEdges); }, [builtEdges, setEdges]);

  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  }, [filteredNodes.length, fitView]);

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => { setActiveFile(node.id); },
    [setActiveFile],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      minZoom={0.05}
      maxZoom={3}
      fitView
      colorMode="dark"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a1a26" />
      <Controls style={{ background: '#1a1a26', border: '1px solid #2e2e3e' }} />

      {hasFilterOptions && (
        <Panel position="top-right">
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors border',
                hasFilters
                  ? 'bg-violet-700 border-violet-600 text-white'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-300',
              )}
            >
              <span>⊟</span>
              <span>Filter</span>
              {hasFilters && (
                <span className="bg-white/20 rounded-full px-1.5 tabular-nums">
                  {filterTypes.size + filterStatuses.size}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="bg-neutral-900 border border-neutral-700 rounded p-3 min-w-[190px]">
                {availableTypes.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-neutral-600 uppercase tracking-wide mb-1.5">Type</p>
                    <div className="flex flex-wrap gap-1">
                      {availableTypes.map((t) => (
                        <FilterPill
                          key={t}
                          label={t}
                          active={filterTypes.has(t)}
                          color={TYPE_COLORS[t]}
                          onClick={() => toggleType(t)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {availableStatuses.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-neutral-600 uppercase tracking-wide mb-1.5">Status</p>
                    <div className="flex flex-wrap gap-1">
                      {availableStatuses.map((s) => (
                        <FilterPill
                          key={s}
                          label={s}
                          active={filterStatuses.has(s)}
                          color={STATUS_FILTER_COLORS[s]}
                          onClick={() => toggleStatus(s)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800">
                  <span className="text-xs text-neutral-700">
                    {filteredNodes.length} / {graphData.nodes.length}
                  </span>
                  {hasFilters && (
                    <button
                      onClick={() => { setFilterTypes(new Set()); setFilterStatuses(new Set()); }}
                      className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}
    </ReactFlow>
  );
}

export default function GraphCanvas() {
  return (
    <div className="w-full h-full bg-neutral-950">
      <ReactFlowProvider>
        <GraphInner />
      </ReactFlowProvider>
    </div>
  );
}
