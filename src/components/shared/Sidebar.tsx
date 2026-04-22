import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { AppLogo } from '@/components/shared/AppLogo';
import { Button } from '@/components/ui/button';
import { appNavigation } from '@/lib/constants/navigation';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
};

export function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const location = useLocation();

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

      <div className='flex h-full flex-col'>
        <div className='flex justify-center border-b border-sidebar-border px-4 py-5'>
          <AppLogo collapsed={collapsed} />
        </div>

        <nav className='flex-1 space-y-2 p-3 pt-5'>
          {appNavigation.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                aria-label={item.label}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center gap-3 rounded-[22px] border px-3 py-3 text-sm transition ${
                  active
                    ? 'border-primary/18 bg-[linear-gradient(135deg,rgba(11,61,107,1),rgba(15,79,138,0.94),rgba(15,143,115,0.84))] text-white shadow-[var(--shadow-panel)]'
                    : 'border-transparent text-muted-foreground hover:border-border/80 hover:bg-white/86 hover:text-foreground hover:shadow-[var(--shadow-soft)]'
                }`}
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-2xl transition ${
                    active
                      ? 'bg-white/14 text-white'
                      : 'bg-secondary/80 text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground'
                  }`}
                >
                  <Icon className='size-4 shrink-0' />
                </div>

                {!collapsed ? (
                  <div className='min-w-0 flex-1'>
                    <p className='font-medium'>{item.label}</p>
                    <p className={`truncate text-xs ${active ? 'text-white/76' : 'text-muted-foreground/80'}`}>{item.description}</p>
                  </div>
                ) : null}

                {!collapsed ? (
                  <span
                    className={`size-2 rounded-full ${
                      active ? 'bg-white' : 'bg-transparent group-hover:bg-primary/30'
                    }`}
                    aria-hidden='true'
                  />
                ) : null}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
