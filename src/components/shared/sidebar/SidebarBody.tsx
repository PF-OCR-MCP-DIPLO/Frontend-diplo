import { NavLink, useLocation } from 'react-router-dom';
import { appNavigation } from '@/lib/constants/navigation';

type SidebarBodyProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

export function SidebarBody({
  collapsed,
  onNavigate,
}: SidebarBodyProps) {
  const location = useLocation();

  return (
    <>
      <nav className='flex-1 space-y-2 p-3 pt-5'>
        {appNavigation
          .filter((item) => item.to !== '/settings')
          .map((item) => {
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
                    <p
                      className={`truncate text-xs ${
                        active ? 'text-white/76' : 'text-muted-foreground/80'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                ) : null}
              </NavLink>
            );
          })}
      </nav>
    </>
  );
}