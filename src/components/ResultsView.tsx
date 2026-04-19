import { useEffect, useMemo, useState } from "react";
import { DocumentPreview } from "./DocumentPreview";
import { EditableTable, type ConsignmentRow } from "./EditableTable";
import { ErrorPanel } from "./ErrorPanel";
import { AIChat } from "./AIChat";
import { Button } from "./ui/button";
import { Download, Play, RefreshCw, MessageSquare, FileDown, XCircle } from "lucide-react";
import { statusClass, statusLabel } from "../lib/status";
import { getJobLogs, type ApiExtractionLog } from "../lib/api";

interface ResultsViewProps {
  jobId: number;
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

export function ResultsView({
  jobId,
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
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ url: string; name: string } | null>(null);
  const [logs, setLogs] = useState<ApiExtractionLog[]>([]);
  const [showLogsDialog, setShowLogsDialog] = useState(false);

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

  const handleOpenLogs = async () => {
    const payload = await getJobLogs(jobId);
    setLogs(payload);
    setShowLogsDialog(true);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Resultados del procesamiento</h2>
            <p className="text-sm text-gray-600">{fileName}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
              <span className={`rounded-full border px-3 py-1 ${statusClass[status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                Estado: {statusLabel[status] ?? status}
              </span>
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
            <Button variant="outline" onClick={() => void handleOpenLogs()}>Ver logs</Button>
            <Button
              variant="outline"
              onClick={() => setShowErrorDialog(true)}
              className="gap-2"
              disabled={errorCount === 0 && !errorMessage}
            >
              <XCircle className="size-4" />
              Ver errores
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
            <DocumentPreview
              fileName={fileName}
              sourceDocxUrl={sourceDocxUrl}
              images={previewImages}
              onOpenImage={(image) => setExpandedImage({ url: image.url, name: image.name })}
            />
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
      {showErrorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Errores del procesamiento</h3>
              <Button variant="outline" size="sm" onClick={() => setShowErrorDialog(false)}>
                Cerrar
              </Button>
            </div>
            {errorMessage && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
            <ErrorPanel data={data} onErrorClick={handleErrorClick} />
          </div>
        </div>
      )}
      {expandedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-6xl rounded-xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{expandedImage.name}</h3>
              <Button variant="outline" size="sm" onClick={() => setExpandedImage(null)}>
                Cerrar
              </Button>
            </div>
            <div className="flex max-h-[80vh] items-center justify-center overflow-auto bg-gray-100 p-4">
              <img src={expandedImage.url} alt={expandedImage.name} className="max-h-[76vh] rounded-lg bg-white shadow-lg" />
            </div>
          </div>
        </div>
      )}
      {showLogsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-5xl overflow-auto rounded-xl bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Raw extraction logs</h3>
              <Button variant="outline" size="sm" onClick={() => setShowLogsDialog(false)}>
                Cerrar
              </Button>
            </div>
            <div className="space-y-2">
              {logs.map((item) => (
                <div key={item.id} className={`rounded-lg border p-3 text-sm ${item.is_error ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
                  <p className="font-medium">
                    #{item.sequence_index} {item.stage}
                  </p>
                  <p className="text-gray-700">
                    provider={item.provider || "-"} model={item.model || "-"} mode={item.ocr_mode || "-"}
                  </p>
                  {item.notes && <p className="mt-1 text-gray-700">{item.notes}</p>}
                  {item.raw_text && <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs">{item.raw_text}</pre>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
