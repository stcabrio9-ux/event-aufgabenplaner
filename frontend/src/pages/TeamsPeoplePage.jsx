import { useState } from "react";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import TeamModal from "../components/TeamModal";
import PersonModal from "../components/PersonModal";
import { useAppData } from "../state/AppDataContext";

export default function TeamsPeoplePage() {
  const {
    teams,
    people,
    currentUser,
    saveTeam,
    deleteTeam,
    addPerson,
    savePerson,
    deletePerson
  } = useAppData();

  const [tab, setTab] = useState("teams");
  const [teamModal, setTeamModal] = useState(null);
  const [personModal, setPersonModal] = useState(null);

  return (
    <>
      <PageHeader
        eyebrow="Organisation"
        title="Teams & Personen"
        meta={<span>Teams und Kontakte zentral verwalten und später mehreren Events zuweisen.</span>}
      />

      <main className="page-content">
        <div className="tabs">
          <button className={tab === "teams" ? "active" : ""} onClick={() => setTab("teams")}>Teams</button>
          <button className={tab === "people" ? "active" : ""} onClick={() => setTab("people")}>Personen</button>
        </div>

        {tab === "teams" ? (
          <>
            <div className="section-title-row">
              <div>
                <h2>Teams</h2>
                <p>Ein Team kann mehreren Events zugewiesen werden.</p>
              </div>
              <button className="button primary" onClick={() => setTeamModal({})}>+ Team erstellen</button>
            </div>

            {teams.length ? (
              <div className="team-grid">
                {teams.map((team) => (
                  <article className="card team-card" key={team.id}>
                    <div>
                      <h3>{team.name}</h3>
                      <p>{team.memberIds?.length || 0} Mitglieder</p>
                    </div>
                    <div>
                      <button className="button secondary" onClick={() => setTeamModal(team)}>Bearbeiten</button>
                      <button className="link-button danger" onClick={() => deleteTeam(team.id)}>Löschen</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Noch keine Teams" text="Erstelle ein Team und füge ihm vorhandene oder neue Personen hinzu." />
            )}
          </>
        ) : (
          <>
            <div className="section-title-row">
              <div>
                <h2>Personen</h2>
                <p>Kontakte können Teams und Events zugeordnet werden. Account-Nutzer werden automatisch als Person geführt.</p>
              </div>
              <button className="button primary" onClick={() => setPersonModal({})}>+ Person hinzufügen</button>
            </div>

            {people.length ? (
              <section className="card person-directory">
                {people.map((person) => {
                  const accountLinked = Boolean(person.accountId);
                  return (
                    <div className="people-row" key={person.id}>
                      <div>
                        <strong>{person.name}</strong>
                        <span>{person.email}</span>
                      </div>
                      <div className="person-row-actions">
                        <span className="badge">{accountLinked ? "Account" : "Extern"}</span>
                        {!accountLinked ? (
                          <>
                            <button className="link-button" onClick={() => setPersonModal(person)}>Bearbeiten</button>
                            <button className="link-button danger" onClick={() => deletePerson(person.id)}>Löschen</button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </section>
            ) : (
              <EmptyState title="Noch keine Personen" text="Füge Kontakte hinzu oder registriere einen Benutzeraccount." />
            )}
          </>
        )}
      </main>

      <TeamModal
        open={teamModal !== null}
        team={teamModal?.id ? teamModal : null}
        people={people}
        onAddPerson={addPerson}
        onClose={() => setTeamModal(null)}
        onSave={saveTeam}
      />

      <PersonModal
        open={personModal !== null}
        person={personModal?.id ? personModal : null}
        onClose={() => setPersonModal(null)}
        onSave={savePerson}
      />
    </>
  );
}
