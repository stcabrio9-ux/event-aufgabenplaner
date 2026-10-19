import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TaskModal from "../components/TaskModal";
import StatusBadge from "../components/StatusBadge";
import { useAppData } from "../state/AppDataContext";
import { formatMoney, formatDate } from "../utils/format";

export default function EventOverviewPage() {
  const { event } = useOutletContext();
  const { tasks, costs, people, eventPeople, saveTask } = useAppData();
  const [open, setOpen] = useState(false);

  const eventTasks = tasks.filter((task) => task.eventId === event.id);
  const eventCosts = costs.filter((cost) => cost.eventId === event.id);
  const allowedPeople = eventPeople(event.id);
  const openCount = eventTasks.filter((task) => task.status === "Offen").length;
  const progressCount = eventTasks.filter((task) => task.status === "In Bearbeitung").length;
  const doneCount = eventTasks.filter((task) => task.status === "Erledigt").length;
  const progress = eventTasks.length
    ? Math.round((doneCount / eventTasks.length) * 100)
    : 0;

  const personName = (id) => people.find((person) => person.id === id)?.name || "Nicht zugewiesen";
  const taskCostTotal = (taskId) => eventCosts
    .filter((cost) => cost.taskId === taskId)
    .reduce((sum, cost) => sum + Number(cost.amount), 0);

  return (
    <>
      <PageHeader
        eyebrow="Eventmanagement"
        title={event.name}
        meta={<span>Aufgaben, Kosten, Teams und Kommunikation zentral verwalten</span>}
        action={<button className="button primary" onClick={() => setOpen(true)}>+ Neue Aufgabe</button>}
      />

      <main className="page-content">
        <div className="stats-grid five">
          <StatCard label="Aufgaben" value={eventTasks.length} />
          <StatCard label="Offen" value={openCount} />
          <StatCard label="In Bearbeitung" value={progressCount} />
          <StatCard label="Erledigt" value={doneCount} />
          <StatCard label="Kosten" value={formatMoney(eventCosts.reduce((sum, cost) => sum + Number(cost.amount), 0))} />
        </div>

        <section className="card progress-overview-card">
          <div className="progress-overview-head">
            <div>
              <span className="eyebrow">Fortschritt</span>
              <h2>Gesamtfortschritt des Events</h2>
              <p>{doneCount} von {eventTasks.length} Aufgaben sind erledigt.</p>
            </div>
            <strong>{progress} %</strong>
          </div>
          <div className="progress-track progress-track-large">
            <div className="progress-value" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-breakdown">
            <span><b>{openCount}</b> Offen</span>
            <span><b>{progressCount}</b> In Bearbeitung</span>
            <span><b>{doneCount}</b> Erledigt</span>
          </div>
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Aktuelle Aufgaben</h2>
              <p>Klicke eine Aufgabe an, um Details und Kommunikation zu öffnen.</p>
            </div>
            <Link to="tasks">Alle Aufgaben</Link>
          </div>

          {eventTasks.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nr.</th>
                    <th>Aufgabe</th>
                    <th>Status</th>
                    <th>Priorität</th>
                    <th>Verantwortlich</th>
                    <th>Kosten</th>
                    <th>Frist</th>
                  </tr>
                </thead>
                <tbody>
                  {eventTasks.slice(0, 8).map((task) => (
                    <tr key={task.id}>
                      <td><Link className="task-key" to={`tasks/${task.id}`}>{task.key}</Link></td>
                      <td>{task.title}</td>
                      <td><StatusBadge>{task.status}</StatusBadge></td>
                      <td><StatusBadge type="priority">{task.priority}</StatusBadge></td>
                      <td>{personName(task.assigneeId)}</td>
                      <td>{taskCostTotal(task.id) ? formatMoney(taskCostTotal(task.id)) : "—"}</td>
                      <td>{formatDate(task.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="inline-empty"><p>Noch keine Aufgaben.</p></div>
          )}
        </section>
      </main>

      <TaskModal
        open={open}
        eventId={event.id}
        people={allowedPeople}
        onClose={() => setOpen(false)}
        onSave={saveTask}
      />
    </>
  );
}
