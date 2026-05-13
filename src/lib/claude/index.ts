import Anthropic from '@anthropic-ai/sdk';
import type { Vault } from '@/types';

const MAX_CONTEXT_CHARS = 120_000;

function buildSystemPrompt(vault: Vault): string {
  const parts: string[] = [
    'You are an AI assistant with access to the user\'s knowledge base (Obsidian vault). Answer questions based on the notes below. When referencing specific notes, mention the file name.\n',
    'KNOWLEDGE BASE:',
  ];

  let total = 0;
  for (const file of vault.files.values()) {
    if (!file.content.trim()) continue;
    const entry = `\n=== ${file.path} ===\n${file.content}`;
    if (total + entry.length > MAX_CONTEXT_CHARS) break;
    parts.push(entry);
    total += entry.length;
  }

  return parts.join('\n');
}

export async function streamChat(
  apiKey: string,
  vault: Vault,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  onText: (delta: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const stream = await client.messages.stream(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: buildSystemPrompt(vault),
      messages,
    },
    { signal },
  );

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      onText(event.delta.text);
    }
  }
}
