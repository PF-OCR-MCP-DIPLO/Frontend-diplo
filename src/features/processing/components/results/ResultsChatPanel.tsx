import { AIChat } from '@/components/AIChat';

export function ResultsChatPanel({ errors }: { errors: number }) {
  return (
    <div className='overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm'>
      <div className='border-b border-slate-200 px-5 py-4'>
        <p className='text-sm font-semibold text-slate-900'>Asistente de revision</p>
        <p className='mt-1 text-sm text-slate-500'>Recibe apoyo contextual mientras corriges {errors} hallazgo{errors === 1 ? '' : 's'}.</p>
      </div>
      <div className='h-[320px] sm:h-[400px]'>
        <AIChat errors={errors} />
      </div>
    </div>
  );
}
