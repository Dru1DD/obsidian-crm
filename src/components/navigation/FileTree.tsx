import type { VaultFolder } from '@/types';
import FileTreeNode from './FileTreeNode';

interface Props {
  folder: VaultFolder;
}

export default function FileTree({ folder }: Props) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      {folder.children.map((child) => (
        <FileTreeNode key={child.id} node={child} depth={0} />
      ))}
    </div>
  );
}
