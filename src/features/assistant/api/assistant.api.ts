import { httpRequest } from '@/services/http/client';

export interface AssistantChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantChatResponse {
  reply: string;
  tool: string;
  data: unknown;
  query_context: Record<string, unknown>;
}

export function sendAssistantChat(
  messages: AssistantChatMessage[],
  options?: { jobId?: number | null; errors?: number; queryContext?: Record<string, unknown> },
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