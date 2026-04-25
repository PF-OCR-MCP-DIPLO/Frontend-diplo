import { httpRequest } from '@/services/http/client';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';

export interface AssistantChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantChatResponse {
  message: string;
  reply: string;
  tool: string;
  data: unknown;
  query_context: Record<string, unknown>;
  show_debug_details: boolean;
}

export function sendAssistantChat(
  messages: AssistantChatMessage[],
  options?: { jobId?: number | null; errors?: number; queryContext?: AssistantQueryContext },
) {
  return httpRequest<AssistantChatResponse>('assistant/chat/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      job_id: options?.jobId ?? null,
      errors: options?.errors ?? 0,
      query_context: options?.queryContext ?? {},
    }),
  });
}
