import { ArrowLeft, Bot, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AIChat } from '@/components/AIChat';
import { Button } from '@/components/ui/button';
import { areAssistantContextsEqual, useAssistantChatContext } from '@/features/assistant/hooks/AssistantChatContext';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';
import { readSettingsAssistantContext } from '@/features/settings/hooks/openSettingsAssistant';

type AssistantLocationState = {
  assistantQueryContext?: AssistantQueryContext;
  assistantPrompt?: string;
};

function formatActiveContext(context: AssistantQueryContext) {
  const parts = [`Contexto: Job #${context.jobId ?? '—'}`];
  if (context.selectedRowId) parts.push(`Fila ${context.selectedRowId}`);
  if (context.selectedField) parts.push(`Campo ${context.selectedField}`);
  if (context.currentImageId) parts.push(`Imagen ${context.currentImageId}`);
  return parts.join(' · ');
}

export function AssistantPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as AssistantLocationState | null;
  const storedSettingsContext = readSettingsAssistantContext();
  const { queryContext, setQueryContext } = useAssistantChatContext();

  const incomingContext = useMemo(
    () => state?.assistantQueryContext ?? storedSettingsContext?.assistantQueryContext ?? {},
    [state?.assistantQueryContext, storedSettingsContext?.assistantQueryContext],
  );
  const initialPrompt = state?.assistantPrompt ?? storedSettingsContext?.assistantPrompt ?? '';
  const activeContext = useMemo(() => {
    const merged = { ...queryContext, ...incomingContext };
    return areAssistantContextsEqual(queryContext, merged) ? queryContext : merged;
  }, [incomingContext, queryContext]);

  const handleClearContext = () => {
    setQueryContext({ page: 'assistant', contextScope: 'general' });
  };

  return (
    <div className='flex min-h-[calc(100vh-6rem)] flex-col gap-3'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <span className='inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <Bot className='size-5' />
          </span>
          <div>
            <h1 className='text-lg font-semibold text-foreground'>Asistente</h1>
            <p className='text-sm text-muted-foreground'>{formatActiveContext(activeContext)}</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button type='button' variant='outline' size='sm' className='h-8 px-3 text-xs' onClick={handleClearContext}>
            Limpiar contexto
          </Button>
          {state?.assistantQueryContext?.page === 'results' || storedSettingsContext?.assistantQueryContext?.page === 'results' ? (
            <Button type='button' variant='ghost' size='sm' className='h-8 px-3 text-xs text-muted-foreground' onClick={() => navigate('/results')}>
              <ArrowLeft className='size-4' />
              Volver a resultados
            </Button>
          ) : null}
        </div>
      </div>

      <div className='rounded-2xl border border-border/70 bg-surface-subtle px-4 py-3 text-sm text-muted-foreground'>
        <div className='flex items-center gap-2'>
          <Sparkles className='size-4 text-primary' />
          <span>Contexto activo</span>
        </div>
        <p className='mt-1'>{formatActiveContext(activeContext)}</p>
      </div>

      <div className='min-h-0 flex-1'>
        <AIChat errors={0} jobId={activeContext.jobId ?? null} variant='fullscreen' queryContext={activeContext} initialPrompt={initialPrompt} />
      </div>
    </div>
  );
}
