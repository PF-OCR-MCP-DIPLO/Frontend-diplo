import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
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
    HTMLElement.prototype.scrollTo = vi.fn();
  });

  function renderChat(props?: Partial<ComponentProps<typeof AIChat>>) {
    return render(
      <AssistantChatProvider>
        <AIChat errors={props?.errors ?? 0} jobId={props?.jobId ?? null} variant={props?.variant ?? 'panel'} />
      </AssistantChatProvider>,
    );
  }

  it('renders the initial assistant prompt and suggestions', () => {
    renderChat({ jobId: 8, errors: 2 });

    expect(screen.getByLabelText('Asistente IA')).toBeInTheDocument();
    expect(screen.getByText('Contexto: Job #8')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /¿Qué puedes hacer\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver errores de este job/i })).toBeInTheDocument();
  });

  it('sends a message with Enter and shows the assistant reply', async () => {
    sendAssistantChatMock.mockResolvedValueOnce({
      reply: 'Hola, claro.',
      tool: 'none',
      data: { kind: 'none' },
      query_context: {},
    });

    renderChat();

    const input = screen.getByPlaceholderText('Escribe tu pregunta...');
    fireEvent.change(input, { target: { value: 'hola' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(sendAssistantChatMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Hola, claro.')).toBeInTheDocument();
  });

  it('renders list_jobs as cards or table and keeps technical json collapsed', async () => {
    sendAssistantChatMock.mockResolvedValueOnce({
      reply: 'Encontré jobs recientes.',
      tool: 'list_jobs',
      data: [
        {
          id: 1,
          original_filename: 'archivo.docx',
          status: 'completed',
          total_images: 2,
          total_records: 10,
          created_at: '2026-04-24T10:00:00Z',
        },
      ],
      query_context: {},
    });

    renderChat();

    fireEvent.click(screen.getByRole('button', { name: /Listar jobs recientes/i }));

    await waitFor(() => expect(screen.getByText('Encontré jobs recientes.')).toBeInTheDocument());
    expect(screen.getByText('archivo.docx')).toBeInTheDocument();
    expect(screen.getByText('Herramienta: list_jobs')).toBeInTheDocument();
    expect(screen.queryByText(/"original_filename"/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ver detalles técnicos/i }));
    expect(screen.getByText(/"original_filename"/i)).toBeInTheDocument();
  });

  it('renders get_processing_settings as a readable summary', async () => {
    sendAssistantChatMock.mockResolvedValueOnce({
      reply: 'Configuración lista.',
      tool: 'get_processing_settings',
      data: {
        ocr_mode: 'vision',
        ocr_provider: 'ollama',
        ocr_model: 'gemma4:e2b',
        llm_provider: 'ollama',
        llm_model: 'gemma4:e2b',
        assistant_provider: 'ollama',
        assistant_model: 'gemma4:e2b',
        request_timeout_seconds: 120,
      },
      query_context: {},
    });

    renderChat();

    fireEvent.click(screen.getByRole('button', { name: /Ver configuración/i }));

    await waitFor(() => expect(screen.getByText('Configuración lista.')).toBeInTheDocument());
    expect(screen.getByText('Chatbot')).toBeInTheDocument();
    expect(screen.getAllByText(/gemma4:e2b/).length).toBeGreaterThan(0);
  });

  it('supports shift enter without sending', () => {
    renderChat();
    const input = screen.getByPlaceholderText('Escribe tu pregunta...');
    fireEvent.change(input, { target: { value: 'hola' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(sendAssistantChatMock).not.toHaveBeenCalled();
  });
});
