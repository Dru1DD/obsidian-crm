import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';

export interface VaultNodeData extends Record<string, unknown> {
  label: string;
  active: boolean;
  linked: boolean;
  linkCount: number;
  group: string;
  type?: string;
  status?: string;
}

export const TYPE_COLORS: Record<string, string> = {
  task: '#f59e0b',
  project: '#6366f1',
  meeting: '#10b981',
  contact: '#ec4899',
  note: '#6b7280',
};

const STATUS_BADGE: Record<string, string> = {
  done: '#10b981',
  'in-progress': '#6366f1',
  blocked: '#ef4444',
  todo: '#4b5563',
  archived: '#374151',
};

const GROUP_COLOR_CACHE: Record<string, string> = {};

function groupColor(group: string): string {
  if (GROUP_COLOR_CACHE[group]) return GROUP_COLOR_CACHE[group];
  let hash = 0;
  for (let i = 0; i < group.length; i++) hash = group.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  const color = `hsl(${hue}, 60%, 55%)`;
  GROUP_COLOR_CACHE[group] = color;
  return color;
}

const VaultGraphNode = memo(function VaultGraphNode({ data }: NodeProps) {
  const { label, active, linked, linkCount, group, type, status } = data as VaultNodeData;
  const size = Math.max(32, Math.min(72, 32 + linkCount * 4));
  const innerColor = type ? (TYPE_COLORS[type] ?? groupColor(group)) : groupColor(group);
  const statusColor = status ? STATUS_BADGE[status] : undefined;

  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0 pointer-events-none" />
      <div
        style={{
          width: size,
          height: size,
          borderColor: active ? '#a78bfa' : linked ? innerColor : '#2e2e3e',
        }}
        className={clsx(
          'rounded-full border-2 flex items-center justify-center transition-all cursor-pointer relative',
          active ? 'bg-violet-700/50 shadow-lg shadow-violet-900/50' : linked ? 'bg-neutral-800' : 'bg-neutral-900',
        )}
      >
        <div
          style={{ width: size * 0.35, height: size * 0.35, background: active ? '#a78bfa' : innerColor }}
          className="rounded-full"
        />
        {statusColor && (
          <span
            style={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: statusColor,
              border: '1.5px solid #111',
            }}
            title={status}
          />
        )}
      </div>
      <div
        className={clsx(
          'absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap pointer-events-none',
          active ? 'text-violet-300' : 'text-neutral-500',
        )}
      >
        {label}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0 pointer-events-none" />
    </>
  );
});

export default VaultGraphNode;
