type SidebarFooterProps = {
  collapsed: boolean;
};

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  return (
    <div className='border-t border-sidebar-border px-4 py-4'>
      {!collapsed ? (
        <div className='rounded-2xl bg-secondary/70 p-4 text-xs leading-5 text-muted-foreground transition-colors hover:bg-secondary/80'>
          <div className='flex items-center justify-between'>
            <span className='font-mono font-bold text-foreground'>CONDI</span>
            <span className='flex items-center gap-1 text-[10px]'>
              <span className='inline-block h-1.5 w-1.5 rounded-full bg-green-500' />
              Activo
            </span>
          </div>
        </div>
      ) : (
        <div
          className='flex justify-center group'
          title='CONDI - Gestión de consignaciones'
        >
          <div
            className='size-2 rounded-full bg-accent animate-pulse'
            aria-hidden='true'
          />
          <span className='sr-only'>CONDI app</span>
        </div>
      )}
    </div>
  );
}