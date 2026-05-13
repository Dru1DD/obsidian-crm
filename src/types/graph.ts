export interface GraphNode {
  id: string;
  label: string;
  path: string;
  linkCount: number;
  group: string;
  type?: string;
  status?: string;
  tags?: string[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
