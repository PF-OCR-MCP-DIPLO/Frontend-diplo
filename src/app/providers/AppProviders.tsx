/**
 * Agrupa los providers globales de la aplicación.
 *
 * Mantiene disponibles el estado de procesamiento, el contexto del asistente,
 * el router y el sistema de notificaciones en toda la SPA.
 *
 * @param children - Arbol React que debe recibir los contextos globales.
 *
 * @remarks
 * El orden de los providers importa: el estado de dominio se resuelve antes
 * que el router porque varias acciones iniciales dependen de `window.location`
 * y del almacenamiento local.
 */
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AssistantChatProvider } from '@/features/assistant/hooks/AssistantChatContext';
import { ProcessingProvider } from '@/features/processing/hooks/ProcessingProvider';

/**
 * Monta los providers compartidos por toda la SPA.
 */
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
