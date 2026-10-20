import { AppError } from "../errors.js";

export function requireRow(result, resource = "Ressource") {
  if (!result.rowCount) throw new AppError(`${resource} nicht gefunden.`, 404, "NOT_FOUND");
  return result.rows[0];
}

export function eventRow(row) {
  const dateOnly = (value) => value ? String(value instanceof Date ? value.toISOString() : value).slice(0, 10) : "";
  const jsonArray = (value) => Array.isArray(value) ? value : (typeof value === "string" ? JSON.parse(value) : []);
  return { id: row.id, name: row.name, date: dateOnly(row.date), startDate: dateOnly(row.start_date || row.date), endDate: dateOnly(row.end_date || row.start_date || row.date), startTime: row.start_time ? String(row.start_time).slice(0, 5) : "", endTime: row.end_time ? String(row.end_time).slice(0, 5) : "", description: row.description || "", location: row.location || "", image: row.image || "", participants: row.participants, createdBy: row.created_by, teamIds: jsonArray(row.team_ids), individualIds: jsonArray(row.individual_ids) };
}

export function taskRow(row) {
  const dueDate = row.due_date ? String(row.due_date instanceof Date ? row.due_date.toISOString() : row.due_date).slice(0, 10) : null;
  return { id: row.id, eventId: row.event_id, title: row.title, description: row.description || "", status: row.status, priority: row.priority, owner: row.owner, assigneeId: row.assignee_id, dueDate };
}

export function memberRow(row) {
  return { id: row.id, eventId: row.event_id, personId: row.person_id || row.id, accountId: row.account_id, name: row.name, email: row.email || "", projectRole: row.project_role, accessRole: row.access_role };
}

export function costRow(row) {
  return { id: row.id, eventId: row.event_id, title: row.title, category: row.category, amount: Number(row.amount), note: row.note || "", taskId: row.task_id };
}

export function commentRow(row) {
  return { id: row.id, eventId: row.event_id, taskId: row.task_id, author: row.author, authorName: row.author, initials: row.initials, text: row.text, type: row.type || "comment", toEmail: row.to_email, subject: row.subject, createdAt: row.created_at };
}

export function personRow(row) {
  return { id: row.id, accountId: row.account_id, name: row.name, email: row.email, projectRole: row.project_role, accessRole: row.access_role };
}

export function teamRow(row) {
  const memberIds = Array.isArray(row.member_ids) ? row.member_ids : (typeof row.member_ids === "string" ? JSON.parse(row.member_ids) : []);
  return { id: row.id, name: row.name, memberIds, createdBy: row.created_by };
}
