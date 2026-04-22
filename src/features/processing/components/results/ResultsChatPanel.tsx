import { AIChat } from '@/components/AIChat';

export function ResultsChatPanel({
  errors,
  jobId = null,
  className,
}: {
  errors: number;
  jobId?: number | null;
  className?: string;
}) {
  return (
    <div className={className ?? 'h-[320px] sm:h-[400px]'}>
      <AIChat errors={errors} jobId={jobId} />
    </div>
  );
}
