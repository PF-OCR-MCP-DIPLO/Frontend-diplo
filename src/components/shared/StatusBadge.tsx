import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { statusClass, statusLabel } from '@/lib/constants/status';

interface StatusBadgeProps {
  status: string;
  className?: string;
  prefix?: string;
}

export function StatusBadge({ status, className, prefix }: StatusBadgeProps) {
  return (
    <Badge
      variant='outline'
      className={cn(statusClass[status] ?? 'border-border/75 bg-white/82 text-muted-foreground', className)}
    >
      {prefix ? `${prefix}: ` : null}
      {statusLabel[status] ?? status}
    </Badge>
  );
}
