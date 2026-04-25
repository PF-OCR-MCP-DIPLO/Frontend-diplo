import { SidebarBody } from "./SidebarBody";
import { SidebarHeader } from "./SidebarHeader";

type SidebarMobileProps = {
  open: boolean;
  onClose: () => void;
};

export function SidebarMobile({ open, onClose }: SidebarMobileProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-950/48 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-80 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar shadow-[var(--shadow-floating)]"
        onClick={(event) => event.stopPropagation()}
      >
        <SidebarHeader mobile onClose={onClose} />

        <div className="flex min-h-0 flex-1 flex-col">
          <SidebarBody collapsed={false} onNavigate={onClose} />
        </div>
      </aside>
    </div>
  );
}
