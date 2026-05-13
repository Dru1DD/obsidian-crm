import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatStore {
  isOpen: boolean;
  apiKey: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  appendToLastMessage: (text: string) => void;
}

const STORAGE_KEY = 'obsidian_crm_claude_key';

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  apiKey: localStorage.getItem(STORAGE_KEY),
  messages: [],
  isLoading: false,
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setApiKey: (key) => {
    localStorage.setItem(STORAGE_KEY, key);
    set({ apiKey: key });
  },
  clearApiKey: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ apiKey: null, messages: [] });
  },
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] }),
  appendToLastMessage: (text) =>
    set((s) => {
      const messages = [...s.messages];
      if (messages.length === 0) return {};
      const last = messages[messages.length - 1];
      messages[messages.length - 1] = { ...last, content: last.content + text };
      return { messages };
    }),
}));
