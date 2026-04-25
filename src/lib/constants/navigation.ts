import { BarChart3, FileUp, History, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';
import type { NavigationItem } from '@/types/navigation';

export const appNavigation: NavigationItem[] = [
  { label: 'Resumen', to: '/', icon: LayoutDashboard, description: 'Vista general' },
  { label: 'Asistente IA', to: '/assistant', icon: MessageSquare, description: 'Chat inteligente' },
  { label: 'Carga', to: '/upload', icon: FileUp, description: 'Nuevo archivo' },
  { label: 'Resultados', to: '/results', icon: BarChart3, description: 'Revision y exportacion' },
  { label: 'Historial', to: '/history', icon: History, description: 'Ejecuciones previas' },
  { label: 'Configuracion', to: '/settings', icon: Settings, description: 'OCR y modelos' },
];
