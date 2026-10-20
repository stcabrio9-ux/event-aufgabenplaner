import { query } from "../database/pool.js";
import { commentRow, requireRow } from "./helpers.js";

export async function listComments(eventId) {
  const result = await query("SELECT * FROM comments WHERE event_id = $1 ORDER BY created_at ASC", [eventId]);
  return result.rows.map(commentRow);
}

export async function createComment(eventId, data, user) {
  const author = user?.name ?? data.author ?? "Unbekannt";
  const initials = author.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const result = await query("INSERT INTO comments (event_id, task_id, author_id, author, initials, text, type, to_email, subject) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9 WHERE EXISTS (SELECT 1 FROM events WHERE id = $1) RETURNING *", [eventId, data.taskId ?? null, user?.id ?? null, author, initials, data.text, data.type ?? "comment", data.toEmail ?? null, data.subject ?? null]);
  return commentRow(requireRow(result, "Event"));
}
