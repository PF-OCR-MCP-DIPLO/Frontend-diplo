import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResultsChatPanel } from '@/features/processing/components/results/ResultsChatPanel';

const aiChatMock = vi.fn();

vi.mock('@/components/AIChat', () => ({
  AIChat: (props: unknown) => aiChatMock(props),
}));

describe('ResultsChatPanel', () => {
  it('passes the active job id to AIChat', () => {
    render(<ResultsChatPanel errors={3} jobId={42} />);

    expect(screen.getByText(/Asistente de revision/i)).toBeInTheDocument();
    expect(aiChatMock).toHaveBeenCalledWith(
      expect.objectContaining({ errors: 3, jobId: 42 }),
    );
  });
});
