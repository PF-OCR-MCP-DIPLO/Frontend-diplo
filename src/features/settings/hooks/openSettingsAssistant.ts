/**
 * Abre el asistente desde settings preservando el contexto actual.
 *
 * La intención es transportar la configuración o la pregunta inicial a la
 * pantalla del asistente sin perder el punto de entrada.
 */
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';

const SETTINGS_ASSISTANT_KEY = 'assistant_settings_context_v1';

export function openSettingsAssistant(context: AssistantQueryContext, prompt: string) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(
      SETTINGS_ASSISTANT_KEY,
      JSON.stringify({ assistantQueryContext: context, assistantPrompt: prompt }),
    );
    window.location.assign('/assistant');
  }
}

export function readSettingsAssistantContext() {
  if (typeof window === 'undefined') return null;

  const rawValue = window.sessionStorage.getItem(SETTINGS_ASSISTANT_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as {
      assistantQueryContext?: AssistantQueryContext;
      assistantPrompt?: string;
    };
    window.sessionStorage.removeItem(SETTINGS_ASSISTANT_KEY);
    return parsed;
  } catch {
    window.sessionStorage.removeItem(SETTINGS_ASSISTANT_KEY);
    return null;
  }
}
