import { describe, expect, it } from 'vitest';
import { normalizeAssistantChatMessages } from '@/features/assistant/api/assistant.api';

describe('assistant.api', () => {
  it('filters out invalid assistant messages before sending the payload', () => {
    const messages = [
      { role: 'user', content: 'Hola' },
      { role: 'assistant', content: 'Hola, ¿en qué puedo ayudarte?' },
      { role: 'system', content: 'ignore' },
      { role: 'user', content: undefined },
      { role: 'assistant', content: 123 },
    ] as unknown as Array<{ role: string; content: unknown }>;

    const normalized = normalizeAssistantChatMessages(messages as any);

    expect(normalized).toEqual([
      { role: 'user', content: 'Hola' },
      { role: 'assistant', content: 'Hola, ¿en qué puedo ayudarte?' },
    ]);
  });
});
