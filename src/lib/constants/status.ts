export const statusLabel: Record<string, string> = {
  uploaded: 'Cargado',
  processing: 'Procesando',
  completed: 'Completado',
  completed_with_errors: 'Con observaciones',
  failed: 'Fallido',
};

export const statusClass: Record<string, string> = {
  uploaded: 'border-border/75 bg-white/82 text-muted-foreground',
  processing: 'border-warning/20 bg-warning/12 text-warning',
  completed: 'border-success/18 bg-success/12 text-success',
  completed_with_errors: 'border-accent/18 bg-accent/12 text-accent',
  failed: 'border-danger/18 bg-danger/12 text-danger',
};
