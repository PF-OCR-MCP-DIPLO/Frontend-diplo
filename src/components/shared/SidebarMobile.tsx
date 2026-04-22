import { X } from 'lucide-react';
import { SidebarContent } from '@/components/shared/SidebarContent';
import { Button } from '@/components/ui/button';

type SidebarMobileProps = {
  open: boolean;
  onClose: () => void;
};

export function SidebarMobile({ open, onClose }: SidebarMobileProps) {
  if (!open) return null;

  return (
    <div
      className='fixed inset-0 z-40 bg-slate-950/48 backdrop-blur-sm lg:hidden'
      onClick={onClose}
    >
      <aside
        className='h-full w-80 max-w-[85vw] border-r border-sidebar-border bg-sidebar shadow-[var(--shadow-floating)]'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-sidebar-border px-4 py-4'>
          <p className='text-sm font-semibold text-foreground'>Menu</p>

          <Button
            variant='ghost'
            size='icon'
            aria-label='Cerrar menu'
            onClick={onClose}
          >
            <X className='size-4' />
          </Button>
        </div>

        <div className='h-[calc(100%-65px)]'>
          <SidebarContent collapsed={false} onNavigate={onClose} />
        </div>
      </aside>
    </div>
  );
}