import { query } from "../database/pool.js";
import { requireRow, teamRow } from "./helpers.js";
import { AppError } from "../errors.js";

const select = `SELECT t.*, COALESCE((SELECT json_agg(tm.person_id ORDER BY tm.person_id) FROM team_members tm WHERE tm.team_id=t.id), '[]'::json) AS member_ids FROM teams t`;
async function syncMembers(teamId, memberIds = []) {
  await query("DELETE FROM team_members WHERE team_id=$1", [teamId]);
  for (const personId of memberIds) await query("INSERT INTO team_members (team_id, person_id) SELECT $1,id FROM people WHERE id=$2 ON CONFLICT DO NOTHING", [teamId, personId]);
}
export async function listTeams() { return (await query(`${select} ORDER BY t.name ASC`)).rows.map(teamRow); }
export async function createTeam(data, userId) {
  const result = await query("INSERT INTO teams (name, created_by) VALUES ($1,$2) RETURNING id", [data.name, userId ?? null]);
  await syncMembers(result.rows[0].id, data.memberIds ?? []);
  return teamRow(requireRow(await query(`${select} WHERE t.id=$1`, [result.rows[0].id]), "Team"));
}
export async function updateTeam(id, data) {
  const result = await query("UPDATE teams SET name=COALESCE($2,name), updated_at=now() WHERE id=$1 RETURNING id", [id, data.name ?? null]);
  const team = requireRow(result, "Team");
  if (data.memberIds !== undefined) await syncMembers(id, data.memberIds);
  return teamRow(requireRow(await query(`${select} WHERE t.id=$1`, [team.id]), "Team"));
}
export async function deleteTeam(id) {
  const result = await query("DELETE FROM teams WHERE id=$1", [id]);
  if (!result.rowCount) throw new AppError("Team nicht gefunden.", 404, "NOT_FOUND");
}
