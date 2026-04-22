import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEditableTable } from '@/features/processing/hooks/useEditableTable';
import { ConsignmentTableHeader } from '@/features/processing/components/editable-table/ConsignmentTableHeader';
import { EditableCell } from '@/features/processing/components/editable-table/EditableCell';
import { StatusCell } from '@/features/processing/components/editable-table/StatusCell';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

interface EditableTableProps {
  data: ConsignmentRow[];
  onDataChange: (data: ConsignmentRow[]) => void;
  onRowClick?: (row: ConsignmentRow) => void;
}

const columns: Array<{ key: keyof ConsignmentRow; label: string; className?: string; editable?: boolean }> = [
  { key: 'fecha', label: 'Fecha', className: 'w-[120px]' },
  { key: 'hora', label: 'Hora', className: 'w-[100px]' },
  { key: 'monto', label: 'Monto', className: 'w-[140px]' },
  { key: 'referencia', label: 'Referencia', className: 'w-[160px]' },
  { key: 'sourceName', label: 'Archivo origen', className: 'w-[160px]', editable: false },
];

export function EditableTable({ data, onDataChange, onRowClick }: EditableTableProps) {
  const table = useEditableTable(data, onDataChange);

  return (
    <Card className='flex h-full flex-col overflow-hidden rounded-[24px] border-slate-200 shadow-none'>
      <ConsignmentTableHeader errorCount={table.errorCount} />
      <div className='flex-1 overflow-auto'>
        <Table>
          <TableHeader className='bg-slate-50/90'>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>{column.label}</TableHead>
              ))}
              <TableHead className='w-[100px]'>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} id={row.id} className='cursor-pointer' onClick={() => onRowClick?.(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <EditableCell
                      row={row}
                      field={column.key}
                      editable={column.editable !== false}
                      isEditing={table.editingCell?.rowId === row.id && table.editingCell?.field === column.key}
                      onEdit={table.startEditing}
                      onChange={table.updateCell}
                      onBlur={table.stopEditing}
                      onKeyDown={table.handleInputKeyDown}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <StatusCell row={row} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
