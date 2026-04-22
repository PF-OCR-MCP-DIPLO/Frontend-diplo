import { AIChat } from '@/components/AIChat';

export function ResultsChatPanel({ errors }: { errors: number }) {
  return (
    <div className='surface-card overflow-hidden'>
      <div className='border-b border-border/70 px-5 py-4'>
        <p className='text-sm font-semibold text-foreground'>Asistente de revision</p>
        <p className='mt-1 text-sm text-muted-foreground'>Recibe apoyo contextual mientras corriges {errors} hallazgo{errors === 1 ? '' : 's'}.</p>
      </div>
      <div className='h-[320px] sm:h-[400px]'>
        <AIChat errors={errors} />
      </div>
    </div>
  );
}
