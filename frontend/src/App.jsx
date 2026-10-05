import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/EventsPage";
import TasksPage from "./pages/TasksPage";
import CostsPage from "./pages/CostsPage";
import MembersPage from "./pages/MembersPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/costs" element={<CostsPage />} />
        <Route path="/members" element={<MembersPage />} />
      </Route>
    </Routes>
  );
}
