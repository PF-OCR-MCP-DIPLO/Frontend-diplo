import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssistantChatProvider } from '@/features/assistant/hooks/AssistantChatContext';
import { AIChat } from '@/components/AIChat';

const sendAssistantChatMock = vi.fn();

vi.mock('@/features/assistant/api/assistant.api', () => ({
  sendAssistantChat: (...args: unknown[]) => sendAssistantChatMock(...args),
}));

describe('AIChat', () => {
  beforeEach(() => {
    sendAssistantChatMock.mockReset();
    window.localStorage.clear();
  });

  function renderChat() {
    return render(
      <AssistantChatProvider>
        <AIChat errors={2} jobId={8} queryContext={{ page: 'results', jobId: 8, contextScope: 'job' }} />
      </AssistantChatProvider>,
    );
  }

  it('renders the main chat layout with compact context and suggestions', () => {
    renderChat();

    expect(screen.getByRole('heading', { name: 'Asistente' })).toBeInTheDocument();
    expect(screen.getByText(/Contexto: Job #8/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByText(/"jobId"/)).not.toBeInTheDocument();
  });

  it('sends a message with Enter and renders the reply', async () => {
    sendAssistantChatMock.mockResolvedValueOnce({
      reply: 'Hola, claro.',
      tool: 'none',
      data: { kind: 'none' },
      query_context: {},
    });

    renderChat();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hola' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(sendAssistantChatMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Hola, claro.')).toBeInTheDocument();
  });

  it('keeps shift enter for new lines', () => {
    renderChat();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hola' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });

    expect(sendAssistantChatMock).not.toHaveBeenCalled();
  });
});
