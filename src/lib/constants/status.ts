export const statusLabel: Record<string, string> = {
  uploaded: 'Cargado',
  processing: 'Procesando',
  completed: 'Completado',
  completed_with_errors: 'Completado con errores',
  failed: 'Fallido',
};

export const statusClass: Record<string, string> = {
  uploaded: 'border-slate-200 bg-slate-100 text-slate-700',
  processing: 'border-amber-200 bg-amber-100 text-amber-800',
  completed: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  completed_with_errors: 'border-orange-200 bg-orange-100 text-orange-800',
  failed: 'border-red-200 bg-red-100 text-red-800',
};
