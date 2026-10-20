import { query } from "../database/pool.js";
import { eventRow, requireRow } from "./helpers.js";

const eventSelect = `
  SELECT e.*,
    COALESCE((SELECT json_agg(et.team_id ORDER BY et.team_id) FROM event_teams et WHERE et.event_id = e.id), '[]'::json) AS team_ids,
    COALESCE((SELECT json_agg(ep.person_id ORDER BY ep.person_id) FROM event_people ep WHERE ep.event_id = e.id), '[]'::json) AS individual_ids
  FROM events e`;

async function syncAssignments(eventId, teamIds, individualIds) {
  if (teamIds !== undefined) {
    await query("DELETE FROM event_teams WHERE event_id = $1", [eventId]);
    for (const teamId of teamIds) {
      await query("INSERT INTO event_teams (event_id, team_id) SELECT $1, id FROM teams WHERE id = $2 ON CONFLICT DO NOTHING", [eventId, teamId]);
    }
  }
  if (individualIds !== undefined) {
    await query("DELETE FROM event_people WHERE event_id = $1", [eventId]);
    for (const personId of individualIds) {
      await query("INSERT INTO event_people (event_id, person_id) SELECT $1, id FROM people WHERE id = $2 ON CONFLICT DO NOTHING", [eventId, personId]);
    }
  }
}

export async function listEvents() {
  const result = await query(`${eventSelect} ORDER BY e.start_date ASC, e.created_at ASC`);
  return result.rows.map(eventRow);
}

export async function getEvent(id) {
  return eventRow(requireRow(await query(`${eventSelect} WHERE e.id = $1`, [id]), "Event"));
}

export async function createEvent(data, createdBy) {
  const startDate = data.startDate || data.date;
  const endDate = data.endDate || startDate;
  const result = await query(`
    INSERT INTO events (id, name, date, start_date, end_date, start_time, end_time, description, location, image, participants, created_by)
    VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id`,
    [data.id ?? null, data.name, startDate, endDate, data.startTime ?? null, data.endTime ?? null, data.description ?? "", data.location ?? "", data.image ?? null, data.participants ?? 0, createdBy ?? null]);
  const id = result.rows[0].id;
  await syncAssignments(id, data.teamIds ?? [], data.individualIds ?? []);
  return getEvent(id);
}

export async function updateEvent(id, data) {
  const result = await query(`
    UPDATE events SET
      name = COALESCE($2, name),
      date = COALESCE($3, date),
      start_date = COALESCE($3, start_date),
      end_date = COALESCE($4, end_date),
      start_time = CASE WHEN $5::boolean THEN $6::time ELSE start_time END,
      end_time = CASE WHEN $7::boolean THEN $8::time ELSE end_time END,
      description = COALESCE($9, description),
      location = COALESCE($10, location),
      image = CASE WHEN $11::boolean THEN $12 ELSE image END,
      participants = COALESCE($13, participants),
      updated_at = now()
    WHERE id = $1 RETURNING id`,
    [id, data.name ?? null, data.startDate ?? data.date ?? null, data.endDate ?? null, Object.hasOwn(data, "startTime"), data.startTime ?? null, Object.hasOwn(data, "endTime"), data.endTime ?? null, data.description ?? null, data.location ?? null, Object.hasOwn(data, "image"), data.image ?? null, data.participants ?? null]);
  const event = requireRow(result, "Event");
  await syncAssignments(id, data.teamIds, data.individualIds);
  return getEvent(event.id);
}

export async function deleteEvent(id) {
  const result = await query("DELETE FROM events WHERE id = $1", [id]);
  requireRow({ rowCount: result.rowCount, rows: [] }, "Event");
}
