import { useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import EventModal from "../components/EventModal";
import { useAppData } from "../state/AppDataContext";
import { formatDateRange } from "../utils/format";

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const location = useLocation();
  const {
    events,
    teams,
    people,
    accounts,
    currentUser,
    saveEvent,
    deleteEvent,
    eventPeople,
    canEditEvent,
    canAccessEvent
  } = useAppData();
  const [edit, setEdit] = useState(false);

  const event = events.find((item) => item.id === eventId);
  if (!event) return <Navigate to="/events" replace />;

  const members = eventPeople(eventId);
  const owner = accounts.find((account) => account.id === event.createdBy);
  const isOwner = canEditEvent(eventId);
  const canManage = canAccessEvent(eventId);

  return (
    <main className="event-details-page">
      <div className="event-hero">
        {event.image ? <img src={event.image} alt="" /> : <div className="hero-placeholder">Event</div>}
        <div className="event-hero-overlay">
          <span>{formatDateRange(event.startDate, event.endDate)}</span>
          <h1>{event.name}</h1>
          <p>{event.location || "Ort noch nicht festgelegt"}</p>
        </div>
      </div>

      <div className="event-detail-content">
        <div className="event-detail-main">
          <div className="detail-actions">
            {isOwner ? (
              <button className="button secondary" onClick={() => setEdit(true)}>Event bearbeiten</button>
            ) : null}

            {canManage ? (
              <Link className="button primary button-link" to={`/events/${eventId}/manage`}>Management starten</Link>
            ) : currentUser ? (
              <span className="access-note">Management nur für zugewiesene Mitglieder.</span>
            ) : (
              <Link
                className="button primary button-link"
                to="/login"
                state={{ from: location.pathname }}
              >
                Anmelden für Management
              </Link>
            )}
          </div>

          <section>
            <span className="eyebrow">Beschreibung</span>
            <p className="event-description">{event.description || "Noch keine Beschreibung hinterlegt."}</p>
          </section>

          <div className="detail-grid">
            <section className="card detail-card">
              <span>Zeitraum</span>
              <strong>{formatDateRange(event.startDate, event.endDate)}</strong>
              <small>{[event.startTime, event.endTime].filter(Boolean).join(" – ") || "Keine Uhrzeit festgelegt"}</small>
            </section>
            <section className="card detail-card">
              <span>Ort</span>
              <strong>{event.location || "Nicht festgelegt"}</strong>
            </section>
            <section className="card detail-card">
              <span>Personen</span>
              <strong>{members.length}</strong>
              <small>{(event.teamIds || []).length} Teams zugewiesen</small>
            </section>
          </div>
        </div>

        <aside className="event-detail-side card">
          <h2>Veranstalter</h2>
          <div className="simple-row">
            {owner?.name || "Unbekannt"}
            {owner?.email ? <small>{owner.email}</small> : null}
          </div>

          <h2>Zugewiesene Teams</h2>
          {(event.teamIds || []).length ? (
            (event.teamIds || []).map((id) => (
              <div className="simple-row" key={id}>{teams.find((team) => team.id === id)?.name || "Unbekannt"}</div>
            ))
          ) : <p>Keine Teams zugewiesen.</p>}

          <h2>Personen</h2>
          {members.length ? (
            members.slice(0, 8).map((person) => (
              <div className="simple-row" key={person.id}>{person.name}<small>{person.email}</small></div>
            ))
          ) : <p>Keine Personen zugewiesen.</p>}

          {isOwner ? (
            <button
              className="link-button danger delete-event"
              onClick={() => { if (confirm("Event wirklich löschen?")) deleteEvent(event.id); }}
            >
              Event löschen
            </button>
          ) : null}
        </aside>
      </div>

      {isOwner ? (
        <EventModal
          open={edit}
          event={event}
          teams={teams}
          people={people}
          onClose={() => setEdit(false)}
          onSave={saveEvent}
        />
      ) : null}
    </main>
  );
}
