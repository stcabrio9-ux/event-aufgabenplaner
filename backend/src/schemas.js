import { z } from "zod";

const uuid = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ungültiges Datum.");
const idParams = z.object({ id: uuid });
const eventIdParams = z.object({ eventId: uuid });

export const schemas = {
  authLogin: z.object({ email: z.string().trim().email(), password: z.string().min(1) }),
  idParams,
  eventIdParams,
  eventCreate: z.object({ id: uuid.optional(), name: z.string().trim().min(1).max(160), date, participants: z.coerce.number().int().min(0).default(0) }),
  eventUpdate: z.object({ name: z.string().trim().min(1).max(160).optional(), date: date.optional(), participants: z.coerce.number().int().min(0).optional() }).strict().refine((value) => Object.keys(value).length > 0),
  taskCreate: z.object({ title: z.string().trim().min(1).max(240), status: z.enum(["Offen", "In Bearbeitung", "Erledigt"]).default("Offen"), priority: z.enum(["Niedrig", "Mittel", "Hoch"]).default("Mittel"), owner: z.string().trim().max(160).nullable().optional(), dueDate: date.nullable().optional() }),
  taskUpdate: z.object({ title: z.string().trim().min(1).max(240).optional(), status: z.enum(["Offen", "In Bearbeitung", "Erledigt"]).optional(), priority: z.enum(["Niedrig", "Mittel", "Hoch"]).optional(), owner: z.string().trim().max(160).nullable().optional(), dueDate: date.nullable().optional() }).strict().refine((value) => Object.keys(value).length > 0),
  memberCreate: z.object({ name: z.string().trim().min(1).max(160), projectRole: z.string().trim().max(160).nullable().optional(), accessRole: z.enum(["Betrachter", "Bearbeiter", "Administrator"]).default("Betrachter") }),
  costCreate: z.object({ title: z.string().trim().min(1).max(240), category: z.string().trim().min(1).max(120).default("Sonstiges"), amount: z.coerce.number().finite().min(0) }),
  costUpdate: z.object({ title: z.string().trim().min(1).max(240).optional(), category: z.string().trim().min(1).max(120).optional(), amount: z.coerce.number().finite().min(0).optional() }).strict().refine((value) => Object.keys(value).length > 0),
  commentCreate: z.object({ author: z.string().trim().min(1).max(160).default("Unbekannt"), initials: z.string().trim().min(1).max(10).default("??"), text: z.string().trim().min(1).max(5000) })
};
