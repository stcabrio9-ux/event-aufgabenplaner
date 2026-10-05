import StatusBadge from "./StatusBadge";
import { formatDate } from "../utils/format";

export default function TaskTable({ tasks, onStatusChange, onDelete }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Aufgabe</th>
            <th>Status</th>
            <th>Priorität</th>
            <th>Verantwortlich</th>
            <th>Frist</th>
            {onDelete ? <th></th> : null}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="task-name">{task.title}</td>
              <td>
                {onStatusChange ? (
                  <select
                    className="table-select"
                    value={task.status}
                    onChange={(event) =>
                      onStatusChange(task.id, event.target.value)
                    }
                  >
                    <option>Offen</option>
                    <option>In Bearbeitung</option>
                    <option>Erledigt</option>
                  </select>
                ) : (
                  <StatusBadge>{task.status}</StatusBadge>
                )}
              </td>
              <td><StatusBadge type="priority">{task.priority}</StatusBadge></td>
              <td>{task.owner || "Nicht zugewiesen"}</td>
              <td>{formatDate(task.dueDate)}</td>
              {onDelete ? (
                <td className="table-actions">
                  <button className="link-button danger" type="button" onClick={() => onDelete(task.id)}>
                    Löschen
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
