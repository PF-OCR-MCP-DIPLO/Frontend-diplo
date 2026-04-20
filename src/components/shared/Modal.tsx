import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const sizeClass = {
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Modal({ title, open, onClose, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    previousActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    const firstFocusableElement = focusableElements?.[0];
    firstFocusableElement?.focus();

    return () => {
      document.body.style.overflow = '';
      previousActiveElementRef.current?.focus();
    };
  }, [open]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab' || !dialogRef.current) {
      return;
    }

    const focusableElements = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4'>
      <div className='absolute inset-0' aria-hidden='true' onClick={onClose} />
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className={`relative max-h-[85vh] w-full overflow-auto rounded-3xl bg-white p-5 shadow-2xl focus:outline-none ${sizeClass[size]}`}
      >
        <div className='mb-4 flex items-center justify-between gap-4'>
          <h3 id={titleId} className='text-lg font-semibold text-slate-900'>{title}</h3>
          <Button variant='outline' size='sm' onClick={onClose}>Cerrar</Button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
