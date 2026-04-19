import { useEffect, useMemo, useState } from "react";
import { DocumentPreview } from "./DocumentPreview";
import { EditableTable, type ConsignmentRow } from "./EditableTable";
import { ErrorPanel } from "./ErrorPanel";
import { AIChat } from "./AIChat";
import { Button } from "./ui/button";
import { Download, Play, RefreshCw, MessageSquare, FileDown } from "lucide-react";

interface ResultsViewProps {
  fileName: string;
  sourceDocxUrl: string;
  sourceImages: Array<{
    id: number;
    imageFile: string;
    sourceName: string;
    ocrStatus: string;
  }>;
  initialData: ConsignmentRow[];
  status: string;
  totalImages: number;
  totalRecords: number;
  errorMessage: string;
  excelUrl: string | null;
  isProcessing: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  onProcess: () => void;
  onRefresh: () => void;
  onExport: () => void;
}

const statusLabel: Record<string, string> = {
  uploaded: "Cargado",
  processing: "Procesando",
  completed: "Completado",
  failed: "Fallido",
};

export function ResultsView({
  fileName,
  sourceDocxUrl,
  sourceImages,
  initialData,
  status,
  totalImages,
  totalRecords,
  errorMessage,
  excelUrl,
  isProcessing,
  isRefreshing,
  isExporting,
  onProcess,
  onRefresh,
  onExport,
}: ResultsViewProps) {
  const [data, setData] = useState<ConsignmentRow[]>(initialData);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const errorCount = data.filter((row) => row.estado === "error").length;
  const previewImages = useMemo(
    () => sourceImages.filter((image) => image.imageFile).map((image) => ({
      id: image.id,
      url: image.imageFile,
      name: image.sourceName,
      status: image.ocrStatus,
    })),
    [sourceImages]
  );

  const handleErrorClick = (rowId: string) => {
    const element = document.getElementById(rowId);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Resultados del procesamiento</h2>
            <p className="text-sm text-gray-600">{fileName}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-gray-100 px-3 py-1">Estado: {statusLabel[status] ?? status}</span>
              <span className="rounded-full bg-gray-100 px-3 py-1">Imágenes: {totalImages}</span>
              <span className="rounded-full bg-gray-100 px-3 py-1">Registros: {totalRecords}</span>
            </div>
            {errorMessage && <p className="mt-3 text-sm text-red-600">{errorMessage}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setShowChat(!showChat)} className="gap-2">
              <MessageSquare className="size-4" />
              {showChat ? "Ocultar" : "Mostrar"} Chat IA
            </Button>
            <Button variant="outline" onClick={onRefresh} className="gap-2" disabled={isRefreshing}>
              <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualizar estado
            </Button>
            <Button onClick={onProcess} className="gap-2" disabled={isProcessing || status === "processing"}>
              <Play className="size-4" />
              {status === "completed" ? "Procesar de nuevo" : "Procesar"}
            </Button>
            <Button variant="outline" onClick={onExport} className="gap-2" disabled={isExporting}>
              <Download className="size-4" />
              Exportar Excel
            </Button>
            {excelUrl && (
              <Button asChild className="gap-2">
                <a href={excelUrl} target="_blank" rel="noreferrer">
                  <FileDown className="size-4" />
                  Descargar Excel
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-hidden p-4 sm:p-6 lg:flex-row">
        <div className="flex w-full flex-col gap-6 lg:w-1/2">
          <div className="flex-1 overflow-hidden">
            <DocumentPreview fileName={fileName} sourceDocxUrl={sourceDocxUrl} images={previewImages} />
          </div>
          {(errorCount > 0 || errorMessage) && (
            <div className="max-h-[300px] overflow-auto">
              <ErrorPanel data={data} onErrorClick={handleErrorClick} />
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-6 lg:w-1/2">
          <div className="flex-1 overflow-hidden">
            <EditableTable data={data} onDataChange={setData} />
          </div>
          {showChat && (
            <div className="h-[320px] sm:h-[400px]">
              <AIChat errors={errorCount} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
