import { load, dump } from 'js-yaml';
import type { VaultFile } from '@/types';

function normalizeDates(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      v instanceof Date ? v.toISOString().slice(0, 10) : v,
    ]),
  );
}

function extractFrontmatterBlock(content: string): { yaml: string; body: string } | null {
  if (!content.startsWith('---')) return null;
  const closeIdx = content.indexOf('\n---', 3);
  if (closeIdx === -1) return null;
  const yaml = content.slice(3, closeIdx).trim();
  const afterClose = closeIdx + 4;
  const bodyStart = content.indexOf('\n', afterClose);
  const body = bodyStart === -1 ? '' : content.slice(bodyStart + 1);
  return { yaml, body };
}

function parseYaml(yaml: string): Record<string, unknown> {
  try {
    const result = load(yaml);
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      return normalizeDates(result as Record<string, unknown>);
    }
  } catch {}
  return {};
}

export function parseFrontmatter(files: Map<string, VaultFile>): void {
  for (const file of files.values()) {
    const block = extractFrontmatterBlock(file.content);
    file.frontmatter = block ? parseYaml(block.yaml) : {};
  }
}

export function updateFrontmatterFields(
  content: string,
  updates: Record<string, unknown>,
): string {
  const block = extractFrontmatterBlock(content);
  const existing = block ? parseYaml(block.yaml) : {};
  const body = block ? block.body : content;
  const newData = normalizeDates({ ...existing, ...updates });
  return `---\n${dump(newData, { lineWidth: -1 })}---\n${body}`;
}

export function deleteFrontmatterField(content: string, key: string): string {
  const block = extractFrontmatterBlock(content);
  const existing = block ? parseYaml(block.yaml) : {};
  const body = block ? block.body : content;
  const newData = normalizeDates({ ...existing });
  delete newData[key];
  if (Object.keys(newData).length === 0) return body;
  return `---\n${dump(newData, { lineWidth: -1 })}---\n${body}`;
}

export function parseFrontmatterFromContent(content: string): Record<string, unknown> {
  const block = extractFrontmatterBlock(content);
  return block ? parseYaml(block.yaml) : {};
}
