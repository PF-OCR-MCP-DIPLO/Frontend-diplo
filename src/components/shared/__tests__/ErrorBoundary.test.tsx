import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function BrokenComponent(): JSX.Element {
  throw new Error('Render exploded');
}

describe('ErrorBoundary', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

  beforeEach(() => {
    consoleError.mockClear();
  });

  afterEach(() => {
    consoleError.mockClear();
  });

  it('captures render errors and shows a recovery fallback', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Algo fallo al mostrar esta pantalla/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recargar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Inicio/i })).toBeInTheDocument();
  });
});
