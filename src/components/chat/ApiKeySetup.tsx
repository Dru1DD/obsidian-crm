import { useState } from 'react';
import { useChatStore } from '@/stores/chat.store';

export default function ApiKeySetup() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const setApiKey = useChatStore((s) => s.setApiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      setError('Key should start with sk-ant-');
      return;
    }
    setApiKey(trimmed);
  };

  return (
    <div className="flex flex-col gap-4 p-6 h-full justify-center">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-neutral-100">Claude API Key</span>
        <span className="text-xs text-neutral-500">
          Enter your Anthropic API key to chat with your vault. The key is stored only in your browser.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          placeholder="sk-ant-..."
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-colors"
          autoFocus
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
        <button
          type="submit"
          disabled={!value.trim()}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          Save & Start Chatting
        </button>
      </form>

      <a
        href="https://console.anthropic.com/settings/keys"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-violet-400 hover:text-violet-300 transition-colors text-center"
      >
        Get an API key →
      </a>
    </div>
  );
}
