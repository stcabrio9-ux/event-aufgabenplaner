import { NavLink, Outlet } from "react-router-dom";
import { useAppData } from "../state/AppDataContext";
import { formatDate } from "../utils/format";

const navigation = [
  { to: "/dashboard", label: "Übersicht", icon: "⌂" },
  { to: "/events", label: "Events", icon: "◫" },
  { to: "/tasks", label: "Aufgaben", icon: "✓" },
  { to: "/costs", label: "Kosten", icon: "€" },
  { to: "/members", label: "Mitglieder", icon: "◎" }
];

export default function AppLayout() {
  const { event, tasks } = useAppData();

  const completed = tasks.filter((task) => task.status === "Erledigt").length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">EP</div>
          <div>
            <strong>Event-Aufgabenplaner</strong>
            <span>Software Engineering</span>
          </div>
        </div>

        <div className="topbar-user">
          <div className="avatar">EE</div>
          <span>Eyüp</span>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <nav className="main-navigation" aria-label="Hauptnavigation">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {event ? (
            <div className="event-preview">
              <span className="sidebar-label">Aktuelles Event</span>
              <div className="event-preview-card">
                <strong>{event.name}</strong>
                <span>{formatDate(event.date)}</span>
                <div className="progress-track">
                  <div className="progress-value" style={{ width: `${progress}%` }} />
                </div>
                <small>{progress} % erledigt</small>
              </div>
            </div>
          ) : null}
        </aside>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
