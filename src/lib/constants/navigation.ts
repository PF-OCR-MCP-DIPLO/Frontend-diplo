import { BarChart3, FileUp, History, LayoutDashboard, Settings } from 'lucide-react';
import type { NavigationItem } from '@/types/navigation';

export const appNavigation: NavigationItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, description: 'Resumen general' },
  { label: 'Cargar archivo', to: '/upload', icon: FileUp, description: 'Crear un nuevo job' },
  { label: 'Resultados', to: '/results', icon: BarChart3, description: 'Inspeccionar extracción' },
  { label: 'Historial', to: '/history', icon: History, description: 'Jobs anteriores' },
  { label: 'Configuración', to: '/settings', icon: Settings, description: 'OCR y modelos' },
];
