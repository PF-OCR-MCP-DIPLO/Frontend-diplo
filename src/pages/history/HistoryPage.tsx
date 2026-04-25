import { AlertTriangle, FolderOpen, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
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
  const { refreshHistory, runProcessing, exportCurrentJob, deleteJobResult } = useProcessingActionsContext();
  const { processedFiles, isLoadingHistory, historyError } = useProcessingHistoryContext();
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);
  const [processingJobId, setProcessingJobId] = useState<number | null>(null);
  const [exportingJobId, setExportingJobId] = useState<number | null>(null);

  async function handleRefresh() {
    try {
      await refreshHistory();
      toast.success('Historial actualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el historial');
    }
  }

  async function handleDelete(jobId: number, label: string) {
    const confirmed = window.confirm(`Vas a borrar la ejecución "${label}". Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    setDeletingJobId(jobId);
    try {
      await deleteJobResult(jobId);
      toast.success('Ejecución borrada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo borrar la ejecución');
    } finally {
      setDeletingJobId(null);
    }
  }

  async function handleProcess(jobId: number) {
    setProcessingJobId(jobId);
    try {
      const result = await runProcessing(jobId);
      if (result) {
        toast.success(result.status === 'processing' ? `Ejecución ${result.jobId} en procesamiento` : `Ejecución ${result.jobId} lista`);
        await refreshHistory();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo procesar la ejecución');
    } finally {
      setProcessingJobId(null);
    }
  }

  async function handleExport(jobId: number) {
    setExportingJobId(jobId);
    try {
      const result = await exportCurrentJob(jobId);
      if (result?.excelUrl) {
        toast.success('Excel generado correctamente');
        await refreshHistory();
      } else {
        toast.error('El backend no devolvió un archivo Excel');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo exportar la ejecución');
    } finally {
      setExportingJobId(null);
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
          description='Abre una ejecución anterior y continúa la revisión.'
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
          title='Todavía no hay ejecuciones en el historial'
          description='Cuando termines tu primer procesamiento, aparecerá aquí para volver a abrirlo o compararlo.'
          actions={<Button onClick={() => navigate('/upload')}>Procesar un archivo</Button>}
        />
      </div>
    );
  }

  return (
    <div className='page-stack'>
      <PageHeader
        eyebrow='Ejecuciones Previas'
        title='Historial'
        description='Abre una ejecución anterior, vuelve a procesarla o elimina la que ya no necesites.'
        actions={<Button variant='outline' onClick={() => void handleRefresh()}>Actualizar</Button>}
      />
      <HistoryJobsTable
        items={processedFiles}
        deletingJobId={deletingJobId}
        processingJobId={processingJobId}
        exportingJobId={exportingJobId}
        onOpenResult={(id) => void openResult(id, 'No se pudo abrir la ejecución')}
        onProcessJob={(jobId) => void handleProcess(jobId)}
        onExportJob={(jobId) => void handleExport(jobId)}
        onDeleteJob={(jobId) => {
          const job = processedFiles.find((item) => item.jobId === jobId);
          void handleDelete(jobId, job?.name ?? String(jobId));
        }}
      />
    </div>
  );
}
