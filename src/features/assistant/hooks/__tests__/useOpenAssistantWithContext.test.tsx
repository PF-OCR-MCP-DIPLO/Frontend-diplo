import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useOpenAssistantWithContext } from '@/features/assistant/hooks/useOpenAssistantWithContext';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('useOpenAssistantWithContext', () => {
  it('navigates to assistant with query context and prompt', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;
    const { result } = renderHook(() => useOpenAssistantWithContext(), { wrapper });

    result.current({
      prompt: 'Explícame esta fila.',
      context: { page: 'results', jobId: 10, contextScope: 'row' },
    });

    expect(navigateMock).toHaveBeenCalledWith('/assistant', {
      state: {
        assistantQueryContext: { page: 'results', jobId: 10, contextScope: 'row' },
        assistantPrompt: 'Explícame esta fila.',
      },
    });
  });
});
