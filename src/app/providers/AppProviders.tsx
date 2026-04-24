import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AssistantChatProvider } from '@/features/assistant/hooks/AssistantChatContext';
import { ProcessingProvider } from '@/features/processing/hooks/ProcessingProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProcessingProvider>
      <AssistantChatProvider>
        <BrowserRouter>
          {children}
          <Toaster />
        </BrowserRouter>
      </AssistantChatProvider>
    </ProcessingProvider>
  );
}
