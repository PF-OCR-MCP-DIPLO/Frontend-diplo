import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { SidebarContent } from '@/components/shared/SidebarContent';
import { Button } from '@/components/ui/button';

type SidebarDesktopProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function SidebarDesktop({
  collapsed,
  onToggle,
}: SidebarDesktopProps) {
  return (
    <aside
      className={`hidden border-r border-sidebar-border bg-sidebar/92 backdrop-blur-xl lg:flex lg:flex-col ${
        collapsed ? 'lg:w-24' : 'lg:w-80'
      }`}
    >
      <div className='flex justify-end px-3 py-3'>
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
      </div>

      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}