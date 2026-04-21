import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/button';
import { appNavigation } from '@/lib/constants/navigation';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  const currentNavigationItem =
    appNavigation.find((item) => item.to === location.pathname) ?? appNavigation[0];

  return (
    <div className='flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#edf2f7_100%)] text-slate-900'>
      <a
        href='#app-main'
        className='absolute left-4 top-3 z-50 -translate-y-16 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-teal-300'
      >
        Saltar al contenido principal
      </a>

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      {mobileOpen ? (
        <div
          className='fixed inset-0 z-40 bg-slate-950/40 lg:hidden'
          onClick={() => setMobileOpen(false)}
        >
          <div className='h-full w-80 bg-white shadow-2xl' onClick={(event) => event.stopPropagation()}>
            <div className='flex h-full flex-col'>
              <div className='border-b border-slate-200/80 px-4 py-5'>
                <p className='text-sm font-semibold text-slate-900'>Menu</p>
              </div>
              <Sidebar
                collapsed={false}
                onToggle={() => {}}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className='flex min-h-screen min-w-0 flex-1 flex-col'>
        <header className='sticky top-0 z-30 border-b border-slate-200/80 bg-white/72 backdrop-blur'>
          <div className='flex items-center justify-between gap-4 px-4 py-4 sm:px-6'>
            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                size='icon'
                aria-label='Abrir menu de navegacion'
                className='lg:hidden'
                onClick={() => setMobileOpen(true)}
              >
                <Menu className='size-4' />
              </Button>

              <div className='space-y-1'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400'>
                  Plataforma
                </p>
                <div>
                  <p className='text-sm font-semibold text-slate-950 sm:text-base'>
                    {currentNavigationItem.label}
                  </p>
                  <p className='text-xs text-slate-500 sm:text-sm'>
                    {currentNavigationItem.description}
                  </p>
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