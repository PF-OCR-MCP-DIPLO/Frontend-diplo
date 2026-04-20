import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatePanelProps {
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: 'neutral' | 'warning' | 'info';
  actions?: ReactNode;
  centered?: boolean;
  iconAnimated?: boolean;
}

const toneStyles = {
  neutral: {
    panel: 'border-slate-200 bg-white/95',
    icon: 'bg-slate-100 text-slate-600',
  },
  warning: {
    panel: 'border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,1),rgba(255,255,255,0.96))]',
    icon: 'bg-white text-amber-600',
  },
  info: {
    panel: 'border-teal-200 bg-[linear-gradient(135deg,rgba(240,253,250,1),rgba(255,255,255,0.96))]',
    icon: 'bg-white text-teal-700',
  },
};

export function StatePanel({
  title,
  description,
  icon: Icon,
  tone = 'neutral',
  actions,
  centered = false,
  iconAnimated = false,
}: StatePanelProps) {
  const styles = toneStyles[tone];

  return (
    <div className={`rounded-[32px] border p-8 shadow-sm shadow-slate-200/70 ${styles.panel} ${centered ? 'mx-auto max-w-lg text-center' : 'max-w-3xl'}`}>
      <div className={`flex ${centered ? 'flex-col items-center' : 'items-start'} gap-4`}>
        <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}>
          <Icon className={`size-6 ${iconAnimated ? 'animate-spin' : ''}`} />
        </div>
        <div className={`space-y-4 ${centered ? 'items-center' : ''}`}>
          <div>
            <h2 className='text-lg font-semibold tracking-tight text-slate-950'>{title}</h2>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-700'>{description}</p>
          </div>
          {actions ? <div className={`flex flex-wrap gap-3 ${centered ? 'justify-center' : ''}`}>{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
