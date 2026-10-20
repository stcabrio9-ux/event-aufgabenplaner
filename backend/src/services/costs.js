import { query } from "../database/pool.js";
import { costRow, requireRow } from "./helpers.js";
import { AppError } from "../errors.js";

export async function listCosts(eventId) {
  const result = await query("SELECT * FROM costs WHERE event_id = $1 ORDER BY created_at DESC", [eventId]);
  return result.rows.map(costRow);
}

export async function createCost(eventId, data) {
  const result = await query("INSERT INTO costs (event_id, title, category, amount, note, task_id) SELECT $1, $2, $3, $4, $5, $6 WHERE EXISTS (SELECT 1 FROM events WHERE id = $1) RETURNING *", [eventId, data.title, data.category, data.amount, data.note ?? "", data.taskId ?? null]);
  return costRow(requireRow(result, "Event"));
}

export async function updateCost(id, data) {
  const result = await query("UPDATE costs SET title = COALESCE($2, title), category = COALESCE($3, category), amount = COALESCE($4, amount), note = COALESCE($5, note), task_id = CASE WHEN $6::boolean THEN $7::uuid ELSE task_id END WHERE id = $1 RETURNING *", [id, data.title ?? null, data.category ?? null, data.amount ?? null, data.note ?? null, Object.hasOwn(data, "taskId"), data.taskId ?? null]);
  return costRow(requireRow(result, "Kostenposition"));
}

export async function deleteCost(id) {
  const result = await query("DELETE FROM costs WHERE id = $1", [id]);
  if (!result.rowCount) throw new AppError("Kostenposition nicht gefunden.", 404, "NOT_FOUND");
}
