import matter from 'gray-matter';
import type { VaultFile } from '@/types';

export function parseFrontmatter(files: Map<string, VaultFile>): void {
  for (const file of files.values()) {
    try {
      const { data } = matter(file.content);
      file.frontmatter = data as Record<string, unknown>;
    } catch {
      file.frontmatter = {};
    }
  }
}
