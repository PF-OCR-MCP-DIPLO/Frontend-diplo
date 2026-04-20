export function AppLogo() {
  return (
    <div className='flex items-center gap-3'>
      <div className='flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#14b8a6)] text-sm font-semibold text-white shadow-sm'>
        PC
      </div>
      <div>
        <p className='text-sm font-semibold text-slate-900'>Procesador de Consignaciones</p>
        <p className='text-xs text-slate-500'>Workflow documental</p>
      </div>
    </div>
  );
}
