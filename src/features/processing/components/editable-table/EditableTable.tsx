/**
 * Renderiza la tabla editable de consignaciones.
 *
 * La tabla conecta validaciones, edición local, selección de fila y accesos al
 * asistente para mantener el ciclo revisar -> corregir -> guardar.
 */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEditableTable } from "@/features/processing/hooks/useEditableTable";
import { EditableCell } from "@/features/processing/components/editable-table/EditableCell";
import { StatusCell } from "@/features/processing/components/editable-table/StatusCell";
import { getRowFieldIssues } from "@/features/processing/components/results/results-validation";
import type {
  ConsignmentRow,
  ResultFieldKey,
} from "@/features/processing/types/processing.types";
import type { ResultsValidationMap } from "@/features/processing/components/results/results-validation";

interface EditableTableProps {
  data: ConsignmentRow[];
  validationMap: ResultsValidationMap;
  onDataChange: (data: ConsignmentRow[]) => void;
  onRowClick?: (row: ConsignmentRow) => void;
  selectedRowId?: string | null;
  selectedField?: string | null;
  onCellFocus?: (rowId: string, field: ResultFieldKey) => void;
  onAskAssistant?: (rowId: string, field: ResultFieldKey) => void;
  reprocessingDepositId?: number | null;
}

type EditableTableColumn = {
  key: ResultFieldKey;
  label: string;
  width: string;
  editable?: boolean;
};

const columns: EditableTableColumn[] = [
  { key: "fecha", label: "Fecha", width: "10%" },
  { key: "hora", label: "Hora", width: "9%" },
  { key: "monto", label: "Monto", width: "12%" },
  { key: "referencia", label: "Referencia", width: "28%" },
  { key: "sourceName", label: "Archivo origen", width: "23%", editable: false },
];

export function EditableTable({
  data,
  validationMap,
  onDataChange,
  onRowClick,
  selectedRowId,
  selectedField,
  onCellFocus,
  onAskAssistant,
  reprocessingDepositId,
}: EditableTableProps) {
  const table = useEditableTable(data, onDataChange);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5 text-sm">
        <div className="text-muted-foreground">
          {data.length} registro{data.length === 1 ? "" : "s"} ·{" "}
          {table.errorCount} hallazgo{table.errorCount === 1 ? "" : "s"}
        </div>
      </div>
      <div className="max-h-[calc(100vh-18rem)] min-h-0 overflow-auto">
        <Table className="w-full min-w-[980px] table-fixed">
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
            <col style={{ width: "18%" }} />
          </colgroup>

          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="min-w-0 border-b border-border/50"
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="min-w-0 border-b border-border/50">
                Estado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                id={row.id}
                className={`cursor-pointer ${reprocessingDepositId === row.depositId ? "opacity-70" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className="min-w-0 py-2 align-middle"
                  >
                    <EditableCell
                      row={row}
                      field={column.key}
                      editable={column.editable !== false}
                      issues={getRowFieldIssues(
                        validationMap,
                        row.id,
                        column.key,
                        row,
                      )}
                      isEditing={
                        table.editingCell?.rowId === row.id &&
                        table.editingCell?.field === column.key
                      }
                      isSelected={
                        selectedRowId === row.id && selectedField === column.key
                      }
                      onFocusCell={onCellFocus}
                      onEdit={table.startEditing}
                      onChange={table.updateCell}
                      onBlur={table.stopEditing}
                      onKeyDown={table.handleInputKeyDown}
                      onAskAssistant={onAskAssistant}
                      validationMap={validationMap}
                    />
                  </TableCell>
                ))}
                <TableCell className="min-w-0 py-2 align-middle">
                  <StatusCell row={row} validationMap={validationMap} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
