import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ResultsView } from "../components/ResultsView";
import { Button } from "../components/ui/button";
import { useProcessing } from "../hooks/useProcessing";

export function ResultsPage() {
  const navigate = useNavigate();
  const { currentResults, reprocess } = useProcessing();

  const handleReprocess = useCallback(async () => {
    navigate("/upload");
    const result = await reprocess();
    if (result) {
      navigate("/results");
    }
  }, [navigate, reprocess]);

  if (!currentResults || !currentResults.data || !currentResults.fileUrl || !currentResults.fileType) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            No hay resultados para mostrar
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Procesa un documento para ver los resultados aquí.
          </p>
          <Button onClick={() => navigate("/")}>Ir al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <ResultsView
      fileName={currentResults.name}
      fileUrl={currentResults.fileUrl}
      fileType={currentResults.fileType}
      initialData={currentResults.data}
      onReprocess={handleReprocess}
    />
  );
}
