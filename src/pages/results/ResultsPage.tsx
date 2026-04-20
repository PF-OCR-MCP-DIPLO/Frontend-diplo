import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ResultsView } from '@/features/processing/components/results/ResultsView';
import { useProcessingActionsContext, useProcessingStateContext } from '@/features/processing/hooks/useProcessingContext';
import { mapSourceImagesToPreview } from '@/features/processing/mappers/processing.mappers';

export function ResultsPage() {
  const navigate = useNavigate();
  const { runProcessing, refreshJob, exportCurrentJob } = useProcessingActionsContext();
  const { currentResults, isProcessing, isRefreshing, isExporting } = useProcessingStateContext();

  const handleProcess = useCallback(async () => {
    try {
      const result = await runProcessing();
      if (result) toast.success(`Job ${result.jobId} procesado`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo procesar el job');
    }
  }, [runProcessing]);

  const handleRefresh = useCallback(async () => {
    try {
      const result = await refreshJob();
      if (result) toast.success(`Estado del job ${result.jobId} actualizado`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo consultar el job');
    }
  }, [refreshJob]);

  const handleExport = useCallback(async () => {
    try {
      const result = await exportCurrentJob();
      if (result?.excelUrl) {
        toast.success('Excel generado correctamente');
      } else {
        toast.error('El backend no devolvio un archivo Excel');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo exportar el Excel');
    }
  }, [exportCurrentJob]);

  if (!currentResults) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='max-w-md rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm'>
          <h2 className='mb-2 text-lg font-semibold text-slate-900'>No hay resultados para mostrar</h2>
          <p className='mb-6 text-sm text-slate-600'>Procesa un documento para ver los resultados aqui.</p>
          <Button onClick={() => navigate('/upload')}>Ir a carga</Button>
        </div>
      </div>
    );
  }

  return (
    <ResultsView
      jobId={currentResults.jobId}
      fileName={currentResults.name}
      sourceDocxUrl={currentResults.sourceDocxUrl}
      sourceImages={mapSourceImagesToPreview(currentResults.sourceImages)}
      initialData={currentResults.data}
      status={currentResults.status}
      totalImages={currentResults.totalImages}
      totalRecords={currentResults.totalRecords}
      errorMessage={currentResults.errorMessage}
      excelUrl={currentResults.excelUrl}
      isProcessing={isProcessing}
      isRefreshing={isRefreshing}
      isExporting={isExporting}
      onProcess={() => void handleProcess()}
      onRefresh={() => void handleRefresh()}
      onExport={() => void handleExport()}
    />
  );
}
