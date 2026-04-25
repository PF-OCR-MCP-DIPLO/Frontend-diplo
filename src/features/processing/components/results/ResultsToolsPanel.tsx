import { MessageSquare, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResultsChatPanel } from '@/features/processing/components/results/ResultsChatPanel';

interface ResultsToolsPanelProps {
  errorCount: number;
  jobId: number;
  showTools: boolean;
  showChat: boolean;
  isLoadingLogs: boolean;
  onToggleTools: () => void;
  onToggleChat: () => void;
  onOpenLogs: () => void;
}

export function ResultsToolsPanel({
  errorCount,
  jobId,
  showTools,
  showChat,
  isLoadingLogs,
  onToggleTools,
  onToggleChat,
  onOpenLogs,
}: ResultsToolsPanelProps) {
  return (
    <section className='surface-card p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='section-kicker'>Detalles</p>
          <h3 className='mt-1 text-lg font-semibold tracking-tight text-foreground'>Herramientas</h3>
        </div>
        <Button variant='ghost' size='sm' onClick={onToggleTools}>
          {showTools ? 'Ocultar' : 'Ver herramientas'}
        </Button>
      </div>
      {showTools ? (
        <div className='mt-4 space-y-3'>
          <div className='flex flex-wrap gap-2'>
            <Button variant='outline' className='gap-2' onClick={onOpenLogs} disabled={isLoadingLogs}>
              <ScrollText className='size-4' />
              {isLoadingLogs ? 'Cargando...' : 'Logs'}
            </Button>
            <Button variant='outline' className='gap-2' onClick={onToggleChat}>
              <MessageSquare className='size-4' />
              {showChat ? 'Ocultar chat' : 'Chat contextual'}
            </Button>
          </div>
          {showChat ? <ResultsChatPanel errors={errorCount} jobId={jobId} /> : null}
        </div>
      ) : null}
    </section>
  );
}
