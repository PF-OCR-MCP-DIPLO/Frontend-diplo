import { Bot, Sparkles } from 'lucide-react';
import { AIChat } from '@/components/AIChat';

export function AssistantPage() {
  return (
    <div className='flex h-[calc(100vh-8rem)] min-h-[640px] flex-col'>
      <section className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='mb-2 flex items-center gap-2'>
            <span className='inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <Bot className='size-5' />
            </span>
            <p className='section-eyebrow'>Asistente IA</p>
          </div>
        </div>

        <div className='hidden rounded-2xl border border-border/70 bg-white/80 px-4 py-3 text-sm text-muted-foreground shadow-[var(--shadow-soft)] sm:flex sm:items-center sm:gap-2'>
          <Sparkles className='size-4 text-primary' />
          Interfaz conversacional
        </div>
      </section>

      <div className='min-h-0 flex-1'>
        <AIChat errors={0} jobId={null} variant='fullscreen' />
      </div>
    </div>
  );
}