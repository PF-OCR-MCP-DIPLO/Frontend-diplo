import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AIChat } from '@/components/AIChat';

const setQueryContextMock = vi.fn();
const state = {
  messages: [],
  setMessages: vi.fn(),
  clearChat: vi.fn(),
  input: '',
  setInput: vi.fn(),
  isSending: false,
  setIsSending: vi.fn(),
  queryContext: { page: 'assistant', contextScope: 'general', jobId: 3 },
  setQueryContext: setQueryContextMock,
};

vi.mock('@/features/assistant/hooks/AssistantChatContext', async () => {
  const actual = await vi.importActual<typeof import('@/features/assistant/hooks/AssistantChatContext')>(
    '@/features/assistant/hooks/AssistantChatContext',
  );
  return {
    ...actual,
    useAssistantChatContext: () => state,
  };
});

describe('AIChat context sync', () => {
  beforeEach(() => {
    setQueryContextMock.mockReset();
  });

  it('does not resync equivalent query contexts repeatedly', () => {
    const { rerender } = render(
      <MemoryRouter>
        <AIChat
          errors={0}
          jobId={3}
          queryContext={{ page: 'assistant', contextScope: 'general', jobId: 3 }}
        />
      </MemoryRouter>,
    );

    rerender(
      <MemoryRouter>
        <AIChat
          errors={0}
          jobId={3}
          queryContext={{ contextScope: 'general', jobId: 3, page: 'assistant' }}
        />
      </MemoryRouter>,
    );

    expect(setQueryContextMock).not.toHaveBeenCalled();
  });
});
