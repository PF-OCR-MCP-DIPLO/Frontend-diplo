import { useEffect, useId, useRef, useState } from 'react';

interface ContextualPopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  interactive?: boolean;
  placement?: 'left' | 'right';
}

export function ContextualPopover({ trigger, content, className, interactive = false, placement = 'left' }: ContextualPopoverProps) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setPinned(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setPinned(false);
      }
    };
    document.addEventListener('mousedown', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const shouldOpen = open || pinned;

  return (
    <span
      ref={rootRef}
      className={`relative inline-flex ${className ?? ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!pinned) setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false);
          setPinned(false);
        }
      }}
    >
      <span
        aria-describedby={shouldOpen ? id : undefined}
        onClick={() => {
          if (interactive) setPinned((value) => !value);
        }}
      >
        {trigger}
      </span>
      {shouldOpen ? (
        <span
          id={id}
          role={interactive ? 'dialog' : 'tooltip'}
          aria-modal={interactive ? false : undefined}
          className={`absolute top-full z-30 mt-2 w-[min(20rem,80vw)] rounded-2xl border border-border/70 bg-background p-3 text-left text-xs text-foreground shadow-[var(--shadow-floating)] ${placement === 'right' ? 'right-0' : 'left-0'}`}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => {
            if (!pinned) setOpen(false);
          }}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
