import { Bot, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { AIChat } from '@/components/AIChat';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';
import { readSettingsAssistantContext } from '@/features/settings/hooks/openSettingsAssistant';

type AssistantLocationState = {
  assistantQueryContext?: AssistantQueryContext;
  assistantPrompt?: string;
};

export function AssistantPage() {
  const location = useLocation();
  const state = location.state as AssistantLocationState | null;
  const storedSettingsContext = readSettingsAssistantContext();
  const queryContext = useMemo(
    () => state?.assistantQueryContext ?? storedSettingsContext?.assistantQueryContext ?? ({ page: 'assistant' } as AssistantQueryContext),
    [state?.assistantQueryContext, storedSettingsContext?.assistantQueryContext],
  );
  const initialPrompt = state?.assistantPrompt ?? storedSettingsContext?.assistantPrompt ?? '';

  return (
    <div className='flex h-[calc(100vh-8rem)] min-h-[640px] flex-col'>
      <section className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='mb-2 flex items-center gap-2'>
            <span className='inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <Bot className='size-5' />
            </span>
            <p className='section-eyebrow'>Asistente IA</p>
          </div>
        </div>

        <div className='hidden rounded-2xl border border-border/70 bg-white/80 px-4 py-3 text-sm text-muted-foreground shadow-[var(--shadow-soft)] sm:flex sm:items-center sm:gap-2'>
          <Sparkles className='size-4 text-primary' />
          Interfaz conversacional
        </div>
      </section>

      {queryContext ? (
        <section className='mb-4 content-block px-4 py-3 text-sm text-muted-foreground'>
          <p className='font-medium text-foreground'>Contexto activo</p>
          <p className='mt-1'>
            {queryContext.page ? `Página: ${queryContext.page}` : 'Contexto recibido desde otra vista'}
            {queryContext.jobId ? ` · Job #${queryContext.jobId}` : ''}
            {queryContext.jobName ? ` · ${queryContext.jobName}` : ''}
          </p>
        </section>
      ) : null}

      <div className='min-h-0 flex-1'>
        <AIChat
          errors={0}
          jobId={queryContext.jobId ?? null}
          variant='fullscreen'
          queryContext={queryContext}
          initialPrompt={initialPrompt}
        />
      </div>
    </div>
  );
}
