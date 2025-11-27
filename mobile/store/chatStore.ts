import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandStorage } from '@/utils/storage';
import { ChatMessage, Citation } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentStreamingContent: string;

  addUserMessage: (content: string) => string;
  startAssistantMessage: () => string;
  appendToStream: (content: string) => void;
  finishAssistantMessage: (citations?: Citation[]) => void;
  clearMessages: () => void;
  setStreaming: (streaming: boolean) => void;
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      currentStreamingContent: '',

      addUserMessage: (content) => {
        const id = generateId();
        const message: ChatMessage = {
          id,
          role: 'user',
          content,
          timestamp: Date.now(),
        };
        set({ messages: [...get().messages, message] });
        return id;
      },

      startAssistantMessage: () => {
        const id = generateId();
        const message: ChatMessage = {
          id,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };
        set({
          messages: [...get().messages, message],
          isStreaming: true,
          currentStreamingContent: '',
        });
        return id;
      },

      appendToStream: (content) => {
        const messages = [...get().messages];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content += content;
          set({
            messages,
            currentStreamingContent: get().currentStreamingContent + content,
          });
        }
      },

      finishAssistantMessage: (citations) => {
        const messages = [...get().messages];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.citations = citations;
          set({
            messages,
            isStreaming: false,
            currentStreamingContent: '',
          });
        }
      },

      clearMessages: () => set({ messages: [], isStreaming: false }),

      setStreaming: (streaming) => set({ isStreaming: streaming }),
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => createZustandStorage()),
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
      }),
    }
  )
);
