import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
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
    return <div className='flex h-full items-center justify-center text-slate-600'><Loader2 className='mr-2 size-4 animate-spin' />Cargando historial...</div>;
  }

  if (historyError) {
    return (
      <div className='space-y-6'>
        <PageHeader
          eyebrow='History'
          title='Historial de jobs'
          description='Revisa documentos anteriores, consulta estado y abre cualquier ejecucion para seguir trabajando.'
        />
        <div className='max-w-3xl rounded-[32px] border border-amber-200 bg-amber-50 p-8 shadow-sm'>
          <div className='flex items-start gap-4'>
            <AlertTriangle className='mt-0.5 size-6 text-amber-600' />
            <div className='space-y-4'>
              <div>
                <h2 className='text-lg font-semibold text-slate-900'>No pudimos cargar el historial</h2>
                <p className='mt-1 text-sm text-slate-700'>{historyError}</p>
              </div>
              <Button onClick={() => void handleRefresh()} className='gap-2'>
                <RefreshCw className='size-4' />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (processedFiles.length === 0) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='max-w-md rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm'>
          <h2 className='mb-2 text-lg font-semibold text-slate-900'>Aun no hay jobs procesados</h2>
          <p className='mb-6 text-sm text-slate-600'>Sube tu primer archivo para comenzar.</p>
          <Button onClick={() => navigate('/upload')}>Procesar un archivo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        eyebrow='History'
        title='Historial de jobs'
        description='Revisa documentos anteriores, consulta estado y abre cualquier ejecucion para seguir trabajando.'
        actions={<Button variant='outline' onClick={() => void handleRefresh()}>Actualizar</Button>}
      />
      <HistoryJobsTable items={processedFiles} onOpenResult={(id) => void openResult(id, 'No se pudo abrir el job')} />
    </div>
  );
}
