import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UploadPage } from '@/pages/upload/UploadPage';
import { ResultsPage } from '@/pages/results/ResultsPage';
import { HistoryPage } from '@/pages/history/HistoryPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { AssistantPage } from '@/pages/assistant/AssistantPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<DashboardPage />} />
      <Route path='/assistant' element={<AssistantPage />} />
      <Route path='/upload' element={<UploadPage />} />
      <Route path='/results' element={<ResultsPage />} />
      <Route path='/history' element={<HistoryPage />} />
      <Route path='/settings' element={<SettingsPage />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}
