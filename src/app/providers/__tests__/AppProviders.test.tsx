import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid='router'>{children}</div>,
  };
});

vi.mock('@/features/processing/hooks/ProcessingProvider', () => ({
  ProcessingProvider: ({ children }: { children: React.ReactNode }) => <div data-testid='processing-provider'>{children}</div>,
}));

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid='toaster' />,
}));

describe('AppProviders', () => {
  it('wraps children with providers and router', () => {
    render(
      <AppProviders>
        <div>child</div>
      </AppProviders>
    );
    expect(screen.getByTestId('processing-provider')).toBeInTheDocument();
    expect(screen.getByTestId('router')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});

