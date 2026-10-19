import { AppError } from "../errors.js";

export function requireRow(result, resource = "Ressource") {
  if (!result.rowCount) throw new AppError(`${resource} nicht gefunden.`, 404, "NOT_FOUND");
  return result.rows[0];
}

export function eventRow(row) {
  return { id: row.id, name: row.name, date: row.date, participants: row.participants };
}

export function taskRow(row) {
  return { id: row.id, eventId: row.event_id, title: row.title, status: row.status, priority: row.priority, owner: row.owner, dueDate: row.due_date };
}

export function memberRow(row) {
  return { id: row.id, eventId: row.event_id, name: row.name, projectRole: row.project_role, accessRole: row.access_role };
}

export function costRow(row) {
  return { id: row.id, eventId: row.event_id, title: row.title, category: row.category, amount: Number(row.amount) };
}

export function commentRow(row) {
  return { id: row.id, eventId: row.event_id, author: row.author, initials: row.initials, text: row.text, createdAt: row.created_at };
}
