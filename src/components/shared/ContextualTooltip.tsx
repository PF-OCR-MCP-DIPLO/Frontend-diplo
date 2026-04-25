import { useId, useState } from 'react';

interface ContextualTooltipProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export function ContextualTooltip({ trigger, content, className }: ContextualTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={`relative inline-flex ${className ?? ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined}>{trigger}</span>
      {open ? (
        <span
          id={id}
          role='tooltip'
          className='absolute left-0 top-full z-30 mt-2 w-[min(20rem,80vw)] rounded-2xl border border-border/70 bg-background p-3 text-left text-xs text-foreground shadow-[var(--shadow-floating)]'
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
