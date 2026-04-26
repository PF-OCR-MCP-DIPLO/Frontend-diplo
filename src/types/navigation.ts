/**
 * Contrato de navegación de la app shell.
 */
import type { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
  description: string;
}
