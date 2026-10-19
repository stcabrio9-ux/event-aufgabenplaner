import { NavLink, Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import { useAppData } from "../state/AppDataContext";

export default function SiteLayout() {
  const { currentUser, isAdmin, error, clearError } = useAppData();
  const nav = [
    { to: "/", label: "Startseite", end: true },
    { to: "/events", label: "Events" },
    ...(currentUser && isAdmin
      ? [
          { to: "/my-events", label: "Meine Events" },
          { to: "/teams-people", label: "Teams & Personen" }
        ]
      : [])
  ];

  return (
    <div className="app-shell">
      <Topbar />
      <div className="app-body site-body">
        <aside className="sidebar site-sidebar">
          <nav className="main-navigation">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="content">
          {error ? <div className="form-error" role="alert">{error}<button className="link-button" type="button" onClick={clearError}>Schließen</button></div> : null}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
