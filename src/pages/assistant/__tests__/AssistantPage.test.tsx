import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AssistantPage } from '@/pages/assistant/AssistantPage';

vi.mock('@/components/AIChat', () => ({
  AIChat: ({ queryContext }: { queryContext?: Record<string, unknown> }) => (
    <div data-testid='assistant-chat'>{JSON.stringify(queryContext ?? {})}</div>
  ),
}));

describe('AssistantPage', () => {
  it('hydrates assistant context from navigation state', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/assistant',
            state: { assistantQueryContext: { page: 'results', jobId: 12, jobName: 'archivo.docx' } },
          },
        ]}
      >
        <Routes>
          <Route path='/assistant' element={<AssistantPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Contexto activo/i)).toBeInTheDocument();
    expect(screen.getByTestId('assistant-chat')).toHaveTextContent('"jobId":12');
    expect(screen.getByTestId('assistant-chat')).toHaveTextContent('"page":"results"');
  });
});
