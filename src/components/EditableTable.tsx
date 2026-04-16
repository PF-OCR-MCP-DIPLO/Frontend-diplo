import { useState } from "react";
import { Card } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "./ui/badge";

export interface ConsignmentRow {
  id: string;
  fecha: string;
  monto: string;
  referencia: string;
  banco: string;
  estado: "valid" | "error";
  errors?: string[];
}

interface EditableTableProps {
  data: ConsignmentRow[];
  onDataChange: (data: ConsignmentRow[]) => void;
  onRowClick?: (row: ConsignmentRow) => void;
}

export function EditableTable({ data, onDataChange, onRowClick }: EditableTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(
    null
  );

  const handleCellDoubleClick = (rowId: string, field: string) => {
    setEditingCell({ rowId, field });
  };

  const handleCellChange = (rowId: string, field: keyof ConsignmentRow, value: string) => {
    const newData = data.map((row) => {
      if (row.id === rowId) {
        const updated = { ...row, [field]: value };

        if (field === "monto") {
          const isValid = !isNaN(parseFloat(value.replace(/[^\d.-]/g, "")));
          updated.estado = isValid ? "valid" : "error";
          updated.errors = isValid ? [] : ["Monto no es numérico"];
        }

        return updated;
      }
      return row;
    });
    onDataChange(newData);
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const renderCell = (row: ConsignmentRow, field: keyof ConsignmentRow) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.field === field;
    const value = row[field] as string;
    const hasError = row.estado === "error" && field === "monto";

    if (isEditing) {
      return (
        <Input
          autoFocus
          value={value}
          onChange={(e) => handleCellChange(row.id, field, e.target.value)}
          onBlur={handleCellBlur}
          className={`h-8 ${hasError ? "border-red-500" : ""}`}
        />
      );
    }

    return (
      <div
        onDoubleClick={() => handleCellDoubleClick(row.id, field as string)}
        className={`cursor-pointer rounded px-2 py-1 hover:bg-gray-100 ${
          hasError ? "text-red-600" : ""
        }`}
      >
        {value}
      </div>
    );
  };

  const errorCount = data.filter((row) => row.estado === "error").length;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900">Datos extraídos</h3>
        {errorCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="size-3" />
            {errorCount} errores
          </Badge>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Fecha</TableHead>
              <TableHead className="w-[120px]">Monto</TableHead>
              <TableHead className="w-[140px]">Referencia</TableHead>
              <TableHead className="w-[120px]">Banco</TableHead>
              <TableHead className="w-[80px]">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                id={row.id}
                className="cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                <TableCell>{renderCell(row, "fecha")}</TableCell>
                <TableCell>{renderCell(row, "monto")}</TableCell>
                <TableCell>{renderCell(row, "referencia")}</TableCell>
                <TableCell>{renderCell(row, "banco")}</TableCell>
                <TableCell>
                  {row.estado === "valid" ? (
                    <CheckCircle2 className="size-5 text-green-600" />
                  ) : (
                    <AlertCircle className="size-5 text-red-600" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
        Doble clic en cualquier celda para editar
      </div>
    </Card>
  );
}
