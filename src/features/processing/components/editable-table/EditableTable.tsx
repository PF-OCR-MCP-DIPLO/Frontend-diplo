/**
 * Renderiza la tabla editable de consignaciones.
 *
 * La tabla conecta validaciones, edición local, selección de fila y accesos al
 * asistente para mantener el ciclo revisar -> corregir -> guardar.
 */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEditableTable } from '@/features/processing/hooks/useEditableTable';
import { EditableCell } from '@/features/processing/components/editable-table/EditableCell';
import { StatusCell } from '@/features/processing/components/editable-table/StatusCell';
import { getRowFieldIssues } from '@/features/processing/components/results/results-validation';
import type { ConsignmentRow, ResultFieldKey } from '@/features/processing/types/processing.types';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';

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

const columns: Array<{ key: ResultFieldKey; label: string; className?: string; editable?: boolean }> = [
  { key: 'fecha', label: 'Fecha', className: 'w-[120px]' },
  { key: 'hora', label: 'Hora', className: 'w-[100px]' },
  { key: 'monto', label: 'Monto', className: 'w-[140px]' },
  { key: 'referencia', label: 'Referencia', className: 'w-[160px]' },
  { key: 'sourceName', label: 'Archivo origen', className: 'w-[160px]', editable: false },
];

export function EditableTable({ data, validationMap, onDataChange, onRowClick, selectedRowId, selectedField, onCellFocus, onAskAssistant, reprocessingDepositId }: EditableTableProps) {
  const table = useEditableTable(data, onDataChange);

  return (
    <div className='overflow-hidden rounded-2xl border border-border/70 bg-card/95'>
      <div className='flex items-center justify-between gap-3 border-b border-border/60 px-3 py-2 text-sm'>
        <div className='text-muted-foreground'>
          {data.length} registros · {table.errorCount} hallazgos
        </div>
      </div>
      <div className='overflow-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={`${column.className} text-[0.72rem] uppercase tracking-[0.14em]`}>{column.label}</TableHead>
              ))}
              <TableHead className='w-[88px] text-[0.72rem] uppercase tracking-[0.14em]'>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} id={row.id} className={`cursor-pointer ${reprocessingDepositId === row.depositId ? 'opacity-70' : ''}`} onClick={() => onRowClick?.(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className='py-2'>
                    <EditableCell
                      row={row}
                      field={column.key}
                      editable={column.editable !== false}
                      issues={getRowFieldIssues(validationMap, row.id, column.key, row)}
                      isEditing={table.editingCell?.rowId === row.id && table.editingCell?.field === column.key}
                      isSelected={selectedRowId === row.id && selectedField === column.key}
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
                <TableCell className='py-2'>
                  <StatusCell row={row} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
