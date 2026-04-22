import { AlertTriangle, FolderOpen, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatePanel } from '@/components/shared/StatePanel';
import { Button } from '@/components/ui/button';
import { HistoryJobsTable } from '@/features/history/components/HistoryJobsTable';
import { useOpenResult } from '@/features/processing/hooks/useOpenResult';
import { useProcessingActionsContext, useProcessingHistoryContext } from '@/features/processing/hooks/useProcessingContext';

export function HistoryPage() {
  const navigate = useNavigate();
  const openResult = useOpenResult();
  const { refreshHistory } = useProcessingActionsContext();
  const { processedFiles, isLoadingHistory, historyError } = useProcessingHistoryContext();

  async function handleRefresh() {
    try {
      await refreshHistory();
      toast.success('Historial actualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el historial');
    }
  }

  if (isLoadingHistory) {
    return (
      <div className='flex h-full items-center justify-center'>
        <StatePanel
          centered
          tone='neutral'
          icon={Loader2}
          iconAnimated
          title='Cargando historial'
          description='Estamos consultando las ejecuciones previas para que puedas retomarlas desde esta vista.'
        />
      </div>
    );
  }

  if (historyError) {
    return (
      <div className='page-stack'>
        <PageHeader
          eyebrow='Historial'
          title='Historial'
          description='Abre una ejecucion anterior y continua la revision.'
        />
        <StatePanel
          tone='warning'
          icon={AlertTriangle}
          title='No pudimos cargar el historial'
          description={historyError}
          actions={
            <Button onClick={() => void handleRefresh()} className='gap-2'>
              <RefreshCw className='size-4' />
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  if (processedFiles.length === 0) {
    return (
      <div className='flex h-full items-center justify-center'>
        <StatePanel
          centered
          tone='info'
          icon={FolderOpen}
          title='Todavia no hay ejecuciones en el historial'
          description='Cuando termines tu primer procesamiento, aparecera aqui para volver a abrirlo o compararlo.'
          actions={<Button onClick={() => navigate('/upload')}>Procesar un archivo</Button>}
        />
      </div>
    );
  }

  return (
    <div className='page-stack'>
      <PageHeader
        eyebrow='Historial'
        title='Historial'
        description='Abre una ejecucion anterior y continua la revision.'
        actions={<Button variant='outline' onClick={() => void handleRefresh()}>Actualizar</Button>}
      />
      <HistoryJobsTable items={processedFiles} onOpenResult={(id) => void openResult(id, 'No se pudo abrir la ejecucion')} />
    </div>
  );
}
