import { useState } from "react";
import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import TaskModal from "../components/TaskModal";
import StatusBadge from "../components/StatusBadge";
import { useAppData } from "../state/AppDataContext";
import { formatDate, formatDateTime, formatMoney, initials } from "../utils/format";

export default function TaskDetailPage() {
  const { event } = useOutletContext();
  const { taskId } = useParams();
  const {
    tasks,
    people,
    costs,
    eventPeople,
    taskMessages,
    saveTask,
    addTaskMessage,
    loading
  } = useAppData();

  const task = tasks.find((item) => item.id === taskId && item.eventId === event.id);
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState("");
  const [mentionQuery, setMentionQuery] = useState(null);
  const [email, setEmail] = useState("");
  const [emailText, setEmailText] = useState("");

  if (!task) return <main className="page-content">Aufgabe wird geladen …</main>;

  const allowed = eventPeople(event.id);
  const messages = taskMessages.filter((message) => message.taskId === taskId);
  const assignee = people.find((person) => person.id === task.assigneeId);
  const linkedCosts = costs.filter((cost) => cost.eventId === event.id && cost.taskId === task.id);
  const linkedTotal = linkedCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
  const subject = `[${task.key}] ${event.name} – ${task.title}`;

  function mentionHandle(person) {
    return person.name.split(" ")[0];
  }

  function mentionIdsFromText(value) {
    const normalized = value.toLocaleLowerCase("de-DE");
    return allowed
      .filter((person) => normalized.includes(`@${mentionHandle(person).toLocaleLowerCase("de-DE")}`))
      .map((person) => person.id);
  }

  function handleCommentChange(eventObject) {
    const value = eventObject.target.value;
    setText(value);

    const beforeCursor = value.slice(0, eventObject.target.selectionStart ?? value.length);
    const match = beforeCursor.match(/@([\p{L}\p{N}._-]*)$/u);
    setMentionQuery(match ? match[1].trimStart() : null);
  }

  function insertMention(person) {
    const textarea = document.querySelector("#task-comment-input");
    const cursor = textarea?.selectionStart ?? text.length;
    const beforeCursor = text.slice(0, cursor);
    const afterCursor = text.slice(cursor);
    const atIndex = beforeCursor.lastIndexOf("@");
    if (atIndex < 0) return;

    const handle = mentionHandle(person);
    const nextText = `${text.slice(0, atIndex)}@${handle} ${afterCursor}`;
    setText(nextText);
    setMentionQuery(null);

    requestAnimationFrame(() => {
      const nextCursor = atIndex + handle.length + 2;
      textarea?.focus();
      textarea?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function sendComment(eventObject) {
    eventObject.preventDefault();
    if (!text.trim()) return;
    addTaskMessage({
      taskId,
      eventId: event.id,
      type: "comment",
      text: text.trim(),
      mentionIds: mentionIdsFromText(text),
      link: `/events/${event.id}/manage/tasks/${task.id}`
    });
    setText("");
    setMentionQuery(null);
  }

  function sendMail(eventObject) {
    eventObject.preventDefault();
    if (!email.trim() || !emailText.trim()) return;
    addTaskMessage({
      taskId,
      eventId: event.id,
      type: "email_out",
      text: emailText.trim(),
      toEmail: email.trim(),
      subject,
      mentionIds: [],
      link: `/events/${event.id}/manage/tasks/${task.id}`
    });
    setEmailText("");
  }

  return (
    <>
      <div className="task-detail-header">
        <div>
          <Link to="../tasks">← Aufgaben</Link>
          <span className="eyebrow">{task.key}</span>
          <h1>{task.title}</h1>
          <div className="task-meta">
            <StatusBadge>{task.status}</StatusBadge>
            <StatusBadge type="priority">{task.priority}</StatusBadge>
            <span>Frist: {formatDate(task.dueDate)}</span>
            <span>Verantwortlich: {assignee?.name || "Nicht zugewiesen"}</span>
            <span>Verknüpfte Kosten: {formatMoney(linkedTotal)}</span>
          </div>
        </div>
        <button className="button secondary" onClick={() => setEdit(true)}>Aufgabe bearbeiten</button>
      </div>

      <main className="page-content task-detail-grid">
        <div>
          <section className="card task-description">
            <h2>Beschreibung</h2>
            <p>{task.description || "Keine Beschreibung hinterlegt."}</p>
          </section>

          <section className="card task-costs-card">
            <div className="section-heading">
              <div>
                <h2>Verknüpfte Kosten</h2>
                <p>Kostenpositionen, die direkt dieser Aufgabe zugeordnet wurden.</p>
              </div>
              <strong>{formatMoney(linkedTotal)}</strong>
            </div>
            {linkedCosts.length ? (
              <div className="task-linked-costs">
                {linkedCosts.map((cost) => (
                  <div className="simple-row cost-row" key={cost.id}>
                    <div>
                      <strong>{cost.title}</strong>
                      <small>{cost.category || "Sonstiges"}</small>
                    </div>
                    <span>{formatMoney(cost.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="inline-empty"><p>Noch keine Kosten mit dieser Aufgabe verknüpft.</p></div>
            )}
          </section>

          <section className="card conversation">
            <div className="section-heading">
              <div>
                <h2>Kommunikation</h2>
                <p>Kommentare, Erwähnungen und E-Mails werden chronologisch in der Aufgabe gesammelt.</p>
              </div>
            </div>

            <div className="message-list">
              {messages.length ? messages.map((message) => (
                <article className={`message ${message.type}`} key={message.id}>
                  <div className="avatar small">{initials(message.authorName)}</div>
                  <div>
                    <div className="message-head">
                      <strong>{message.authorName}</strong>
                      <span>{message.type === "email_out" ? `E-Mail an ${message.toEmail}` : message.type === "email_in" ? "E-Mail-Antwort" : "Kommentar"}</span>
                      <time>{formatDateTime(message.createdAt)}</time>
                    </div>
                    {message.subject ? <div className="mail-subject">Betreff: {message.subject}</div> : null}
                    <p>{message.text}</p>
                  </div>
                </article>
              )) : (
                <div className="inline-empty"><p>Noch keine Kommunikation.</p></div>
              )}
            </div>

            <form className="conversation-form" onSubmit={sendComment}>
              <div className="mention-composer">
                <textarea
                  id="task-comment-input"
                  rows="3"
                  value={text}
                  onChange={handleCommentChange}
                  placeholder="Kommentar schreiben ... Mit @ kannst du Personen erwähnen."
                />
                {mentionQuery !== null ? (
                  <div className="mention-suggestions">
                    {allowed
                      .filter((person) =>
                        mentionHandle(person).toLocaleLowerCase("de-DE").includes(mentionQuery.toLocaleLowerCase("de-DE"))
                      )
                      .slice(0, 6)
                      .map((person) => (
                        <button
                          type="button"
                          className="mention-suggestion"
                          key={person.id}
                          onClick={() => insertMention(person)}
                        >
                          <span className="avatar small">{initials(person.name)}</span>
                          <span>
                            <strong>@{mentionHandle(person)}</strong>
                            <small>{person.email}</small>
                          </span>
                        </button>
                      ))}
                    {!allowed.some((person) =>
                      mentionHandle(person).toLocaleLowerCase("de-DE").includes(mentionQuery.toLocaleLowerCase("de-DE"))
                    ) ? <div className="mention-empty">Keine passende Person im Event.</div> : null}
                  </div>
                ) : null}
              </div>
              <div className="composer-help">Tippe <b>@</b> und wähle eine Person aus dem Event aus.</div>
              <button className="button primary">Kommentar senden</button>
            </form>
          </section>
        </div>

        <aside>
          <section className="card email-card">
            <h2>Externe Person per E-Mail</h2>
            <p>Für Personen ohne Account. Die Aufgabennummer wird automatisch in den Betreff aufgenommen.</p>
            <form onSubmit={sendMail}>
              <label className="field">
                <span>E-Mail-Adresse</span>
                <input type="email" value={email} onChange={(eventObject) => setEmail(eventObject.target.value)} placeholder="kontakt@example.de" />
              </label>
              <label className="field">
                <span>Betreff</span>
                <input value={subject} readOnly />
              </label>
              <label className="field">
                <span>Nachricht</span>
                <textarea rows="5" value={emailText} onChange={(eventObject) => setEmailText(eventObject.target.value)} />
              </label>
              <button className="button primary">E-Mail im Ticket erfassen</button>
            </form>
            <div className="technical-note">
              <strong>Backend-Anbindung erforderlich</strong>
              <p>Der Versand und das automatische Einlesen eingehender E-Mail-Antworten werden später serverseitig umgesetzt. Der Betreffsschlüssel <code>{task.key}</code> ist dafür bereits vorgesehen.</p>
            </div>
          </section>
        </aside>
      </main>

      <TaskModal
        open={edit}
        task={task}
        eventId={event.id}
        people={allowed}
        onClose={() => setEdit(false)}
        onSave={saveTask}
      />
    </>
  );
}
