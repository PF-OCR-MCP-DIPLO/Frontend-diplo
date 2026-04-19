import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Eye, FileText, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useProcessing } from "../hooks/useProcessing";
import { toast } from "sonner";
import { statusClass, statusLabel } from "../lib/status";

export function HistoryPage() {
  const navigate = useNavigate();
  const { processedFiles, selectResult, isLoadingHistory, refreshHistory } = useProcessing();

  const handleViewFile = async (id: string) => {
    try {
      const selected = await selectResult(id);
      if (selected) {
        navigate("/results");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo abrir el job");
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshHistory();
      toast.success("Historial actualizado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el historial");
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="flex h-full flex-col p-4 sm:p-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 gap-2">
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="flex flex-1 items-center justify-center text-gray-600">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Cargando historial...
        </div>
      </div>
    );
  }

  if (processedFiles.length === 0) {
    return (
      <div className="flex h-full flex-col p-4 sm:p-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 gap-2">
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Aún no hay jobs procesados</h2>
            <p className="mb-6 text-sm text-gray-600">Sube tu primer archivo para comenzar.</p>
            <Button onClick={() => navigate("/upload")}>Procesar un archivo</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4 sm:p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 gap-2">
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Historial de jobs</h2>
            <p className="text-gray-600">Revisa todos los documentos creados en el backend</p>
          </div>
          <Button variant="outline" onClick={() => void handleRefresh()}>Actualizar</Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Archivo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedFiles.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-gray-500" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      {item.date.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`gap-1 ${statusClass[item.status] ?? "border-gray-200 bg-gray-50 text-gray-700"}`}>
                      {item.displayStatus === "success" ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
                      {statusLabel[item.status] ?? item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => void handleViewFile(item.id)} className="gap-2">
                      <Eye className="size-4" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
