import { useMemo } from "react";
import PageHeader from "../components/PageHeader";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import { useAppData } from "../state/AppDataContext";

export default function MyEventsPage() {
  const { events, teams, currentUser, currentPerson } = useAppData();

  const mine = useMemo(() => events.filter((event) =>
    event.createdBy === currentUser?.id ||
    (event.individualIds || []).includes(currentPerson?.id) ||
    (event.teamIds || []).some((teamId) =>
      teams.find((team) => team.id === teamId)?.memberIds?.includes(currentPerson?.id)
    )
  ), [events, teams, currentUser, currentPerson]);

  return (
    <>
      <PageHeader
        eyebrow="Persönlicher Bereich"
        title="Meine Events"
        meta={<span>Events, die du erstellt hast oder denen du direkt bzw. über ein Team zugewiesen bist.</span>}
      />
      <main className="page-content">
        {mine.length ? (
          <div className="event-gallery">
            {mine.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <EmptyState
            title="Noch keine zugewiesenen Events"
            text="Events, die du erstellst oder denen du zugewiesen wirst, erscheinen hier."
          />
        )}
      </main>
    </>
  );
}
