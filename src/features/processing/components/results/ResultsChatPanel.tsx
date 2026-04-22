import { AIChat } from '@/components/AIChat';

export function ResultsChatPanel({ errors }: { errors: number }) {
  return (
    <div className='surface-card overflow-hidden'>
      <div className='panel-header'>
        <p className='panel-title'>Asistente de revision</p>
        <p className='mt-1 panel-copy'>Recibe apoyo contextual mientras corriges {errors} hallazgo{errors === 1 ? '' : 's'}.</p>
      </div>
      <div className='h-[320px] sm:h-[400px]'>
        <AIChat errors={errors} />
      </div>
    </div>
  );
}
