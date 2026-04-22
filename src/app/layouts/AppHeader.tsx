import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationItem } from '@/types/navigation';

type AppHeaderProps = {
  currentNavigationItem: NavigationItem;
  onOpenMobileSidebar: () => void;
};

export function AppHeader({
  currentNavigationItem,
  onOpenMobileSidebar,
}: AppHeaderProps) {
  return (
    <header className='sticky top-0 z-30 border-b border-border/70 bg-card/82 backdrop-blur-xl'>
      <div className='page-shell flex items-center justify-between gap-4 px-4 py-4 sm:px-6'>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='icon'
            aria-label='Abrir menu de navegacion'
            className='lg:hidden'
            onClick={onOpenMobileSidebar}
          >
            <Menu className='size-4' />
          </Button>

          <div className='space-y-1'>
            <p className='section-kicker'>Plataforma</p>
            <p className='text-sm font-semibold text-foreground sm:text-base'>
              {currentNavigationItem.label}
            </p>
            <p className='text-xs text-muted-foreground sm:text-sm'>
              {currentNavigationItem.description}
            </p>
          </div>
        </div>

        <div className='hidden items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent shadow-[var(--shadow-soft)] sm:flex'>
          <span className='size-2 rounded-full bg-accent' aria-hidden='true' />
          Conectado
        </div>
      </div>
    </header>
  );
}