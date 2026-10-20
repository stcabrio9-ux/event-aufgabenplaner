import { NavLink, Outlet, useParams, Link, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Topbar from "./Topbar";
import { useAppData } from "../state/AppDataContext";
import { formatDateRange } from "../utils/format";

export default function EventManagementLayout() {
  const { eventId } = useParams();
  const { events, tasks, canAccessEvent, isAdmin, loading, selectEvent } = useAppData();
  const event = events.find((item) => item.id === eventId);
  useEffect(() => { if (eventId) selectEvent(eventId); }, [eventId, selectEvent]);

  if (!event) return loading ? <main className="page-content">Event wird geladen …</main> : <Navigate to="/events" replace />;
  if (!canAccessEvent(eventId)) return <Navigate to={`/events/${eventId}`} replace />;

  const eventTasks = tasks.filter((task) => task.eventId === eventId);
  const done = eventTasks.filter((task) => task.status === "Erledigt").length;
  const total = eventTasks.length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  const base = `/events/${eventId}/manage`;

  return (
    <div className="app-shell">
      <Topbar />
      <div className="app-body">
        <aside className="sidebar">
          <Link className="back-link" to={`/events/${eventId}`}>← Eventdetails</Link>
          <nav className="main-navigation management-nav">
            <NavLink end to={base} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Übersicht</NavLink>
            <NavLink to={`${base}/tasks`} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Aufgaben</NavLink>
            {isAdmin ? <NavLink to={`${base}/costs`} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Kosten</NavLink> : null}
            {isAdmin ? <NavLink to={`${base}/people`} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Teams & Personen</NavLink> : null}
          </nav>
          <div className="event-preview">
            <span className="sidebar-label">Aktuelles Event</span>
            <div className="event-preview-card">
              <strong>{event.name}</strong>
              <span>{formatDateRange(event.startDate, event.endDate)}</span>
              <div className="progress-track"><div className="progress-value" style={{ width: `${progress}%` }} /></div>
              <small>{progress} % erledigt</small>
            </div>
          </div>
        </aside>
        <div className="content"><Outlet context={{ event }} /></div>
      </div>
    </div>
  );
}
