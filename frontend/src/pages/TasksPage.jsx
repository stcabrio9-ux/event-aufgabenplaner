import { useState } from "react";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import TaskTable from "../components/TaskTable";
import NewTaskModal from "../components/NewTaskModal";
import { useAppData } from "../state/AppDataContext";

export default function TasksPage() {
  const { event, tasks, members, addTask, updateTask, deleteTask } = useAppData();
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow={event?.name ?? "Aufgabenverwaltung"}
        title="Aufgaben"
        meta={<span>Status, Priorität, Frist und Zuständigkeit verwalten</span>}
        action={
          <button className="button primary" type="button" onClick={() => setOpen(true)} disabled={!event}>
            + Neue Aufgabe
          </button>
        }
      />

      <main className="page-content">
        {!event ? (
          <EmptyState title="Zuerst ein Event anlegen" text="Aufgaben werden immer einem Event zugeordnet." />
        ) : tasks.length ? (
          <section className="card">
            <TaskTable
              tasks={tasks}
              onStatusChange={(id, status) => updateTask(id, { status })}
              onDelete={deleteTask}
            />
          </section>
        ) : (
          <EmptyState
            title="Noch keine Aufgaben"
            text="Lege die erste Aufgabe für dieses Event an."
            action={<button className="button primary" type="button" onClick={() => setOpen(true)}>Aufgabe anlegen</button>}
          />
        )}
      </main>

      <NewTaskModal
        open={open}
        members={members}
        onClose={() => setOpen(false)}
        onCreate={addTask}
      />
    </>
  );
}
