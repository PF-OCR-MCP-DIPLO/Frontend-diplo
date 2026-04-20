import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ProcessingProvider } from '@/features/processing/hooks/ProcessingProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProcessingProvider>
      <BrowserRouter>
        {children}
        <Toaster />
      </BrowserRouter>
    </ProcessingProvider>
  );
}
