import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphData } from '@/hooks';
import { useUIStore } from '@/stores';
import VaultGraphNode, { type VaultNodeData } from './GraphNode';

const nodeTypes = { vaultNode: VaultGraphNode };

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

function GraphInner() {
  const graphData = useGraphData();
  const activeFileId = useUIStore((s) => s.activeFileId);
  const setActiveFile = useUIStore((s) => s.setActiveFile);
  const { fitView } = useReactFlow();

  const linkedIds = useMemo(() => {
    if (!activeFileId) return new Set<string>();
    const ids = new Set<string>();
    for (const e of graphData.edges) {
      if (e.source === activeFileId) ids.add(e.target);
      if (e.target === activeFileId) ids.add(e.source);
    }
    return ids;
  }, [activeFileId, graphData.edges]);

  const builtNodes = useMemo<Node[]>(() => {
    const raw: Node[] = graphData.nodes.map((n) => ({
      id: n.id,
      type: 'vaultNode',
      position: { x: 0, y: 0 },
      data: {
        label: n.label,
        active: n.id === activeFileId,
        linked: linkedIds.has(n.id),
        linkCount: n.linkCount,
        group: n.group,
      } satisfies VaultNodeData,
    }));
    return circleLayout(raw);
  }, [graphData.nodes, activeFileId, linkedIds]);

  const builtEdges = useMemo<Edge[]>(() => graphData.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    style: {
      stroke: e.source === activeFileId || e.target === activeFileId ? '#7c3aed' : '#2e2e3e',
      strokeWidth: e.source === activeFileId || e.target === activeFileId ? 2 : 1,
    },
    animated: e.source === activeFileId || e.target === activeFileId,
  })), [graphData.edges, activeFileId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(builtNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(builtEdges);

  useEffect(() => { setNodes(builtNodes); }, [builtNodes, setNodes]);
  useEffect(() => { setEdges(builtEdges); }, [builtEdges, setEdges]);

  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  }, [graphData.nodes.length, fitView]);

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setActiveFile(node.id);
  }, [setActiveFile]);

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
