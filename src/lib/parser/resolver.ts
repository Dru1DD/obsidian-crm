import type { VaultFile } from '@/types';

// Build a name → [fileId, ...] index for shortest-path resolution (Obsidian behavior)
function buildNameIndex(files: Map<string, VaultFile>): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const file of files.values()) {
    const name = file.name.toLowerCase();
    if (!index.has(name)) index.set(name, []);
    index.get(name)!.push(file.id);
  }
  return index;
}

function resolveLink(raw: string, nameIndex: Map<string, string[]>): string | null {
  // Normalize: strip path separators, lowercase, trim
  const name = raw.split('/').pop()!.toLowerCase().trim();
  const candidates = nameIndex.get(name);
  if (!candidates || candidates.length === 0) return null;
  // If multiple matches, prefer exact path match, else first
  const exactId = raw.replace(/\\/g, '/').replace(/\.md$/i, '');
  if (candidates.includes(exactId)) return exactId;
  return candidates[0];
}

export function resolveLinks(files: Map<string, VaultFile>): void {
  const nameIndex = buildNameIndex(files);

  for (const file of files.values()) {
    const resolvedOutlinks: string[] = [];

    for (const raw of file.outlinks) {
      const resolved = resolveLink(raw, nameIndex);
      if (resolved && resolved !== file.id) {
        resolvedOutlinks.push(resolved);
        // Add backlink to target
        const target = files.get(resolved);
        if (target && !target.backlinks.includes(file.id)) {
          target.backlinks.push(file.id);
        }
      }
    }

    file.outlinks = [...new Set(resolvedOutlinks)];
  }
}
