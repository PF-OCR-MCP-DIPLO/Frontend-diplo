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
      <div className='border-b border-slate-200/80 px-4 py-5'>
        <AppLogo />
      </div>
      <div className='px-4 pt-4'>
        {!collapsed ? (
          <div className='rounded-[24px] border border-teal-100 bg-[linear-gradient(135deg,rgba(240,253,250,1),rgba(255,255,255,0.94))] p-4'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-teal-700'>Espacio de trabajo</p>
            <p className='mt-2 text-sm font-medium text-slate-900'>Supervisa la carga, la revision y la exportacion desde un solo lugar.</p>
            <p className='mt-1 text-xs leading-5 text-slate-600'>Cada vista mantiene el foco operativo y evita saltos innecesarios entre tareas.</p>
          </div>
        ) : null}
      </div>
      <nav className='flex-1 space-y-2 p-3 pt-4'>
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
              className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${active ? 'border-teal-500 bg-[linear-gradient(135deg,#0f766e,#14b8a6)] text-white shadow-lg shadow-teal-900/15' : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-sm'}`}
            >
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl transition ${active ? 'bg-white/14 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white'}`}>
                <Icon className='size-4 shrink-0' />
              </div>
              {!collapsed ? (
                <div className='min-w-0 flex-1'>
                  <p className='font-medium'>{item.label}</p>
                  <p className={`truncate text-xs ${active ? 'text-teal-50/90' : 'text-slate-400'}`}>{item.description}</p>
                </div>
              ) : null}
              {!collapsed ? <span className={`size-2 rounded-full ${active ? 'bg-white' : 'bg-transparent group-hover:bg-slate-300'}`} aria-hidden='true' /> : null}
            </NavLink>
          );
        })}
      </nav>
      <div className='border-t border-slate-200/80 px-4 py-4'>
        {!collapsed ? (
          <div className='rounded-2xl bg-slate-100/80 p-4 text-xs leading-5 text-slate-600'>
            Flujo pensado para revisar rapido, corregir con contexto y exportar sin perder trazabilidad.
          </div>
        ) : (
          <div className='flex justify-center'>
            <div className='size-2 rounded-full bg-teal-500' aria-hidden='true' />
          </div>
        )}
      </div>
    </div>
  );
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentNavigationItem = appNavigation.find((item) => item.to === location.pathname) ?? appNavigation[0];

  return (
    <div className='flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#edf2f7_100%)] text-slate-900'>
      <a
        href='#app-main'
        className='absolute left-4 top-3 z-50 -translate-y-16 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-teal-300'
      >
        Saltar al contenido principal
      </a>
      <aside className={`hidden border-r border-slate-200/80 bg-white/88 backdrop-blur lg:flex lg:flex-col ${collapsed ? 'lg:w-24' : 'lg:w-80'}`}>
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
        <header className='sticky top-0 z-30 border-b border-slate-200/80 bg-white/72 backdrop-blur'>
          <div className='flex items-center justify-between gap-4 px-4 py-4 sm:px-6'>
            <div className='flex items-center gap-3'>
              <Button variant='outline' size='icon' aria-label='Abrir menu de navegacion' className='lg:hidden' onClick={() => setMobileOpen(true)}>
                <Menu className='size-4' />
              </Button>
              <div className='space-y-1'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400'>Plataforma</p>
                <div>
                  <p className='text-sm font-semibold text-slate-950 sm:text-base'>{currentNavigationItem.label}</p>
                  <p className='text-xs text-slate-500 sm:text-sm'>{currentNavigationItem.description}</p>
                </div>
              </div>
            </div>
            <div className='hidden items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm sm:flex'>
              <span className='size-2 rounded-full bg-emerald-500' aria-hidden='true' />
              Flujo documental activo
            </div>
          </div>
        </header>
        <main id='app-main' className='flex-1 p-4 sm:p-6'>
          <div className='mx-auto w-full max-w-[1400px]'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
