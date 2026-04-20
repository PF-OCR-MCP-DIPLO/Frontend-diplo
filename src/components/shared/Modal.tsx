import type { ReactNode } from 'react';
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

export function Modal({ title, open, onClose, children, size = 'md' }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4'>
      <div className={`max-h-[85vh] w-full overflow-auto rounded-3xl bg-white p-5 shadow-2xl ${sizeClass[size]}`}>
        <div className='mb-4 flex items-center justify-between gap-4'>
          <h3 className='text-lg font-semibold text-slate-900'>{title}</h3>
          <Button variant='outline' size='sm' onClick={onClose}>Cerrar</Button>
        </div>
        {children}
      </div>
    </div>
  );
}
