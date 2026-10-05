import { useState } from "react";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import MemberModal from "../components/MemberModal";
import StatusBadge from "../components/StatusBadge";
import { useAppData } from "../state/AppDataContext";
import { initials } from "../utils/format";

export default function MembersPage() {
  const { event, members, addMember, deleteMember } = useAppData();
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow={event?.name ?? "Mitgliederverwaltung"}
        title="Mitglieder & Rechte"
        meta={<span>Mitglieder und Zugriffsrollen verwalten</span>}
        action={
          <button className="button primary" type="button" onClick={() => setOpen(true)} disabled={!event}>
            + Mitglied hinzufügen
          </button>
        }
      />

      <main className="page-content">
        {!event ? (
          <EmptyState title="Zuerst ein Event anlegen" text="Mitglieder werden einem Event zugeordnet." />
        ) : members.length ? (
          <section className="card member-list">
            {members.map((member) => (
              <article className="member-row" key={member.id}>
                <div className="member-identity">
                  <div className="avatar">{initials(member.name)}</div>
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.projectRole || "Keine Projektrolle angegeben"}</span>
                  </div>
                </div>

                <div className="member-actions">
                  <StatusBadge>{member.accessRole}</StatusBadge>
                  <button className="link-button danger" type="button" onClick={() => deleteMember(member.id)}>
                    Löschen
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <EmptyState
            title="Noch keine Mitglieder"
            text="Füge Personen hinzu und vergebe Betrachter-, Bearbeiter- oder Administratorrechte."
            action={<button className="button primary" type="button" onClick={() => setOpen(true)}>Mitglied hinzufügen</button>}
          />
        )}
      </main>

      <MemberModal open={open} onClose={() => setOpen(false)} onCreate={addMember} />
    </>
  );
}
