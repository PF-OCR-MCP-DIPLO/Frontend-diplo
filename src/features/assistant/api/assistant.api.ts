/**
 * Cliente del endpoint de chat del asistente.
 *
 * Envía el historial conversacional y contexto opcional de trabajo para que el
 * backend pueda responder con datos y metadatos de depuración.
 *
 * @remarks
 * El backend espera contexto de job opcional y un conteo de errores para
 * adaptar la respuesta al estado de la corrida.
 */
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
  query_context: AssistantQueryContext;
  show_debug_details: boolean;
}

/**
 * Envía una conversación al asistente del backend.
 *
 * @param messages - Historial mínimo de conversación.
 * @param options - Contexto opcional de job y diagnóstico.
 * @returns Respuesta del asistente con metadatos de depuración.
 */
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
