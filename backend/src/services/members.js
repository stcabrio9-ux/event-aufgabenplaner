import { query } from "../database/pool.js";
import { memberRow, requireRow } from "./helpers.js";
import { AppError } from "../errors.js";

const memberSelect = `
  SELECT m.id, m.event_id, p.id AS person_id, p.account_id, p.name, p.email, p.project_role, p.access_role
  FROM members m JOIN people p ON p.id = m.person_id
  WHERE m.event_id = $1
  UNION
  SELECT ep.person_id, ep.event_id, p.id, p.account_id, p.name, p.email, p.project_role, p.access_role
  FROM event_people ep JOIN people p ON p.id = ep.person_id
  WHERE ep.event_id = $1
  UNION
  SELECT tm.person_id, et.event_id, p.id, p.account_id, p.name, p.email, p.project_role, p.access_role
  FROM event_teams et JOIN team_members tm ON tm.team_id = et.team_id JOIN people p ON p.id = tm.person_id
  WHERE et.event_id = $1`;

export async function listMembers(eventId) {
  const result = await query(`SELECT DISTINCT ON (person_id) * FROM (${memberSelect}) AS event_members ORDER BY person_id, id`, [eventId]);
  return result.rows.sort((a, b) => a.name.localeCompare(b.name)).map(memberRow);
}

export async function createMember(eventId, data) {
  const event = await query("SELECT 1 FROM events WHERE id=$1", [eventId]);
  requireRow(event, "Event");
  const person = await query("INSERT INTO people (name, email, project_role, access_role) VALUES ($1,$2,$3,$4) RETURNING id", [data.name, data.email ?? `${data.name.replace(/\s+/g, ".").toLowerCase()}@local.invalid`, data.projectRole ?? null, data.accessRole ?? "Betrachter"]);
  const result = await query("INSERT INTO members (event_id, person_id, name, project_role, access_role) VALUES ($1, $2, $3, $4, $5) RETURNING id", [eventId, person.rows[0].id, data.name, data.projectRole ?? null, data.accessRole ?? "Betrachter"]);
  await query("INSERT INTO event_people (event_id, person_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [eventId, person.rows[0].id]);
  return memberRow((await query("SELECT m.id, m.event_id, p.id AS person_id, p.account_id, p.name, p.email, p.project_role, p.access_role FROM members m JOIN people p ON p.id=m.person_id WHERE m.id=$1", [result.rows[0].id])).rows[0]);
}

export async function deleteMember(id) {
  const result = await query("DELETE FROM members WHERE id=$1", [id]);
  if (!result.rowCount) throw new AppError("Mitglied nicht gefunden.", 404, "NOT_FOUND");
}
