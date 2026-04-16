import { useEffect, useState } from "react";
import { DocumentPreview } from "./DocumentPreview";
import { EditableTable, ConsignmentRow } from "./EditableTable";
import { ErrorPanel } from "./ErrorPanel";
import { AIChat } from "./AIChat";
import { Button } from "./ui/button";
import { Download, RefreshCw, MessageSquare } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface ResultsViewProps {
  fileName: string;
  fileUrl: string;
  fileType: "pdf" | "image";
  initialData: ConsignmentRow[];
  onReprocess: () => void;
}

export function ResultsView({
  fileName,
  fileUrl,
  fileType,
  initialData,
  onReprocess,
}: ResultsViewProps) {
  const [data, setData] = useState<ConsignmentRow[]>(initialData);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const errorCount = data.filter((row) => row.estado === "error").length;

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row) => ({
        Fecha: row.fecha,
        Monto: row.monto,
        Referencia: row.referencia,
        Banco: row.banco,
        Estado: row.estado === "valid" ? "Válido" : "Error",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consignaciones");

    XLSX.writeFile(workbook, `${fileName.replace(/\.[^/.]+$/, "")}_procesado.xlsx`);
    toast.success("Archivo exportado correctamente");
  };

  const handleErrorClick = (rowId: string) => {
    const element = document.getElementById(rowId);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Resultados del procesamiento
            </h2>
            <p className="text-sm text-gray-600">{fileName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowChat(!showChat)}
              className="gap-2"
            >
              <MessageSquare className="size-4" />
              {showChat ? "Ocultar" : "Mostrar"} Chat IA
            </Button>
            <Button variant="outline" onClick={onReprocess} className="gap-2">
              <RefreshCw className="size-4" />
              Reprocesar
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="size-4" />
              Exportar a Excel
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-hidden p-4 sm:p-6 lg:flex-row">
        <div className="flex w-full flex-col gap-6 lg:w-1/2">
          <div className="flex-1 overflow-hidden">
            <DocumentPreview fileUrl={fileUrl} fileName={fileName} fileType={fileType} />
          </div>
          {errorCount > 0 && (
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
