import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import EventModal from "../components/EventModal";
import TeamModal from "../components/TeamModal";
import { useAppData } from "../state/AppDataContext";

export default function EventPeoplePage() {
  const { event } = useOutletContext();
  const {
    teams,
    people,
    eventPeople,
    saveEvent,
    saveTeam,
    addPerson,
    canEditEvent
  } = useAppData();
  const [editEvent, setEditEvent] = useState(false);
  const [teamModal, setTeamModal] = useState(null);

  const assigned = eventPeople(event.id);
  const isOwner = canEditEvent(event.id);

  return (
    <>
      <PageHeader
        eyebrow={event.name}
        title="Teams & Personen"
        meta={<span>Mehrere Teams und einzelne Personen diesem Event zuordnen</span>}
        action={isOwner
          ? <button className="button primary" onClick={() => setEditEvent(true)}>Zuweisungen bearbeiten</button>
          : null}
      />

      <main className="page-content">
        {!isOwner ? (
          <div className="permission-note">Nur der Ersteller des Events kann Teams und Personen für dieses Event ändern.</div>
        ) : null}

        <div className="people-grid">
          <section className="card people-card">
            <div className="section-heading">
              <div>
                <h2>Zugewiesene Teams</h2>
                <p>{(event.teamIds || []).length} Teams</p>
              </div>
              {isOwner ? <button className="link-button" onClick={() => setTeamModal({})}>Neues Team</button> : null}
            </div>
            {(event.teamIds || []).length ? (
              (event.teamIds || []).map((id) => {
                const team = teams.find((item) => item.id === id);
                return team ? (
                  <div className="people-row" key={id}>
                    <div><strong>{team.name}</strong><span>{team.memberIds?.length || 0} Mitglieder</span></div>
                    {isOwner ? <button className="link-button" onClick={() => setTeamModal(team)}>Bearbeiten</button> : null}
                  </div>
                ) : null;
              })
            ) : (
              <div className="inline-empty"><p>Keine Teams zugewiesen.</p></div>
            )}
          </section>

          <section className="card people-card">
            <div className="section-heading">
              <div>
                <h2>Verfügbare Personen</h2>
                <p>Nur diese Personen können Aufgaben zugewiesen bekommen.</p>
              </div>
            </div>
            {assigned.length ? (
              assigned.map((person) => (
                <div className="people-row" key={person.id}>
                  <div><strong>{person.name}</strong><span>{person.email}</span></div>
                  <span className="badge">{person.accountId ? "Account" : "Extern"}</span>
                </div>
              ))
            ) : (
              <div className="inline-empty"><p>Noch keine Personen zugewiesen.</p></div>
            )}
          </section>
        </div>
      </main>

      {isOwner ? (
        <>
          <EventModal
            open={editEvent}
            event={event}
            teams={teams}
            people={people}
            onClose={() => setEditEvent(false)}
            onSave={saveEvent}
          />
          <TeamModal
            open={teamModal !== null}
            team={teamModal?.id ? teamModal : null}
            people={people}
            onAddPerson={addPerson}
            onClose={() => setTeamModal(null)}
            onSave={saveTeam}
          />
        </>
      ) : null}
    </>
  );
}
