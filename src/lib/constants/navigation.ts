import { BarChart3, FileUp, History, LayoutDashboard, Settings } from 'lucide-react';
import type { NavigationItem } from '@/types/navigation';

export const appNavigation: NavigationItem[] = [
  { label: 'Resumen', to: '/', icon: LayoutDashboard, description: 'Visibilidad general del flujo operativo' },
  { label: 'Carga', to: '/upload', icon: FileUp, description: 'Crear un nuevo procesamiento desde Word' },
  { label: 'Resultados', to: '/results', icon: BarChart3, description: 'Validar extracciones, errores y exportacion' },
  { label: 'Historial', to: '/history', icon: History, description: 'Retomar ejecuciones anteriores y comparar estados' },
  { label: 'Configuracion', to: '/settings', icon: Settings, description: 'Ajustar OCR, modelos y tiempos de respuesta' },
];
