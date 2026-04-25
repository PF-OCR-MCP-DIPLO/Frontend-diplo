import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AssistantChatProvider } from '@/features/assistant/hooks/AssistantChatContext';
import { AssistantPage } from '@/pages/assistant/AssistantPage';

vi.mock('@/components/AIChat', () => ({
  AIChat: ({ queryContext, initialPrompt }: { queryContext?: Record<string, unknown>; initialPrompt?: string }) => (
    <div data-testid='assistant-chat'>
      {JSON.stringify(queryContext ?? {})}
      {initialPrompt ? `|${initialPrompt}` : ''}
    </div>
  ),
}));

describe('AssistantPage', () => {
  it('hydrates assistant context from navigation state and exposes clear context', () => {
    render(
      <AssistantChatProvider>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/assistant',
              state: {
                assistantQueryContext: { page: 'results', jobId: 12, jobName: 'archivo.docx', selectedRowId: 'row-1' },
                assistantPrompt: 'Explícame esta fila.',
              },
            },
          ]}
        >
          <Routes>
            <Route path='/assistant' element={<AssistantPage />} />
          </Routes>
        </MemoryRouter>
      </AssistantChatProvider>,
    );

    expect(screen.getByText(/Contexto activo/i)).toBeInTheDocument();
    expect(screen.getByTestId('assistant-chat')).toHaveTextContent('"jobId":12');
    expect(screen.getByText(/Limpiar contexto/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volver a resultados/i })).toBeInTheDocument();
  });
});
