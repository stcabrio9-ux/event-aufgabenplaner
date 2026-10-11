import * as service from "../services/events.js";

export const list = async (_req, res) => res.json(await service.listEvents());
export const get = async (req, res) => res.json(await service.getEvent(req.params.id));
export const create = async (req, res) => res.status(201).json(await service.createEvent(req.body));
export const update = async (req, res) => res.json(await service.updateEvent(req.params.id, req.body));
export const remove = async (req, res) => { await service.deleteEvent(req.params.id); res.status(204).send(); };
