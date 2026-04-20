import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layouts/AppShell';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRoutes } from '@/app/router/routes';

export default function App() {
  return (
    <AppProviders>
      <Routes>
        <Route element={<AppShell />}>
          <Route path='*' element={<AppRoutes />} />
        </Route>
      </Routes>
    </AppProviders>
  );
}
