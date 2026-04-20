import { AlertCircle, CheckCircle2, Eye, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { statusClass, statusLabel } from '@/lib/constants/status';
import { formatDateTime } from '@/lib/utils/format';
import type { HistoryListItem } from '@/features/history/types/history.types';

interface HistoryJobsTableProps {
  items: HistoryListItem[];
  onOpenResult: (id: string) => void;
}

export function HistoryJobsTable({ items, onOpenResult }: HistoryJobsTableProps) {
  return (
    <Card className='overflow-hidden rounded-[32px] border-slate-200 bg-white/95 shadow-sm'>
      <div className='overflow-auto'>
        <Table>
          <TableHeader className='bg-slate-50/90'>
            <TableRow>
              <TableHead>Archivo</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className='text-right'>Abrir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <FileText className='size-4 text-slate-500' />
                    <span className='font-medium'>{item.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className='text-slate-600'>{formatDateTime(item.date)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant='outline' className={`gap-1 ${statusClass[item.status] ?? 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    {item.displayStatus === 'success' ? <CheckCircle2 className='size-3' /> : <AlertCircle className='size-3' />}
                    {statusLabel[item.status] ?? item.status}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <Button variant='outline' size='sm' onClick={() => onOpenResult(item.id)} className='gap-2 rounded-2xl'>
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
