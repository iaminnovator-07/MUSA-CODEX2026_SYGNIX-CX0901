import { BrowserRouter, Route, Routes } from "react-router-dom";
import AnalyticsPage from "@/features/analytics/pages/AnalyticsPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import MachineDetailPage from "@/features/machines/pages/MachineDetailPage";
import IndexPage from "@/features/landing/pages/IndexPage";
import NotFound from "@/app/routes/NotFound";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/machine/:deviceId" element={<MachineDetailPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
