import { AlertCircle, CheckCircle2, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils/format';
import type { HistoryListItem } from '@/features/history/types/history.types';

interface HistoryJobsTableProps {
  items: HistoryListItem[];
  onOpenResult: (id: string) => void;
}

export function HistoryJobsTable({ items, onOpenResult }: HistoryJobsTableProps) {
  return (
    <Card className='overflow-hidden'>
      <div className='border-b border-border/70 px-5 py-4'>
        <h2 className='font-semibold text-foreground'>Ejecuciones</h2>
        <p className='text-sm text-muted-foreground'>{items.length} resultado{items.length === 1 ? '' : 's'} disponible{items.length === 1 ? '' : 's'}.</p>
      </div>
      <div className='overflow-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Archivo</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className='text-right'>Abrir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className='cursor-pointer' onClick={() => onOpenResult(item.id)}>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <div className='icon-chip-primary size-9'>
                      <FileText className='size-4' />
                    </div>
                    <span className='font-medium text-foreground'>{item.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className='text-muted-foreground'>{formatDateTime(item.date)}</span>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    {item.displayStatus === 'success' ? <CheckCircle2 className='size-3' /> : <AlertCircle className='size-3' />}
                    <StatusBadge status={item.status} />
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenResult(item.id);
                    }}
                    className='gap-2'
                  >
                    <Eye className='size-4' />
                    Abrir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
