import { Loader2 } from 'lucide-react';
import {
  useProcessingCurrentResultContext,
  useProcessingFlagsContext,
} from '@/features/processing/hooks/useProcessingContext';

export function ProcessingHeaderProgress() {
  const { currentResults } = useProcessingCurrentResultContext();
  const { isProcessing } = useProcessingFlagsContext();

  if (!currentResults || (!isProcessing && currentResults.status !== 'processing')) {
    return null;
  }

  const processingState = currentResults.processingState ?? null;
  const totalImages = processingState?.total_images ?? currentResults.totalImages;
  const processedImages = processingState?.processed_images ?? 0;
  const hasKnownTotal = totalImages > 0;

  const displayPercent = hasKnownTotal
    ? Math.min(100, Math.round((processedImages / totalImages) * 100))
    : null;

  const barPercent = displayPercent === null ? null : Math.max(6, displayPercent);
  const currentImage = hasKnownTotal ? Math.min(processedImages + 1, totalImages) : 1;

  const progressLabel = processingState
    ? `Procesando imagen ${currentImage}/${totalImages}`
    : `Preparando ejecución #${currentResults.jobId}`;

  const stageLabel = processingState?.current_stage ?? 'iniciando';
  const elapsedLabel = processingState?.elapsed_ms
    ? `${Math.round(processingState.elapsed_ms / 1000)}s`
    : null;

  return (
    <div
      className='pointer-events-none absolute left-1/2 top-1/2 hidden w-[min(520px,44vw)] -translate-x-1/2 -translate-y-1/2 xl:block'
      role='status'
      aria-live='polite'
    >
      <div className='rounded-full border border-primary/15 bg-card/92 px-4 py-2 shadow-[var(--shadow-soft)] backdrop-blur-xl'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-2'>
            <Loader2 className='size-3.5 shrink-0 animate-spin text-primary' />
            <span className='truncate text-xs font-semibold text-foreground'>
              {progressLabel}
            </span>
          </div>

          <span className='shrink-0 text-[11px] font-semibold text-muted-foreground'>
            {displayPercent === null ? 'En curso' : `${displayPercent}%`}
          </span>
        </div>

        <div
          className='mt-2 h-1.5 overflow-hidden rounded-full bg-secondary/80'
          role='progressbar'
          aria-label='Progreso de procesamiento'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={displayPercent ?? undefined}
        >
          <div
            className={`relative h-full overflow-hidden rounded-full bg-[linear-gradient(90deg,var(--primary),var(--accent))] transition-[width] duration-700 ease-out ${
              barPercent === null ? 'w-1/3 animate-pulse' : ''
            }`}
            style={barPercent === null ? undefined : { width: `${barPercent}%` }}
          >
            <div className='absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.42),transparent)] opacity-70' />
          </div>
        </div>

        <p className='mt-1 truncate text-[11px] text-muted-foreground'>
          {stageLabel}
          {elapsedLabel ? ` · ${elapsedLabel}` : ''}
          {processingState?.stale_processing ? ' · sin eventos recientes' : ''}
        </p>
      </div>
    </div>
  );
}