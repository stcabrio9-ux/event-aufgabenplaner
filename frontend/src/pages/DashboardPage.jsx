import { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TaskTable from "../components/TaskTable";
import ProgressCard from "../components/ProgressCard";
import CommentCard from "../components/CommentCard";
import EmptyState from "../components/EmptyState";
import EventModal from "../components/EventModal";
import NewTaskModal from "../components/NewTaskModal";
import { useAppData } from "../state/AppDataContext";
import { formatDate, formatMoney } from "../utils/format";

export default function DashboardPage() {
  const {
    event,
    tasks,
    costs,
    members,
    updateEvent,
    addTask,
    updateTask,
    deleteTask
  } = useAppData();

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const open = tasks.filter((task) => task.status === "Offen").length;
  const inProgress = tasks.filter((task) => task.status === "In Bearbeitung").length;
  const done = tasks.filter((task) => task.status === "Erledigt").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const totalCosts = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);

  if (!event) {
    return (
      <>
        <PageHeader
          eyebrow="Event-Aufgabenplaner"
          title="Übersicht"
          meta={<span>Lege zuerst ein Event an.</span>}
        />
        <main className="page-content">
          <EmptyState
            title="Noch kein Event vorhanden"
            text="Erstelle ein Event. Danach kannst du Aufgaben, Mitglieder, Kommentare und Kosten hinzufügen."
            action={
              <button className="button primary" type="button" onClick={() => setEventModalOpen(true)}>
                Event anlegen
              </button>
            }
          />
        </main>
        <EventModal
          open={eventModalOpen}
          currentEvent={null}
          onClose={() => setEventModalOpen(false)}
          onSave={updateEvent}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Event"
        title={event.name}
        meta={
          <>
            <span>{formatDate(event.date)}</span>
            <span>{event.participants || 0} Teilnehmende</span>
            <span>{members.length} Mitglieder</span>
          </>
        }
        action={
          <div className="header-actions">
            <button className="button secondary" type="button" onClick={() => setEventModalOpen(true)}>
              Event bearbeiten
            </button>
            <button className="button primary" type="button" onClick={() => setTaskModalOpen(true)}>
              + Neue Aufgabe
            </button>
          </div>
        }
      />

      <main className="page-content">
        <div className="stats-grid">
          <StatCard label="Aufgaben gesamt" value={tasks.length} />
          <StatCard label="Offen" value={open} />
          <StatCard label="In Bearbeitung" value={inProgress} />
          <StatCard label="Erledigt" value={done} />
          <StatCard label="Erfasste Kosten" value={formatMoney(totalCosts)} />
        </div>

        <div className="dashboard-grid">
          <section className="card">
            <div className="section-heading">
              <div>
                <h2>Aktuelle Aufgaben</h2>
                <p>Status, Priorität, Zuständigkeit und Frist</p>
              </div>
            </div>

            {tasks.length ? (
              <TaskTable
                tasks={tasks.slice(0, 6)}
                onStatusChange={(id, status) => updateTask(id, { status })}
                onDelete={deleteTask}
              />
            ) : (
              <div className="inline-empty">
                <p>Noch keine Aufgaben vorhanden.</p>
                <button className="button secondary" type="button" onClick={() => setTaskModalOpen(true)}>
                  Erste Aufgabe anlegen
                </button>
              </div>
            )}
          </section>

          <div className="dashboard-side">
            <ProgressCard progress={progress} done={done} total={tasks.length} />
            <CommentCard />
          </div>
        </div>
      </main>

      <EventModal
        open={eventModalOpen}
        currentEvent={event}
        onClose={() => setEventModalOpen(false)}
        onSave={updateEvent}
      />

      <NewTaskModal
        open={taskModalOpen}
        members={members}
        onClose={() => setTaskModalOpen(false)}
        onCreate={addTask}
      />
    </>
  );
}
