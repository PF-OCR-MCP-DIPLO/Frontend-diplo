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
        <AIChat errors={errors} jobId={jobId} variant='compact' queryContext={queryContext} />
      </div>
    );
  }

  return <AIChat errors={errors} jobId={jobId} variant='compact' queryContext={queryContext} />;
}
