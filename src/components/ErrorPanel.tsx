import { Card } from "./ui/card";
import { AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ConsignmentRow } from "./EditableTable";
import { Badge } from "./ui/badge";

interface ErrorPanelProps {
  data: ConsignmentRow[];
  onErrorClick: (rowId: string) => void;
}

export function ErrorPanel({ data, onErrorClick }: ErrorPanelProps) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const errorsData = data.filter((row) => row.estado === "error");

  const toggleExpand = (rowId: string) => {
    setExpanded((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  if (errorsData.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <AlertCircle className="size-5 text-red-600" />
        <h3 className="font-semibold text-gray-900">Errores detectados</h3>
        <Badge variant="destructive">{errorsData.length}</Badge>
      </div>

      <div className="space-y-2">
        {errorsData.map((row) => {
          const isExpanded = expanded.includes(row.id);
          return (
            <div key={row.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
              <button
                onClick={() => toggleExpand(row.id)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="size-4 text-gray-600" />
                  )}
                  <span className="font-medium text-gray-900">
                    Fila: {row.referencia || "Sin referencia"}
                  </span>
                </div>
                <span className="text-sm text-red-600">
                  {row.errors?.length || 0} errores
                </span>
              </button>

              {isExpanded && (
                <div className="mt-3 space-y-2 border-t border-red-200 pt-3">
                  {row.errors?.map((error, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium text-red-700">Campo: Monto</p>
                      <p className="text-red-600">Razón: {error}</p>
                    </div>
                  ))}
                  <button
                    onClick={() => onErrorClick(row.id)}
                    className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Ir a la fila →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
