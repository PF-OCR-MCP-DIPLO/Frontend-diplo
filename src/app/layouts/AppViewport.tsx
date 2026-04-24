import { AppHeader } from '@/app/layouts/AppHeader';
import { AppMain } from '@/app/layouts/AppMain';
import { NavigationItem } from '@/types/navigation';
import { AppFooter } from './AppFooter';

type AppViewportProps = {
  currentNavigationItem: NavigationItem;
  onOpenMobileSidebar: () => void;
  showAssistant: boolean;
  onToggleAssistant: () => void;
};

export function AppViewport({
  currentNavigationItem,
  onOpenMobileSidebar,
  showAssistant,
  onToggleAssistant,
}: AppViewportProps) {
  return (
    <div className='flex min-h-screen min-w-0 flex-1 flex-col'>
      <AppHeader
        currentNavigationItem={currentNavigationItem}
        onOpenMobileSidebar={onOpenMobileSidebar}
        showAssistant={showAssistant}
        onToggleAssistant={onToggleAssistant}
      />
      <AppMain />
    </div>
  );
}
