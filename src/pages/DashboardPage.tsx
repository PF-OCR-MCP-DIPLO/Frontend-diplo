import { FileUp, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { useProcessing } from "../hooks/useProcessing";

export function DashboardPage() {
  const navigate = useNavigate();
  const { processedFiles, selectResult } = useProcessing();

  const handleFileClick = (id: string) => {
    const selected = selectResult(id);
    if (selected) {
      navigate("/results");
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-blue-50">
            <FileUp className="size-10 text-blue-600" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
            Bienvenido al Procesador
          </h2>
          <p className="text-gray-600">
            Carga y procesa documentos de consignación de forma automática
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => navigate("/upload")}
            size="lg"
            className="h-16 w-full max-w-[300px] rounded-xl text-base sm:h-20 sm:text-lg"
          >
            <FileUp className="mr-2 size-6" />
            Cargar y procesar
          </Button>
        </div>

        {processedFiles.length > 0 && (
          <Card className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Archivos recientes</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/history")}
                className="text-blue-600 hover:text-blue-700"
              >
                Ver historial
              </Button>
            </div>
            <div className="space-y-2">
              {processedFiles.slice(0, 5).map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleFileClick(file.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {file.date.toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      file.status === "success"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {file.status === "success" ? "✓ Procesado" : "⚠ Con errores"}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
