import { z } from "zod";

const uuid = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ungültiges Datum.");
const idParams = z.object({ id: uuid });
const eventIdParams = z.object({ eventId: uuid });

export const schemas = {
  authLogin: z.object({ email: z.string().trim().email(), password: z.string().min(1) }),
  idParams,
  eventIdParams,
  eventCreate: z.object({ id: uuid.optional(), name: z.string().trim().min(1).max(160), date: date.optional(), startDate: date.optional(), endDate: date.optional(), startTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(), endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(), description: z.string().max(10000).default(""), location: z.string().max(240).default(""), image: z.string().max(2000000).nullable().optional(), participants: z.coerce.number().int().min(0).default(0), teamIds: z.array(uuid).default([]), individualIds: z.array(uuid).default([]) }).refine((value) => value.startDate || value.date, { message: "Startdatum ist erforderlich.", path: ["startDate"] }),
  eventUpdate: z.object({ name: z.string().trim().min(1).max(160).optional(), date: date.optional(), startDate: date.optional(), endDate: date.optional(), startTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(), endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(), description: z.string().max(10000).optional(), location: z.string().max(240).optional(), image: z.string().max(2000000).nullable().optional(), participants: z.coerce.number().int().min(0).optional(), teamIds: z.array(uuid).optional(), individualIds: z.array(uuid).optional() }).strict().refine((value) => Object.keys(value).length > 0),
  taskCreate: z.object({ title: z.string().trim().min(1).max(240), description: z.string().max(10000).default(""), status: z.enum(["Offen", "In Bearbeitung", "Erledigt"]).default("Offen"), priority: z.enum(["Niedrig", "Mittel", "Hoch"]).default("Mittel"), owner: z.string().trim().max(160).nullable().optional(), assigneeId: uuid.nullable().optional(), dueDate: date.nullable().optional() }),
  taskUpdate: z.object({ title: z.string().trim().min(1).max(240).optional(), description: z.string().max(10000).optional(), status: z.enum(["Offen", "In Bearbeitung", "Erledigt"]).optional(), priority: z.enum(["Niedrig", "Mittel", "Hoch"]).optional(), owner: z.string().trim().max(160).nullable().optional(), assigneeId: uuid.nullable().optional(), dueDate: date.nullable().optional() }).strict().refine((value) => Object.keys(value).length > 0),
  memberCreate: z.object({ name: z.string().trim().min(1).max(160), email: z.string().trim().email().optional(), projectRole: z.string().trim().max(160).nullable().optional(), accessRole: z.enum(["Betrachter", "Bearbeiter", "Administrator"]).default("Betrachter") }),
  personCreate: z.object({ name: z.string().trim().min(1).max(160), email: z.string().trim().email(), projectRole: z.string().trim().max(160).nullable().optional(), accessRole: z.enum(["Betrachter", "Bearbeiter", "Administrator"]).default("Bearbeiter") }),
  personUpdate: z.object({ name: z.string().trim().min(1).max(160).optional(), email: z.string().trim().email().optional(), projectRole: z.string().trim().max(160).nullable().optional(), accessRole: z.enum(["Betrachter", "Bearbeiter", "Administrator"]).optional() }).strict().refine((value) => Object.keys(value).length > 0),
  teamCreate: z.object({ name: z.string().trim().min(1).max(160), memberIds: z.array(uuid).default([]) }),
  teamUpdate: z.object({ name: z.string().trim().min(1).max(160).optional(), memberIds: z.array(uuid).optional() }).strict().refine((value) => Object.keys(value).length > 0),
  costCreate: z.object({ title: z.string().trim().min(1).max(240), category: z.string().trim().min(1).max(120).default("Sonstiges"), amount: z.coerce.number().finite().min(0), note: z.string().max(5000).default(""), taskId: uuid.nullable().optional() }),
  costUpdate: z.object({ title: z.string().trim().min(1).max(240).optional(), category: z.string().trim().min(1).max(120).optional(), amount: z.coerce.number().finite().min(0).optional(), note: z.string().max(5000).optional(), taskId: uuid.nullable().optional() }).strict().refine((value) => Object.keys(value).length > 0),
  commentCreate: z.object({ text: z.string().trim().min(1).max(5000), taskId: uuid.nullable().optional(), type: z.enum(["comment", "email_out", "email_in"]).default("comment"), toEmail: z.string().trim().email().optional(), subject: z.string().max(500).optional() })
};
