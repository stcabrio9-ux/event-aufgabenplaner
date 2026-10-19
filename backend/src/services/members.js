import { query } from "../database/pool.js";
import { memberRow, requireRow } from "./helpers.js";
import { AppError } from "../errors.js";

export async function listMembers(eventId) {
  const result = await query("SELECT * FROM members WHERE event_id = $1 ORDER BY created_at ASC", [eventId]);
  return result.rows.map(memberRow);
}

export async function createMember(eventId, data) {
  const result = await query("INSERT INTO members (event_id, name, project_role, access_role) SELECT $1, $2, $3, $4 WHERE EXISTS (SELECT 1 FROM events WHERE id = $1) RETURNING *", [eventId, data.name, data.projectRole ?? null, data.accessRole]);
  return memberRow(requireRow(result, "Event"));
}

export async function deleteMember(id) {
  const result = await query("DELETE FROM members WHERE id = $1", [id]);
  if (!result.rowCount) throw new AppError("Mitglied nicht gefunden.", 404, "NOT_FOUND");
}
