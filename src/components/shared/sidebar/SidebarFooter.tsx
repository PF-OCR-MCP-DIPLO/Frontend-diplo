type SidebarFooterProps = {
  collapsed: boolean;
};

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  return (
    <div className='border-t border-sidebar-border px-4 py-4'>
      {!collapsed ? (
        <div className='rounded-2xl bg-secondary/70 p-4 text-xs leading-5 text-muted-foreground'>
          Flujo pensado para revisar rapido, corregir con contexto y exportar sin perder trazabilidad.
        </div>
      ) : (
        <div className='flex justify-center'>
          <div className='size-2 rounded-full bg-accent' aria-hidden='true' />
        </div>
      )}
    </div>
  );
}