import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { useAppData } from "../state/AppDataContext";
import { formatDate, formatDateTime, isUpcoming } from "../utils/format";

export default function HomePage() {
  const {
    currentUser,
    currentPerson,
    events,
    teams,
    tasks,
    notifications
  } = useAppData();

  const upcoming = events
    .filter(isUpcoming)
    .sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""))
    .slice(0, 6);

  const ownedEvents = currentUser
    ? events.filter((event) => event.createdBy === currentUser.id)
    : [];

  const assignedEvents = currentUser && currentPerson
    ? events.filter((event) => {
        if (event.createdBy === currentUser.id) return false;
        if ((event.individualIds || []).includes(currentPerson.id)) return true;
        return (event.teamIds || []).some((teamId) =>
          teams.find((team) => team.id === teamId)?.memberIds?.includes(currentPerson.id)
        );
      })
    : [];

  const visibleEventIds = new Set([
    ...ownedEvents.map((event) => event.id),
    ...assignedEvents.map((event) => event.id)
  ]);

  const myTasks = currentPerson
    ? tasks.filter((task) =>
        task.assigneeId === currentPerson.id && visibleEventIds.has(task.eventId)
      )
    : [];

  const openTasks = myTasks.filter((task) => task.status === "Offen").length;
  const progressTasks = myTasks.filter((task) => task.status === "In Bearbeitung").length;
  const doneTasks = myTasks.filter((task) => task.status === "Erledigt").length;
  const totalTasks = myTasks.length;

  const openDegrees = totalTasks ? (openTasks / totalTasks) * 360 : 0;
  const progressDegrees = totalTasks ? (progressTasks / totalTasks) * 360 : 0;

  const taskChartStyle = totalTasks
    ? {
        background: `conic-gradient(#9aa4ae 0deg ${openDegrees}deg, #d59a54 ${openDegrees}deg ${openDegrees + progressDegrees}deg, #4d8a69 ${openDegrees + progressDegrees}deg 360deg)`
      }
    : { background: "#e7eaed" };

  const latestNotifications = currentUser
    ? notifications
        .filter((notification) => notification.userId === currentUser.id)
        .slice()
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        .slice(0, 6)
    : [];

  const unread = latestNotifications.filter((notification) => !notification.read).length;
  const eventName = (eventId) => events.find((event) => event.id === eventId)?.name || "Event";

  return (
    <>
      <PageHeader
        eyebrow="Startseite"
        title={`Herzlich willkommen${currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : ""}!`}
        meta={
          <span>
            Plane Veranstaltungen zentral, verteile Aufgaben, behalte Kosten im Blick und kommuniziere direkt im Event.
          </span>
        }
        action={
          <Link className="button primary button-link" to={currentUser ? "/events" : "/login"}>
            Event planen
          </Link>
        }
      />

      <main className="page-content">
        <section className="welcome-panel">
          <div>
            <h2>Alles rund um dein Event an einem Ort</h2>
            <p>
              Erstelle Events, stelle Teams zusammen, verteile Aufgaben und verfolge den Fortschritt.
              Über die Eventdetails gelangst du anschließend direkt in das jeweilige Management.
            </p>
          </div>
          <div className="welcome-steps">
            <span>01 Event anlegen</span>
            <span>02 Team zuweisen</span>
            <span>03 Aufgaben koordinieren</span>
          </div>
        </section>

        {currentUser ? (
          <section className="personal-dashboard">
            <div className="section-title-row compact">
              <div>
                <h2>Dein Überblick</h2>
                <p>Deine Events, Aufgaben und neuesten Aktivitäten auf einen Blick.</p>
              </div>
              <Link to="/profile">Persönlichen Bereich öffnen</Link>
            </div>

            <div className="personal-stats-grid">
              <Link className="card personal-stat-link" to="/my-events">
                <span>Eigene Events</span>
                <strong>{ownedEvents.length}</strong>
                <small>von dir erstellt</small>
              </Link>
              <Link className="card personal-stat-link" to="/my-events">
                <span>Zugewiesene Events</span>
                <strong>{assignedEvents.length}</strong>
                <small>über Team oder direkt</small>
              </Link>
              <Link className="card personal-stat-link" to="/profile">
                <span>Meine Aufgaben</span>
                <strong>{myTasks.length}</strong>
                <small>dir aktuell zugewiesen</small>
              </Link>
              <button className="card personal-stat-link personal-stat-button" type="button">
                <span>Neue Hinweise</span>
                <strong>{unread}</strong>
                <small>ungelesene Aktivitäten</small>
              </button>
            </div>

            <div className="personal-dashboard-grid">
              <section className="card personal-events-card">
                <div className="dashboard-card-heading">
                  <div>
                    <h3>Meine Events</h3>
                    <p>Eigene und dir zugewiesene Veranstaltungen.</p>
                  </div>
                  <Link to="/my-events">Alle anzeigen</Link>
                </div>

                <div className="compact-event-list">
                  {[...ownedEvents, ...assignedEvents].slice(0, 4).map((event) => (
                    <Link className="compact-event-row" to={`/events/${event.id}`} key={event.id}>
                      <div>
                        <strong>{event.name}</strong>
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <span className="compact-event-role">
                        {event.createdBy === currentUser.id ? "Ersteller" : "Zugewiesen"}
                      </span>
                    </Link>
                  ))}
                  {!ownedEvents.length && !assignedEvents.length ? (
                    <div className="dashboard-empty">Dir sind aktuell keine Events zugeordnet.</div>
                  ) : null}
                </div>
              </section>

              <section className="card personal-tasks-card">
                <div className="dashboard-card-heading">
                  <div>
                    <h3>Meine Aufgaben</h3>
                    <p>Status deiner zugewiesenen Aufgaben.</p>
                  </div>
                  <Link to="/profile">Alle anzeigen</Link>
                </div>

                <div className="task-summary-layout">
                  <div className="task-donut-wrap">
                    <div className="task-donut" style={taskChartStyle} aria-label={`${totalTasks} Aufgaben`}>
                      <div className="task-donut-hole">
                        <strong>{totalTasks}</strong>
                        <span>Aufgaben</span>
                      </div>
                    </div>
                    <div className="task-donut-legend">
                      <span><i className="legend-dot open" />Offen <b>{openTasks}</b></span>
                      <span><i className="legend-dot progress" />In Bearbeitung <b>{progressTasks}</b></span>
                      <span><i className="legend-dot done" />Erledigt <b>{doneTasks}</b></span>
                    </div>
                  </div>

                  <div className="dashboard-task-list">
                    {myTasks.slice(0, 4).map((task) => (
                      <Link
                        className="dashboard-task-row"
                        to={`/events/${task.eventId}/manage/tasks/${task.id}`}
                        key={task.id}
                      >
                        <div>
                          <span className="task-key">{task.key}</span>
                          <strong>{task.title}</strong>
                          <small>{eventName(task.eventId)}</small>
                        </div>
                        <StatusBadge>{task.status}</StatusBadge>
                      </Link>
                    ))}
                    {!myTasks.length ? (
                      <div className="dashboard-empty">Dir sind aktuell keine Aufgaben zugewiesen.</div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="card activity-card">
                <div className="dashboard-card-heading">
                  <div>
                    <h3>Neueste Aktivitäten</h3>
                    <p>Zuweisungen, Kommentare und Erwähnungen.</p>
                  </div>
                </div>

                <div className="activity-list">
                  {latestNotifications.map((notification) => (
                    <Link
                      className={`activity-row ${notification.read ? "" : "unread"}`}
                      to={notification.link || "/profile"}
                      key={notification.id}
                    >
                      <span className={`activity-icon ${notification.type || "info"}`}>
                        {notification.type === "mention" ? "@" : notification.type === "task_comment" ? "💬" : "✓"}
                      </span>
                      <div>
                        <strong>{notification.text}</strong>
                        <span>{formatDateTime(notification.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                  {!latestNotifications.length ? (
                    <div className="dashboard-empty">Noch keine neuen Aktivitäten.</div>
                  ) : null}
                </div>
              </section>
            </div>
          </section>
        ) : null}

        <div className="section-title-row">
          <div>
            <h2>Anstehende Events</h2>
            <p>Wähle ein Event aus, um Details und Management zu öffnen.</p>
          </div>
          <Link to="/events">Alle Events</Link>
        </div>

        {upcoming.length ? (
          <div className="event-gallery">
            {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <EmptyState
            title="Noch keine Events geplant"
            text="Sobald du ein Event anlegst, erscheint es hier mit Bild und den wichtigsten Informationen."
            action={
              <Link className="button primary button-link" to={currentUser ? "/events" : "/login"}>
                Erstes Event anlegen
              </Link>
            }
          />
        )}
      </main>
    </>
  );
}
