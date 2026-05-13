import type { Vault } from '@/types/vault';
import type { GraphData, GraphEdge, GraphNode } from '@/types/graph';

export function buildGraphData(vault: Vault): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  for (const file of vault.files.values()) {
    const fm = file.frontmatter;
    const type = fm.type as string | undefined;
    const status = fm.status as string | undefined;
    const rawTags = fm.tags;
    const tags = Array.isArray(rawTags) ? (rawTags as string[]) : undefined;

    nodes.push({
      id: file.id,
      label: file.name,
      path: file.path,
      linkCount: file.outlinks.length + file.backlinks.length,
      group: type ?? file.path.split('/')[0] ?? 'root',
      type,
      status,
      tags,
    });

    for (const targetId of file.outlinks) {
      const edgeId = `${file.id}→${targetId}`;
      if (!edgeSet.has(edgeId)) {
        edgeSet.add(edgeId);
        edges.push({ id: edgeId, source: file.id, target: targetId });
      }
    }
  }

  return { nodes, edges };
}
