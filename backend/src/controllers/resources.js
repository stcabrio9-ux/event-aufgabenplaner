import * as tasks from "../services/tasks.js";
import * as members from "../services/members.js";
import * as costs from "../services/costs.js";
import * as comments from "../services/comments.js";

export const taskList = async (req, res) => res.json(await tasks.listTasks(req.params.eventId));
export const taskCreate = async (req, res) => res.status(201).json(await tasks.createTask(req.params.eventId, req.body));
export const taskUpdate = async (req, res) => res.json(await tasks.updateTask(req.params.id, req.body));
export const taskDelete = async (req, res) => { await tasks.deleteTask(req.params.id); res.status(204).send(); };
export const memberList = async (req, res) => res.json(await members.listMembers(req.params.eventId));
export const memberCreate = async (req, res) => res.status(201).json(await members.createMember(req.params.eventId, req.body));
export const memberDelete = async (req, res) => { await members.deleteMember(req.params.id); res.status(204).send(); };
export const costList = async (req, res) => res.json(await costs.listCosts(req.params.eventId));
export const costCreate = async (req, res) => res.status(201).json(await costs.createCost(req.params.eventId, req.body));
export const costUpdate = async (req, res) => res.json(await costs.updateCost(req.params.id, req.body));
export const costDelete = async (req, res) => { await costs.deleteCost(req.params.id); res.status(204).send(); };
export const commentList = async (req, res) => res.json(await comments.listComments(req.params.eventId));
export const commentCreate = async (req, res) => res.status(201).json(await comments.createComment(req.params.eventId, req.body));
