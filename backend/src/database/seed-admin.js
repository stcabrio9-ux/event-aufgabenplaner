import "dotenv/config";
import { pool, query } from "./pool.js";
import { validateDatabaseUrl } from "../config.js";
import { config } from "../config.js";
import { hashPassword } from "../services/auth.js";

async function seedAdmin() {
  validateDatabaseUrl();
  if (!config.adminEmail || !config.adminPassword) {
    throw new Error("ADMIN_EMAIL und ADMIN_PASSWORD müssen gesetzt sein.");
  }
  const passwordHash = await hashPassword(config.adminPassword);
  await query(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, lower($2), $3, 'Administrator')
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'Administrator'
  `, [config.adminName, config.adminEmail, passwordHash]);
  console.log(`Administrator account prepared for ${config.adminEmail}.`);
}

seedAdmin().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
