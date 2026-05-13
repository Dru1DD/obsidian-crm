import { useRef, useState } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { useVaultStore } from '@/stores';
import { streamChat } from '@/lib/claude';
import ApiKeySetup from './ApiKeySetup';
import MessageList from './MessageList';

export default function ChatWindow() {
  const { apiKey, messages, isLoading, addMessage, appendToLastMessage, setLoading, clearMessages, clearApiKey } =
    useChatStore();
  const vault = useVaultStore((s) => s.vault);

  const [input, setInput] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !apiKey || !vault) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: Date.now(),
    };

    addMessage(userMsg);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const assistantMsg = {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: '',
      timestamp: Date.now(),
    };
    addMessage(assistantMsg);
    setLoading(true);

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    abortRef.current = new AbortController();

    try {
      await streamChat(apiKey, vault, apiMessages, appendToLastMessage, abortRef.current.signal);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        appendToLastMessage(`\n\n[Error: ${err.message}]`);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  if (!apiKey) return <ApiKeySetup />;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 shrink-0">
        <span className="text-xs font-semibold text-neutral-300 tracking-wide">Claude</span>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              title="Clear conversation"
              className="text-neutral-600 hover:text-neutral-400 transition-colors text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={clearApiKey}
            title="Remove API key"
            className="text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input */}
      <div className="shrink-0 px-3 pb-3 pt-2 border-t border-neutral-800">
        <div className="flex gap-2 items-end bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 focus-within:border-violet-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your vault…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-neutral-100 placeholder-neutral-600 resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: 140 }}
          />
          {isLoading ? (
            <button
              onClick={handleStop}
              className="shrink-0 mb-0.5 text-neutral-500 hover:text-neutral-300 transition-colors"
              title="Stop"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0 mb-0.5 text-violet-500 hover:text-violet-400 disabled:text-neutral-700 transition-colors"
              title="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22,2 15,22 11,13 2,9" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-[10px] text-neutral-700 mt-1.5 text-center">Shift+Enter for newline</p>
      </div>
    </div>
  );
}
