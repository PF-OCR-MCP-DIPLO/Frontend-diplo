import { AppHeader } from '@/app/layouts/AppHeader';
import { AppMain } from '@/app/layouts/AppMain';
import { NavigationItem } from '@/types/navigation';

type AppViewportProps = {
  currentNavigationItem: NavigationItem;
  onOpenMobileSidebar: () => void;
};

export function AppViewport({
  currentNavigationItem,
  onOpenMobileSidebar,
}: AppViewportProps) {
  return (
    <div className='flex min-h-screen min-w-0 flex-1 flex-col'>
      <AppHeader
        currentNavigationItem={currentNavigationItem}
        onOpenMobileSidebar={onOpenMobileSidebar}
      />
      <AppMain />
    </div>
  );
}
