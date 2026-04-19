export const statusLabel: Record<string, string> = {
  uploaded: "Cargado",
  processing: "Procesando",
  completed: "Completado",
  completed_with_errors: "Completado con errores",
  failed: "Fallido",
};

export const statusClass: Record<string, string> = {
  uploaded: "bg-slate-100 text-slate-700 border-slate-200",
  processing: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed_with_errors: "bg-orange-100 text-orange-800 border-orange-200",
  failed: "bg-red-100 text-red-800 border-red-200",
};
