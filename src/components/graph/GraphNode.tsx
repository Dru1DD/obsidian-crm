import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';

export interface VaultNodeData extends Record<string, unknown> {
  label: string;
  active: boolean;
  linked: boolean;
  linkCount: number;
  group: string;
}

const GROUP_COLORS: Record<string, string> = {
  default: '#7c3aed',
};

function groupColor(group: string): string {
  // Hash group name to a hue
  if (GROUP_COLORS[group]) return GROUP_COLORS[group];
  let hash = 0;
  for (let i = 0; i < group.length; i++) hash = group.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  const color = `hsl(${hue}, 60%, 55%)`;
  GROUP_COLORS[group] = color;
  return color;
}

const VaultGraphNode = memo(function VaultGraphNode({ data }: NodeProps) {
  const nodeData = data as VaultNodeData;
  const { label, active, linked, linkCount, group } = nodeData;
  const size = Math.max(32, Math.min(72, 32 + linkCount * 4));
  const color = groupColor(group);

  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0 pointer-events-none" />
      <div
        style={{ width: size, height: size, borderColor: active ? '#a78bfa' : linked ? color : '#2e2e3e' }}
        className={clsx(
          'rounded-full border-2 flex items-center justify-center transition-all cursor-pointer',
          active ? 'bg-violet-700/50 shadow-lg shadow-violet-900/50' : linked ? 'bg-neutral-800' : 'bg-neutral-900',
        )}
      >
        <div style={{ width: size * 0.35, height: size * 0.35, background: active ? '#a78bfa' : color }} className="rounded-full" />
      </div>
      <div className={clsx(
        'absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap pointer-events-none',
        active ? 'text-violet-300' : 'text-neutral-500',
      )}>
        {label}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0 pointer-events-none" />
    </>
  );
});

export default VaultGraphNode;
