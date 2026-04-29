import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AssistantChatProvider } from '@/features/assistant/hooks/AssistantChatContext';
import { AssistantPage } from '@/pages/assistant/AssistantPage';

// AL PRINCIPIO DEL ARCHIVO DE TEST
type MockAIChatProps = {
  queryContext?: {
    jobId?: number | string | null;
    selectedRowId?: number | string | null;
    [key: string]: unknown;
  };
  initialPrompt?: string;
  onClearContext?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
};

vi.mock('@/components/AIChat', () => ({
  AIChat: ({
    queryContext,
    initialPrompt,
    onClearContext,
    showBackButton,
    onBack,
  }: MockAIChatProps) => (
    <div data-testid="assistant-chat">
      <div>
        Contexto: Job #{queryContext?.jobId} · Fila {queryContext?.selectedRowId}
      </div>

      <button onClick={onClearContext}>Limpiar contexto</button>

      {showBackButton && <button onClick={onBack}>Volver a resultados</button>}

      {JSON.stringify(queryContext)}|{initialPrompt}
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

    expect(screen.getByText(/Contexto: Job #12 · Fila row-1/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Limpiar contexto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volver a resultados/i })).toBeInTheDocument();
  });
});
