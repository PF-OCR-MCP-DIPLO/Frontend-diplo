import { FileSearch } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { StatePanel } from '@/components/shared/StatePanel';
import { Button } from '@/components/ui/button';
import { ResultsView } from '@/features/processing/components/results/ResultsView';
import {
  useProcessingActionsContext,
  useProcessingCurrentResultContext,
  useProcessingFlagsContext,
} from '@/features/processing/hooks/useProcessingContext';
import { mapSourceImagesToPreview } from '@/features/processing/mappers/processing.mappers';

export function ResultsPage() {
  const navigate = useNavigate();
  const { runProcessing, refreshJob, exportCurrentJob } = useProcessingActionsContext();
  const { currentResults } = useProcessingCurrentResultContext();
  const { isProcessing, isRefreshing, isExporting } = useProcessingFlagsContext();

  const handleProcess = useCallback(async () => {
    try {
      const result = await runProcessing();
      if (result) toast.success(`Ejecucion ${result.jobId} procesada`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo procesar la ejecucion');
    }
  }, [runProcessing]);

  const handleRefresh = useCallback(async () => {
    try {
      const result = await refreshJob();
      if (result) toast.success(`Estado de la ejecucion ${result.jobId} actualizado`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo consultar la ejecucion');
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
        <StatePanel
          centered
          tone='info'
          icon={FileSearch}
          title='Todavia no hay un resultado activo para revisar'
          description='Cuando completes la carga documental, esta vista mostrara estado del procesamiento, tabla editable y salida exportable.'
          actions={<Button onClick={() => navigate('/upload')}>Ir al paso 2: carga documental</Button>}
        />
      </div>
    );
  }

  return (
    <ResultsView
      key={currentResults.jobId}
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
