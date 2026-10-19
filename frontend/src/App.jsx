import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAppData } from "./state/AppDataContext";
import SiteLayout from "./components/SiteLayout";
import EventManagementLayout from "./components/EventManagementLayout";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import MyEventsPage from "./pages/MyEventsPage";
import TeamsPeoplePage from "./pages/TeamsPeoplePage";
import ProfilePage from "./pages/ProfilePage";
import EventDetailsPage from "./pages/EventDetailsPage";
import EventOverviewPage from "./pages/EventOverviewPage";
import TasksPage from "./pages/TasksPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import CostsPage from "./pages/CostsPage";
import EventPeoplePage from "./pages/EventPeoplePage";

function RequireAuth({ children }) {
  const { currentUser } = useAppData();
  const location = useLocation();

  return currentUser
    ? children
    : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export default function App() {
  const { currentUser } = useAppData();

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <AuthPage />}
      />

      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        <Route
          path="/my-events"
          element={<RequireAuth><MyEventsPage /></RequireAuth>}
        />
        <Route
          path="/teams-people"
          element={<RequireAuth><TeamsPeoplePage /></RequireAuth>}
        />
        <Route
          path="/profile"
          element={<RequireAuth><ProfilePage /></RequireAuth>}
        />
      </Route>

      <Route
        path="/events/:eventId/manage"
        element={<RequireAuth><EventManagementLayout /></RequireAuth>}
      >
        <Route index element={<EventOverviewPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="costs" element={<CostsPage />} />
        <Route path="people" element={<EventPeoplePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
