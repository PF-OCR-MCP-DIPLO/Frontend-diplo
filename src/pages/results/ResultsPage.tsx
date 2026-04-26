import { FileSearch } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { StatePanel } from '@/components/shared/StatePanel';
import { Button } from '@/components/ui/button';
import { useOpenAssistantWithContext } from '@/features/assistant/hooks/useOpenAssistantWithContext';
import { ResultsView } from '@/features/processing/components/results/ResultsView';
import {
  useProcessingActionsContext,
  useProcessingCurrentResultContext,
  useProcessingFlagsContext,
} from '@/features/processing/hooks/useProcessingContext';
import { mapSourceImagesToPreview } from '@/features/processing/mappers/processing.mappers';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

export function ResultsPage() {
  const navigate = useNavigate();
  const openAssistantWithContext = useOpenAssistantWithContext();
  const { runProcessing, reprocessFailedJob, refreshJob, exportCurrentJob, saveCurrentCorrections } = useProcessingActionsContext();
  const { currentResults } = useProcessingCurrentResultContext();
  const { isProcessing, isRefreshing, isExporting, isSavingCorrections } = useProcessingFlagsContext();

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

  const handleReprocessFailed = useCallback(async () => {
    try {
      const result = await reprocessFailedJob();
      if (result) toast.success(`Fallidos reprocesados para la ejecución ${result.jobId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron reprocesar los fallidos');
    }
  }, [reprocessFailedJob]);

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

  const handleSaveCorrections = useCallback(async (rows: ConsignmentRow[]) => {
    try {
      const result = await saveCurrentCorrections(rows);
      if (result) {
        toast.success('Correcciones guardadas y sincronizadas con la exportacion');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron guardar las correcciones');
      throw error;
    }
  }, [saveCurrentCorrections]);

  const handleOpenAssistant = openAssistantWithContext;

  if (!currentResults) {
    return (
      <div className='flex h-full items-center justify-center'>
        <StatePanel
          centered
          tone='info'
          icon={FileSearch}
          title='No hay un resultado activo'
          description='Carga un `.docx` para empezar una nueva revision.'
          actions={<Button onClick={() => navigate('/upload')}>Ir a carga</Button>}
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
      processingState={currentResults.processingState ?? null}
      diagnosticsSummary={currentResults.diagnosticsSummary ?? null}
      excelUrl={currentResults.excelUrl}
      isProcessing={isProcessing}
      isRefreshing={isRefreshing}
      isExporting={isExporting}
      isSavingCorrections={isSavingCorrections}
      onProcess={() => void handleProcess()}
      onReprocessFailed={() => void handleReprocessFailed()}
      onRefresh={() => void handleRefresh()}
      onExport={() => void handleExport()}
      onSaveCorrections={handleSaveCorrections}
      onOpenAssistant={handleOpenAssistant}
    />
  );
}
