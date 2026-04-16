import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { DashboardPage } from "../pages/DashboardPage";
import { UploadPage } from "../pages/UploadPage";
import { ResultsPage } from "../pages/ResultsPage";
import { HistoryPage } from "../pages/HistoryPage";
import { SettingsPage } from "../pages/SettingsPage";
import { ProcessingProvider } from "../hooks/useProcessing";
import { Toaster } from "../components/ui/sonner";

function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Header onSettingsClick={() => navigate("/settings")} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ProcessingProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ProcessingProvider>
  );
}
