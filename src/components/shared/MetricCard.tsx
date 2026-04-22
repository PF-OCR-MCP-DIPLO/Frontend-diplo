import type { LucideIcon } from 'lucide-react';

type MetricTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

const toneClass: Record<MetricTone, { icon: string; value: string }> = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    value: 'text-foreground',
  },
  success: {
    icon: 'bg-success/12 text-success',
    value: 'text-success',
  },
  warning: {
    icon: 'bg-warning/12 text-warning',
    value: 'text-warning',
  },
  danger: {
    icon: 'bg-danger/12 text-danger',
    value: 'text-danger',
  },
  neutral: {
    icon: 'bg-secondary/78 text-secondary-foreground',
    value: 'text-foreground',
  },
};

interface MetricCardProps {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  tone?: MetricTone;
}

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'neutral',
}: MetricCardProps) {
  const styles = toneClass[tone];

  return (
    <article className='metric-card'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
            {label}
          </p>
          <p className={`mt-2.5 text-3xl font-semibold tracking-tight ${styles.value}`}>{value}</p>
        </div>
        <div className={`metric-icon ${styles.icon}`}>
          <Icon className='size-5' />
        </div>
      </div>
      {description ? <p className='mt-3 text-sm text-muted-foreground'>{description}</p> : null}
    </article>
  );
}
