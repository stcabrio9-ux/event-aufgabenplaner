import { query } from "../database/pool.js";
import { taskRow, requireRow } from "./helpers.js";
import { AppError } from "../errors.js";

export async function listTasks(eventId) {
  const result = await query("SELECT * FROM tasks WHERE event_id = $1 ORDER BY created_at DESC", [eventId]);
  return result.rows.map(taskRow);
}

export async function createTask(eventId, data) {
  const result = await query("INSERT INTO tasks (event_id, title, status, priority, owner, due_date) SELECT $1, $2, $3, $4, $5, $6 WHERE EXISTS (SELECT 1 FROM events WHERE id = $1) RETURNING *", [eventId, data.title, data.status, data.priority, data.owner ?? null, data.dueDate ?? null]);
  return taskRow(requireRow(result, "Event"));
}

export async function updateTask(id, data) {
  const result = await query("UPDATE tasks SET title = COALESCE($2, title), status = COALESCE($3, status), priority = COALESCE($4, priority), owner = CASE WHEN $5::boolean THEN $6 ELSE owner END, due_date = CASE WHEN $7::boolean THEN $8::date ELSE due_date END, updated_at = now() WHERE id = $1 RETURNING *", [id, data.title ?? null, data.status ?? null, data.priority ?? null, Object.hasOwn(data, "owner"), data.owner ?? null, Object.hasOwn(data, "dueDate"), data.dueDate ?? null]);
  return taskRow(requireRow(result, "Aufgabe"));
}

export async function deleteTask(id) {
  const result = await query("DELETE FROM tasks WHERE id = $1", [id]);
  if (!result.rowCount) throw new AppError("Aufgabe nicht gefunden.", 404, "NOT_FOUND");
}
