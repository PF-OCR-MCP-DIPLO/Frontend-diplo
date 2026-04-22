import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { AppLogo } from '@/components/shared/AppLogo';
import { Button } from '@/components/ui/button';

type SidebarHeaderProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  mobile?: boolean;
};

export function SidebarHeader({
  collapsed = false,
  onToggle,
  onClose,
  mobile = false,
}: SidebarHeaderProps) {
  return (
    <div className='border-b border-sidebar-border px-3 py-3'>
      <div className='flex items-center justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <AppLogo collapsed={collapsed} />
        </div>

        {mobile ? (
          <Button
            variant='ghost'
            size='icon'
            aria-label='Cerrar menu'
            onClick={onClose}
          >
            <X className='size-4' />
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='icon'
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            onClick={onToggle}
          >
            {collapsed ? (
              <PanelLeftOpen className='size-4' />
            ) : (
              <PanelLeftClose className='size-4' />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}