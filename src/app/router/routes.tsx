/**
 * Define el mapa de pantallas de primer nivel de la SPA.
 *
 * Mantiene las rutas visibles de negocio en un único lugar para que el
 * layout global pueda envolverlas sin conocer detalles de cada página.
 *
 * @remarks
 * La ruta comodín redirige al dashboard para evitar pantallas vacías cuando
 * el usuario entra por una URL antigua o mal escrita.
 */
import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UploadPage } from '@/pages/upload/UploadPage';
import { ResultsPage } from '@/pages/results/ResultsPage';
import { HistoryPage } from '@/pages/history/HistoryPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { AssistantPage } from '@/pages/assistant/AssistantPage';
import { AboutPage } from '@/pages/about/AboutPage';

/**
 * Renderiza el árbol de rutas públicas de la aplicación.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<DashboardPage />} />
      <Route path='/assistant' element={<AssistantPage />} />
      <Route path='/upload' element={<UploadPage />} />
      <Route path='/results' element={<ResultsPage />} />
      <Route path='/history' element={<HistoryPage />} />
      <Route path='/about' element={<AboutPage />} />
      <Route path='/settings' element={<SettingsPage />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}
