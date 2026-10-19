import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { query } from "../database/pool.js";
import { AppError } from "../errors.js";
import { config } from "../config.js";

const scrypt = promisify(scryptCallback);
const TOKEN_TTL_SECONDS = 60 * 60 * 24;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(derivedKey).toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [, salt, expectedHex] = String(storedHash).split("$");
  if (!salt || !expectedHex) return false;
  const actual = Buffer.from(await scrypt(password, salt, 64));
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value) {
  return createHmac("sha256", config.authSecret || "").update(value).digest("base64url");
}

export function createToken(user) {
  if (!config.authSecret) throw new AppError("AUTH_SECRET ist nicht konfiguriert.", 500, "AUTH_CONFIG_ERROR");
  const payload = encode({ sub: user.id, email: user.email, name: user.name, role: user.role, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS });
  return `${payload}.${sign(payload)}`;
}

export function readToken(token) {
  if (!token || !config.authSecret) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.exp > Math.floor(Date.now() / 1000) ? data : null;
  } catch {
    return null;
  }
}

export async function login(email, password) {
  const result = await query("SELECT id, name, email, password_hash, role FROM users WHERE lower(email) = lower($1)", [email]);
  const user = result.rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new AppError("E-Mail-Adresse oder Passwort ist falsch.", 401, "INVALID_CREDENTIALS");
  }
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: createToken(user) };
}

export function authUser(req, _res, next) {
  const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
  const user = readToken(token);
  if (!user) return next(new AppError("Anmeldung erforderlich.", 401, "UNAUTHORIZED"));
  req.user = user;
  return next();
}
