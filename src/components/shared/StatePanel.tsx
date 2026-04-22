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
    panel: 'surface-card',
    icon: 'bg-secondary/78 text-secondary-foreground',
  },
  warning: {
    panel: 'surface-card-warning',
    icon: 'bg-white text-warning',
  },
  info: {
    panel: 'surface-card-accent',
    icon: 'bg-white text-accent',
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
    <div className={`${styles.panel} p-8 ${centered ? 'mx-auto max-w-lg text-center' : 'max-w-3xl'}`}>
      <div className={`flex ${centered ? 'flex-col items-center' : 'items-start'} gap-4`}>
        <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}>
          <Icon className={`size-6 ${iconAnimated ? 'animate-spin' : ''}`} />
        </div>
        <div className={`space-y-4 ${centered ? 'items-center' : ''}`}>
          <div>
            <h2 className='text-lg font-semibold tracking-tight text-foreground'>{title}</h2>
            <p className='mt-2 max-w-2xl text-body text-muted-foreground'>{description}</p>
          </div>
          {actions ? <div className={`flex flex-wrap gap-3 ${centered ? 'justify-center' : ''}`}>{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
