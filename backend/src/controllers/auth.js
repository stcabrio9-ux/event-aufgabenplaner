import * as auth from "../services/auth.js";

export const login = async (req, res) => res.json(await auth.login(req.body.email, req.body.password));
export const me = async (req, res) => res.json({ user: req.user });
export const logout = async (req, res) => { auth.revokeToken(req.authToken); res.status(204).send(); };
