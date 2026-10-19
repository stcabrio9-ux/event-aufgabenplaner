import { query } from "../database/pool.js";
import { commentRow, requireRow } from "./helpers.js";

export async function listComments(eventId) {
  const result = await query("SELECT * FROM comments WHERE event_id = $1 ORDER BY created_at ASC", [eventId]);
  return result.rows.map(commentRow);
}

export async function createComment(eventId, data) {
  const result = await query("INSERT INTO comments (event_id, author, initials, text) SELECT $1, $2, $3, $4 WHERE EXISTS (SELECT 1 FROM events WHERE id = $1) RETURNING *", [eventId, data.author, data.initials, data.text]);
  return commentRow(requireRow(result, "Event"));
}
