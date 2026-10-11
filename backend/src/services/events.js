import { query } from "../database/pool.js";
import { eventRow, requireRow } from "./helpers.js";

export async function listEvents() {
  const result = await query("SELECT * FROM events ORDER BY date ASC, created_at ASC");
  return result.rows.map(eventRow);
}

export async function getEvent(id) {
  return eventRow(requireRow(await query("SELECT * FROM events WHERE id = $1", [id]), "Event"));
}

export async function createEvent(data) {
  const result = await query("INSERT INTO events (id, name, date, participants) VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4) RETURNING *", [data.id ?? null, data.name, data.date, data.participants]);
  return eventRow(result.rows[0]);
}

export async function updateEvent(id, data) {
  const result = await query("UPDATE events SET name = COALESCE($2, name), date = COALESCE($3, date), participants = COALESCE($4, participants), updated_at = now() WHERE id = $1 RETURNING *", [id, data.name ?? null, data.date ?? null, data.participants ?? null]);
  return eventRow(requireRow(result, "Event"));
}

export async function deleteEvent(id) {
  const result = await query("DELETE FROM events WHERE id = $1", [id]);
  requireRow({ rowCount: result.rowCount, rows: [] }, "Event");
}
