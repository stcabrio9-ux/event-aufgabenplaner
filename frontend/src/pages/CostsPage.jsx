import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import CostModal from "../components/CostModal";
import StatCard from "../components/StatCard";
import { useAppData } from "../state/AppDataContext";
import { formatMoney } from "../utils/format";

export default function CostsPage() {
  const { event } = useOutletContext();
  const { costs, tasks, isAdmin, saveCost, deleteCost } = useAppData();
  const [modal, setModal] = useState(null);
  const removeCost = (id) => {
    if (window.confirm("Kostenposition wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.")) deleteCost(id);
  };

  const list = costs.filter((cost) => cost.eventId === event.id);
  const eventTasks = tasks.filter((task) => task.eventId === event.id);
  const total = list.reduce((sum, cost) => sum + Number(cost.amount), 0);
  const linkedCount = list.filter((cost) => cost.taskId).length;
  const taskById = (id) => eventTasks.find((task) => task.id === id);

  return (
    <>
      <PageHeader
        eyebrow={event.name}
        title="Kosten"
        meta={<span>Kostenpositionen erfassen, bearbeiten und mit Aufgaben verknüpfen</span>}
        action={isAdmin ? <button className="button primary" onClick={() => setModal({})}>+ Kosten erfassen</button> : null}
      />

      <main className="page-content">
        <div className="cost-summary three">
          <StatCard label="Gesamtkosten" value={formatMoney(total)} />
          <StatCard label="Positionen" value={list.length} />
          <StatCard label="Mit Aufgaben verknüpft" value={linkedCount} />
        </div>

        {list.length ? (
          <section className="card">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Kategorie</th>
                    <th>Verknüpfte Aufgabe</th>
                    <th>Notiz</th>
                    <th>Betrag</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((cost) => {
                    const task = taskById(cost.taskId);
                    return (
                      <tr key={cost.id}>
                        <td className="task-name">{cost.title}</td>
                        <td>{cost.category || "Sonstiges"}</td>
                        <td>
                          {task ? (
                            <Link className="task-key" to={`../tasks/${task.id}`}>{task.key} · {task.title}</Link>
                          ) : "—"}
                        </td>
                        <td>{cost.note || "—"}</td>
                        <td>{formatMoney(cost.amount)}</td>
                        <td className="table-actions">
                          {isAdmin ? <button className="link-button" onClick={() => setModal(cost)}>Bearbeiten</button> : null}
                          {isAdmin ? <button className="link-button danger" onClick={() => removeCost(cost.id)}>Löschen</button> : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <EmptyState
            title="Noch keine Kosten"
            text="Erfasste Positionen können anschließend jederzeit bearbeitet und optional einer Aufgabe zugeordnet werden."
          />
        )}
      </main>

      {isAdmin ? <CostModal
        open={modal !== null}
        cost={modal?.id ? modal : null}
        eventId={event.id}
        tasks={eventTasks}
        onClose={() => setModal(null)}
        onSave={saveCost}
      /> : null}
    </>
  );
}
