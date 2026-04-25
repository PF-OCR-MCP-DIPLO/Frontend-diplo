import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { appNavigation } from '@/lib/constants/navigation';
import { SidebarDesktop } from '@/components/shared/sidebar/SidebarDesktop';
import { SidebarMobile } from '@/components/shared/sidebar/SidebarMobile';
import { AppViewport } from './AppViewport';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  const currentNavigationItem = useMemo(() => {
    return (
      appNavigation.find((item) => item.to === location.pathname) ??
      appNavigation[0]
    );
  }, [location.pathname]);

  return (
    <div className='flex min-h-screen bg-transparent text-foreground'>
      <a
        href='#app-main'
        className='absolute left-4 top-3 z-50 -translate-y-16 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition focus:translate-y-0 focus:ring-4 focus:ring-ring/18 focus:outline-none'
      >
        Saltar al contenido principal
      </a>

      <SidebarDesktop
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <AppViewport
        currentNavigationItem={currentNavigationItem}
        onOpenMobileSidebar={() => setMobileOpen(true)}
      />

      <SidebarMobile
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </div>
  );
}
