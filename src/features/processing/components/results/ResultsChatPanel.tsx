import { AIChat } from '@/components/AIChat';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';

export function ResultsChatPanel({
  errors,
  jobId = null,
  queryContext,
  className,
}: {
  errors: number;
  jobId?: number | null;
  queryContext?: AssistantQueryContext;
  className?: string;
}) {
  if (className) {
    return (
      <div className={className}>
        <AIChat errors={errors} jobId={jobId} queryContext={queryContext} />
      </div>
    );
  }

  return (
    <div className='surface-card overflow-hidden'>
      <div className='panel-header'>
        <p className='panel-title'>Asistente de revision</p>
        <p className='mt-1 panel-copy'>Ayuda contextual para revisar {errors} hallazgo{errors === 1 ? '' : 's'}.</p>
      </div>
      <div className='h-[320px] sm:h-[400px]'>
        <AIChat errors={errors} jobId={jobId} queryContext={queryContext} />
      </div>
    </div>
  );
}
