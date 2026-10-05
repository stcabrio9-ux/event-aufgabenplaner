import { useState } from "react";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import EventModal from "../components/EventModal";
import { useAppData } from "../state/AppDataContext";
import { formatDate } from "../utils/format";

export default function EventsPage() {
  const { event, tasks, updateEvent, clearAll } = useAppData();
  const [open, setOpen] = useState(false);

  const done = tasks.filter((task) => task.status === "Erledigt").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Veranstaltungen"
        title="Events"
        meta={<span>Eventdaten anlegen und bearbeiten</span>}
        action={
          <button className="button primary" type="button" onClick={() => setOpen(true)}>
            {event ? "Event bearbeiten" : "+ Neues Event"}
          </button>
        }
      />

      <main className="page-content">
        {event ? (
          <article className="card event-card">
            <div className="event-card-top">
              <div>
                <span className="eyebrow">Aktives Event</span>
                <h2>{event.name}</h2>
              </div>
              <button className="link-button danger" type="button" onClick={clearAll}>
                Projektdaten zurücksetzen
              </button>
            </div>

            <p>{formatDate(event.date)}</p>
            <div className="event-card-meta">
              <span>{event.participants || 0} Teilnehmende</span>
              <span>{tasks.length} Aufgaben</span>
            </div>

            <div className="progress-track large">
              <div className="progress-value" style={{ width: `${progress}%` }} />
            </div>
            <small>{progress} % Fortschritt</small>
          </article>
        ) : (
          <EmptyState
            title="Noch kein Event vorhanden"
            text="Lege hier dein erstes Event an."
            action={<button className="button primary" type="button" onClick={() => setOpen(true)}>Event anlegen</button>}
          />
        )}
      </main>

      <EventModal
        open={open}
        currentEvent={event}
        onClose={() => setOpen(false)}
        onSave={updateEvent}
      />
    </>
  );
}
