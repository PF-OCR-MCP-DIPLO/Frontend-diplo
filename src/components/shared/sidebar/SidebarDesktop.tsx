import { SidebarBody } from "./SidebarBody";
import { SidebarHeader } from "./SidebarHeader";


type SidebarDesktopProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function SidebarDesktop({
  collapsed,
  onToggle,
}: SidebarDesktopProps) {
  return (
    <aside
      className={`sticky top-0 z-30 hidden border-r border-sidebar-border bg-sidebar/92 backdrop-blur-xl lg:flex lg:flex-col ${
        collapsed ? 'lg:w-24' : 'lg:w-80'
      } h-screen overflow-y-auto`}
    >
      <SidebarHeader collapsed={collapsed} onToggle={onToggle} />

      <div className='flex min-h-0 flex-1 flex-col'>
        <SidebarBody collapsed={collapsed} />
      </div>
    </aside>
  );
}
