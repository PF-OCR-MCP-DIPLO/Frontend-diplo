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
    <div className='flex min-h-screen bg-transparent text-foreground'>
      <a
        href='#app-main'
        className='absolute left-4 top-3 z-50 -translate-y-16 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition focus:translate-y-0 focus:ring-4 focus:ring-ring/18 focus:outline-none'
      >
        Saltar al contenido principal
      </a>

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      {mobileOpen ? (
        <div
          className='fixed inset-0 z-40 bg-slate-950/48 backdrop-blur-sm lg:hidden'
          onClick={() => setMobileOpen(false)}
        >
          <div className='h-full w-80 bg-card shadow-[var(--shadow-floating)]' onClick={(event) => event.stopPropagation()}>
            <div className='flex h-full flex-col'>
              <div className='border-b border-border/70 px-4 py-5'>
                <p className='text-sm font-semibold text-foreground'>Menu</p>
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
        <header className='sticky top-0 z-30 border-b border-border/70 bg-card/82 backdrop-blur-xl'>
          <div className='page-shell flex items-center justify-between gap-4 px-4 py-4 sm:px-6'>
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
                <p className='section-kicker'>
                  Plataforma
                </p>
                <div>
                  <p className='text-sm font-semibold text-foreground sm:text-base'>
                    {currentNavigationItem.label}
                  </p>
                  <p className='text-xs text-muted-foreground sm:text-sm'>
                    {currentNavigationItem.description}
                  </p>
                </div>
              </div>
            </div>

            <div className='hidden items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent shadow-[var(--shadow-soft)] sm:flex'>
              <span className='size-2 rounded-full bg-accent' aria-hidden='true' />
              Operacion documental conectada
            </div>
          </div>
        </header>

        <main id='app-main' className='flex-1 p-4 sm:p-6'>
          <div className='page-shell'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
