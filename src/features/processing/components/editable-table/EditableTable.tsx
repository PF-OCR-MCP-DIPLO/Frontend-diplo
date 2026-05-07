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
import { useResizableColumns } from "@/features/processing/components/editable-table/useResizableColumns";
import { getRowFieldIssues } from "@/features/processing/components/results/results-validation";
import type {
  ConsignmentRow,
  ResultFieldKey,
} from "@/features/processing/types/processing.types";
import type { ResultsValidationMap } from "@/features/processing/components/results/results-validation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

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
  onReprocessDeposit?: (depositId: number) => void;
}

type EditableTableColumn = {
  key: ResultFieldKey;
  label: string;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  editable?: boolean;
};

const columns: EditableTableColumn[] = [
  {
    key: "fecha",
    label: "Fecha",
    defaultWidth: 132,
    minWidth: 108,
    maxWidth: 220,
  },
  {
    key: "hora",
    label: "Hora",
    defaultWidth: 112,
    minWidth: 96,
    maxWidth: 180,
  },
  {
    key: "monto",
    label: "Monto",
    defaultWidth: 146,
    minWidth: 120,
    maxWidth: 240,
  },
  {
    key: "referencia",
    label: "Referencia",
    defaultWidth: 280,
    minWidth: 180,
    maxWidth: 520,
  },
  {
    key: 'descripcion',
    label: 'DESCRIPCION',
    defaultWidth: 130,
    minWidth: 110,
    maxWidth: 180,
  },
  {
    key: "sourceName",
    label: "Archivo origen",
    defaultWidth: 250,
    minWidth: 180,
    maxWidth: 520,
    editable: false,
  },
];

const statusColumn = {
  key: "estado",
  label: "Estado",
  defaultWidth: 170,
  minWidth: 140,
  maxWidth: 260,
};

const actionColumn = {
  key: "acciones",
  label: "Acción",
  defaultWidth: 140,
  minWidth: 120,
  maxWidth: 180,
};

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
  onReprocessDeposit,
}: EditableTableProps) {
  const table = useEditableTable(data, onDataChange);
  const resizableColumns = useResizableColumns([
    ...columns,
    statusColumn,
    actionColumn,
  ]);

  function getAutoFitValues(key: string) {
    if (key === statusColumn.key) return data.map((row) => row.estado);
    return data.map((row) => String(row[key as ResultFieldKey] ?? ""));
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5 text-sm">
        <div className="text-muted-foreground">
          {data.length} registro{data.length === 1 ? "" : "s"} ·{" "}
          {table.errorCount} hallazgo{table.errorCount === 1 ? "" : "s"}
        </div>
      </div>
      <div className="max-h-[calc(100vh-18rem)] min-h-0 w-full overflow-auto">
        <Table
          containerClassName="w-full overflow-visible rounded-none border-0 bg-transparent"
          className="min-w-0 table-fixed"
          style={{ minWidth: resizableColumns.totalWidth, width: "100%" }}
        >
          <colgroup>
            {columns.map((column) => (
              <col
                key={column.key}
                style={{ width: resizableColumns.widths[column.key] }}
              />
            ))}
            <col style={{ width: resizableColumns.widths[statusColumn.key] }} />
            <col style={{ width: resizableColumns.widths[actionColumn.key] }} />
          </colgroup>

          <TableHeader>
            <TableRow>
              {columns.map((column, columnIndex) => (
                <TableHead
                  key={column.key}
                  className={`relative min-w-0 border-b border-border/50 pr-2 ${columnIndex === 0 ? "left-0 z-20 bg-surface-subtle/95" : ""}`}
                >
                  <span className="block truncate pr-3">{column.label}</span>
                  <button
                    type="button"
                    aria-label={`Redimensionar columna ${column.label}`}
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize border-r border-transparent hover:border-primary/50 focus:border-primary focus:outline-none"
                    onPointerDown={(event) =>
                      resizableColumns.startResize(column.key, event)
                    }
                    onDoubleClick={() =>
                      resizableColumns.autoFitColumn(
                        column.key,
                        getAutoFitValues(column.key),
                      )
                    }
                  />
                </TableHead>
              ))}
              <TableHead className="relative min-w-0 border-b border-border/50 pr-2">
                <span className="block truncate pr-3">
                  {actionColumn.label}
                </span>
                <button
                  type="button"
                  aria-label={`Redimensionar columna ${actionColumn.label}`}
                  className="absolute right-0 top-0 h-full w-2 cursor-col-resize border-r border-transparent hover:border-primary/50 focus:border-primary focus:outline-none"
                  onPointerDown={(event) =>
                    resizableColumns.startResize(actionColumn.key, event)
                  }
                  onDoubleClick={() =>
                    resizableColumns.autoFitColumn(actionColumn.key, [
                      "Reprocesar",
                    ])
                  }
                />
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
                {columns.map((column, columnIndex) => (
                  <TableCell
                    key={column.key}
                    className={`min-w-0 max-w-0 overflow-hidden py-2 align-middle ${columnIndex === 0 ? "sticky left-0 z-10 bg-card/95" : ""}`}
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
                <TableCell className="min-w-0 max-w-0 overflow-hidden py-2 align-middle">
                  <StatusCell row={row} validationMap={validationMap} />
                </TableCell>
                <TableCell className="min-w-0 max-w-0 overflow-hidden py-2 align-middle">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 px-2 text-xs"
                    disabled={
                      !onReprocessDeposit ||
                      reprocessingDepositId === row.depositId
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      onReprocessDeposit?.(row.depositId);
                    }}
                    aria-label={`Reprocesar fila ${row.referencia || row.id}`}
                  >
                    <RotateCcw className="size-3" />
                    {reprocessingDepositId === row.depositId
                      ? "Reprocesando..."
                      : "Reprocesar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
