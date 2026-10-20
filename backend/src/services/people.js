import { query } from "../database/pool.js";
import { personRow, requireRow } from "./helpers.js";
import { AppError } from "../errors.js";

export async function listPeople() { return (await query("SELECT * FROM people ORDER BY name ASC")).rows.map(personRow); }
export async function createPerson(data) {
  const result = await query("INSERT INTO people (name, email, project_role, access_role, account_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", [data.name, data.email, data.projectRole ?? null, data.accessRole ?? "Bearbeiter", data.accountId ?? null]);
  return personRow(result.rows[0]);
}
export async function updatePerson(id, data) {
  const result = await query("UPDATE people SET name=COALESCE($2,name), email=COALESCE($3,email), project_role=COALESCE($4,project_role), access_role=COALESCE($5,access_role), updated_at=now() WHERE id=$1 RETURNING *", [id, data.name ?? null, data.email ?? null, data.projectRole ?? null, data.accessRole ?? null]);
  return personRow(requireRow(result, "Person"));
}
export async function deletePerson(id) {
  const result = await query("DELETE FROM people WHERE id=$1", [id]);
  if (!result.rowCount) throw new AppError("Person nicht gefunden.", 404, "NOT_FOUND");
}
