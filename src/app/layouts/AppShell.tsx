import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AppLogo } from '@/components/shared/AppLogo';
import { Button } from '@/components/ui/button';
import { appNavigation } from '@/lib/constants/navigation';

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <div className='flex h-full flex-col'>
      <div className='border-b border-slate-200 px-4 py-5'>
        <AppLogo />
      </div>
      <nav className='flex-1 space-y-2 p-3'>
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
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${active ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon className='size-4 shrink-0' />
              {!collapsed ? (
                <div className='min-w-0'>
                  <p className='font-medium'>{item.label}</p>
                  <p className={`truncate text-xs ${active ? 'text-teal-50/90' : 'text-slate-400'}`}>{item.description}</p>
                </div>
              ) : null}
            </NavLink>
          );
        })}
      </nav>
      <div className='border-t border-slate-200 px-4 py-4 text-xs text-slate-500'>Frontend maintenance edition</div>
    </div>
  );
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentNavigationItem = appNavigation.find((item) => item.to === location.pathname);

  return (
    <div className='flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900'>
      <aside className={`hidden border-r border-slate-200 bg-white/90 backdrop-blur lg:flex lg:flex-col ${collapsed ? 'lg:w-24' : 'lg:w-80'}`}>
        <div className='flex justify-end px-3 py-3'>
          <Button variant='ghost' size='icon' aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'} onClick={() => setCollapsed((value) => !value)}>
            {collapsed ? <PanelLeftOpen className='size-4' /> : <PanelLeftClose className='size-4' />}
          </Button>
        </div>
        <SidebarContent collapsed={collapsed} />
      </aside>

      {mobileOpen ? (
        <div className='fixed inset-0 z-40 bg-slate-950/40 lg:hidden' onClick={() => setMobileOpen(false)}>
          <aside className='h-full w-80 bg-white shadow-2xl' onClick={(event) => event.stopPropagation()}>
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className='flex min-h-screen min-w-0 flex-1 flex-col'>
        <header className='sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur'>
          <div className='flex items-center justify-between gap-4 px-4 py-4 sm:px-6'>
            <div className='flex items-center gap-3'>
              <Button variant='outline' size='icon' aria-label='Abrir menu de navegacion' className='lg:hidden' onClick={() => setMobileOpen(true)}>
                <Menu className='size-4' />
              </Button>
              <div>
                <p className='text-sm font-medium text-slate-900'>Workspace</p>
                <p className='text-xs text-slate-500'>{currentNavigationItem?.label ?? 'Dashboard'}</p>
              </div>
            </div>
          </div>
        </header>
        <main className='flex-1 p-4 sm:p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
