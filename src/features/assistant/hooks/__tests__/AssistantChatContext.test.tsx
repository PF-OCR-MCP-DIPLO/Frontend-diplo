import { describe, expect, it } from 'vitest';
import { areAssistantContextsEqual } from '@/features/assistant/hooks/AssistantChatContext';

describe('AssistantChatContext', () => {
  it('compares equivalent assistant contexts as equal', () => {
    expect(
      areAssistantContextsEqual(
        { page: 'assistant', jobId: 1, contextScope: 'general' },
        { contextScope: 'general', jobId: 1, page: 'assistant' },
      ),
    ).toBe(true);
  });
});
