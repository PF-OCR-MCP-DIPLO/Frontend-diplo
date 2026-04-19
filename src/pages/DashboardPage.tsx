import { FileUp, Clock, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { useProcessing } from "../hooks/useProcessing";
import { toast } from "sonner";
import { statusClass, statusLabel } from "../lib/status";

export function DashboardPage() {
  const navigate = useNavigate();
  const { processedFiles, selectResult, isLoadingHistory } = useProcessing();

  const handleFileClick = async (id: string) => {
    try {
      const selected = await selectResult(id);
      if (selected) {
        navigate("/results");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar el job");
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-blue-50">
            <FileUp className="size-10 text-blue-600" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-900 sm:text-3xl">Bienvenido al Procesador</h2>
          <p className="text-gray-600">Carga y procesa documentos de consignación desde el backend real</p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => navigate("/upload")}
            size="lg"
            className="h-16 w-full max-w-[300px] rounded-xl text-base sm:h-20 sm:text-lg"
          >
            <FileUp className="mr-2 size-6" />
            Cargar .docx
          </Button>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Jobs recientes</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="text-blue-600 hover:text-blue-700">
              Ver historial
            </Button>
          </div>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8 text-gray-600">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Cargando jobs...
            </div>
          ) : processedFiles.length === 0 ? (
            <p className="text-sm text-gray-600">Todavía no hay jobs creados en el backend.</p>
          ) : (
            <div className="space-y-2">
              {processedFiles.slice(0, 5).map((file) => (
                <button
                  key={file.id}
                  onClick={() => void handleFileClick(file.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.date.toLocaleDateString("es-ES")}</p>
                  </div>
                  <div
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass[file.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
                  >
                    {statusLabel[file.status] ?? file.status}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
