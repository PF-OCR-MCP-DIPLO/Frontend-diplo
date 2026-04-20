import { AIChat } from '@/components/AIChat';

export function ResultsChatPanel({ errors }: { errors: number }) {
  return (
    <div className='h-[320px] sm:h-[400px]'>
      <AIChat errors={errors} />
    </div>
  );
}
