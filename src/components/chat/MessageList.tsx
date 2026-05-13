import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import type { ChatMessage } from '@/stores/chat.store';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 gap-2 px-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-sm text-center">Ask anything about your vault</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={clsx(
            'flex',
            msg.role === 'user' ? 'justify-end' : 'justify-start',
          )}
        >
          <div
            className={clsx(
              'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-violet-600 text-white rounded-tr-sm'
                : 'bg-neutral-800 text-neutral-100 rounded-tl-sm',
            )}
          >
            <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-neutral-800 rounded-2xl rounded-tl-sm px-3 py-2">
            <span className="flex gap-1 items-center h-4">
              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
