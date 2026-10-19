import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: config.nodeEnv === "production" ? { rejectUnauthorized: false } : false
});

export function query(text, values) {
  return pool.query(text, values);
}
