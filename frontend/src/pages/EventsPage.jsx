import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import EventModal from "../components/EventModal";
import { useAppData } from "../state/AppDataContext";

export default function EventsPage() {
  const { events, teams, people, currentUser, isAdmin, saveEvent } = useAppData();
  const [open, setOpen] = useState(false);

  const action = isAdmin ? (
    <button className="button primary" onClick={() => setOpen(true)}>+ Event erstellen</button>
  ) : (
    <Link className="button primary button-link" to="/login" state={{ from: "/events" }}>
      Anmelden, um Event zu erstellen
    </Link>
  );

  return (
    <>
      <PageHeader
        eyebrow="Veranstaltungen"
        title="Events"
        meta={<span>Alle geplanten Veranstaltungen im Überblick</span>}
        action={action}
      />

      <main className="page-content">
        {events.length ? (
          <div className="event-gallery">
            {events.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <EmptyState
            title="Noch keine Events"
            text={isAdmin
              ? "Erstelle dein erstes Event mit Beschreibung, Zeitraum, Foto und Teilnehmern."
              : "Sobald registrierte Nutzer Events anlegen, erscheinen sie hier."}
            action={action}
          />
        )}
      </main>

      {isAdmin ? (
        <EventModal
          open={open}
          teams={teams}
          people={people}
          onClose={() => setOpen(false)}
          onSave={saveEvent}
        />
      ) : null}
    </>
  );
}
