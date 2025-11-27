import { useCallback, useRef } from 'react';
import { api } from '@/services/api';
import { useChatStore, useWeatherStore } from '@/store';
import { Citation } from '@/types';

export function useChat() {
  const {
    messages,
    isStreaming,
    addUserMessage,
    startAssistantMessage,
    appendToStream,
    finishAssistantMessage,
    clearMessages,
    setStreaming,
  } = useChatStore();

  const { currentLocation } = useWeatherStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim()) return;

      // Add user message
      addUserMessage(content.trim());

      // Prepare history for API (last 6 messages)
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Start assistant message
      startAssistantMessage();

      try {
        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        // Stream the response
        const stream = api.streamChat(
          content.trim(),
          history,
          currentLocation.name,
          currentLocation.lat,
          currentLocation.lon
        );

        let citations: Citation[] = [];

        for await (const event of stream) {
          if (event.type === 'token' && event.content) {
            appendToStream(event.content);
          } else if (event.type === 'citations' && event.citations) {
            citations = event.citations as Citation[];
          } else if (event.type === 'done') {
            break;
          } else if (event.type === 'error') {
            appendToStream(`\n\nError: ${event.message}`);
            break;
          }
        }

        finishAssistantMessage(citations);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to get response';
        appendToStream(`\n\nError: ${errorMessage}`);
        finishAssistantMessage([]);
      }
    },
    [
      isStreaming,
      messages,
      currentLocation,
      addUserMessage,
      startAssistantMessage,
      appendToStream,
      finishAssistantMessage,
    ]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreaming(false);
    }
  }, [setStreaming]);

  return {
    messages,
    isStreaming,
    sendMessage,
    cancelStream,
    clearMessages,
  };
}
