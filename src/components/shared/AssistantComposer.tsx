import { Minimize2, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { ResultsChatPanel } from '@/features/processing/components/results/ResultsChatPanel';

interface AssistantComposerProps {
  open: boolean;
  errors: number;
  jobId?: number | null;
  onClose: () => void;
}

export function AssistantComposer({ open, errors, jobId = null, onClose }: AssistantComposerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className='pointer-events-none fixed inset-x-3 bottom-3 z-50 flex justify-end sm:inset-x-6 sm:bottom-6'>
      <div
        className={cn(
          'pointer-events-auto flex h-[min(38rem,calc(100vh-6rem))] w-full max-w-[32rem] flex-col overflow-hidden rounded-t-3xl rounded-b-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] transition-all duration-200 ease-out',
        )}
      >
        <div className='flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-9 items-center justify-center rounded-full bg-teal-100 text-teal-700'>
              <MessageSquare className='size-4' />
            </div>
            <div>
              <p className='text-sm font-semibold text-slate-900'>Asistente IA</p>
              <p className='text-xs text-slate-500'>Ventana flotante persistente</p>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon' className='size-8 text-slate-500 hover:bg-slate-200 hover:text-slate-900' onClick={onClose} aria-label='Minimizar asistente'>
              <Minimize2 className='size-4' />
            </Button>
            <Button variant='ghost' size='icon' className='size-8 text-slate-500 hover:bg-slate-200 hover:text-slate-900' onClick={onClose} aria-label='Cerrar asistente'>
              <X className='size-4' />
            </Button>
          </div>
        </div>

        <div className='min-h-0 flex-1 overflow-hidden bg-white p-3'>
          <ResultsChatPanel errors={errors} jobId={jobId} className='h-full' />
        </div>
      </div>
    </div>
  );
}
