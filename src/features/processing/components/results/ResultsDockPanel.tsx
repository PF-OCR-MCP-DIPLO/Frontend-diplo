import { Minus, PanelRightClose, PanelRightOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ResultsPanelMode } from '@/features/processing/components/results/hooks/useResultsPanelState';

interface ResultsDockPanelProps {
  panel: ResultsPanelMode;
  state: 'open' | 'minimized';
  title: string;
  description?: string;
  children: React.ReactNode;
  onMinimize: () => void;
  onRestore: () => void;
  onClose: () => void;
}

export function ResultsDockPanel({
  panel,
  state,
  title,
  description,
  children,
  onMinimize,
  onRestore,
  onClose,
}: ResultsDockPanelProps) {
  const isMinimized = state === 'minimized';

  return (
    <aside
      className={`border-border/70 bg-background/96 shadow-[var(--shadow-floating)] backdrop-blur transition-all lg:sticky lg:top-0 lg:h-[calc(100vh-8rem)] lg:border-l ${
        isMinimized
          ? 'fixed bottom-4 right-4 z-40 w-auto rounded-2xl border lg:bottom-auto lg:right-auto lg:w-16 lg:rounded-none lg:border-0'
          : 'fixed inset-x-3 bottom-3 top-24 z-40 flex flex-col overflow-hidden rounded-[24px] border lg:inset-auto lg:w-[420px] lg:max-w-[420px] lg:rounded-none lg:border-0'
      }`}
      aria-label={`Panel ${title}`}
      data-testid='results-dock-panel'
      data-panel={panel}
      data-state={state}
    >
      <div className={`flex items-start justify-between gap-3 border-b border-border/60 ${isMinimized ? 'px-3 py-2 lg:min-h-[76px] lg:flex-col lg:items-center lg:justify-center lg:border-b-0' : 'px-4 py-3'}`}>
        <div className={`${isMinimized ? 'min-w-0 lg:hidden' : 'min-w-0'}`}>
          <p className='text-sm font-medium text-foreground'>{title}</p>
          {description ? <p className='text-xs text-muted-foreground'>{description}</p> : null}
        </div>
        <div className={`flex items-center gap-1 ${isMinimized ? 'lg:flex-col' : ''}`}>
          {isMinimized ? (
            <Button type='button' variant='ghost' size='icon' onClick={onRestore} aria-label={`Restaurar panel ${title}`}>
              <PanelRightOpen className='size-4' />
            </Button>
          ) : (
            <Button type='button' variant='ghost' size='icon' onClick={onMinimize} aria-label={`Minimizar panel ${title}`}>
              <Minus className='size-4' />
            </Button>
          )}
          <Button type='button' variant='ghost' size='icon' onClick={onClose} aria-label={`Cerrar panel ${title}`}>
            {isMinimized ? <X className='size-4' /> : <PanelRightClose className='size-4' />}
          </Button>
        </div>
      </div>
      {!isMinimized ? (
        <ScrollArea className='min-h-0 flex-1'>
          <div className='p-4'>{children}</div>
        </ScrollArea>
      ) : null}
    </aside>
  );
}
