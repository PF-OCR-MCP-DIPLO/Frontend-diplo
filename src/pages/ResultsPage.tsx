import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ResultsView } from "../components/ResultsView";
import { Button } from "../components/ui/button";
import { useProcessing } from "../hooks/useProcessing";

export function ResultsPage() {
  const navigate = useNavigate();
  const { currentResults, runProcessing, refreshJob, exportCurrentJob, isProcessing, isRefreshing, isExporting } = useProcessing();

  const handleProcess = useCallback(async () => {
    try {
      const result = await runProcessing();
      if (result) {
        toast.success(`Job ${result.jobId} procesado`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo procesar el job");
    }
  }, [runProcessing]);

  const handleRefresh = useCallback(async () => {
    try {
      const result = await refreshJob();
      if (result) {
        toast.success(`Estado del job ${result.jobId} actualizado`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo consultar el job");
    }
  }, [refreshJob]);

  const handleExport = useCallback(async () => {
    try {
      const result = await exportCurrentJob();
      if (result?.excelUrl) {
        toast.success("Excel generado correctamente");
      } else {
        toast.error("El backend no devolvió un archivo Excel");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar el Excel");
    }
  }, [exportCurrentJob]);

  if (!currentResults) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">No hay resultados para mostrar</h2>
          <p className="mb-6 text-sm text-gray-600">Procesa un documento para ver los resultados aquí.</p>
          <Button onClick={() => navigate("/")}>Ir al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <ResultsView
      jobId={currentResults.jobId}
      fileName={currentResults.name}
      sourceDocxUrl={currentResults.sourceDocxUrl}
      sourceImages={currentResults.sourceImages.map((image) => ({
        id: image.id,
        imageFile: image.image_file,
        sourceName: image.source_name,
        ocrStatus: image.ocr_status,
      }))}
      initialData={currentResults.data}
      status={currentResults.status}
      totalImages={currentResults.totalImages}
      totalRecords={currentResults.totalRecords}
      errorMessage={currentResults.errorMessage}
      excelUrl={currentResults.excelUrl}
      isProcessing={isProcessing}
      isRefreshing={isRefreshing}
      isExporting={isExporting}
      onProcess={handleProcess}
      onRefresh={handleRefresh}
      onExport={handleExport}
    />
  );
}
