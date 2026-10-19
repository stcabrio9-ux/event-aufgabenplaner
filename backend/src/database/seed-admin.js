import "dotenv/config";
import { pool, query } from "./pool.js";
import { validateDatabaseUrl, config } from "../config.js";
import { hashPassword } from "../services/auth.js";

async function seedAccounts() {
  validateDatabaseUrl();
  if (!config.adminEmail || !config.adminPassword || !config.userEmail || !config.userPassword) {
    throw new Error("ADMIN_EMAIL, ADMIN_PASSWORD, USER_EMAIL und USER_PASSWORD müssen gesetzt sein.");
  }

  const accounts = [
    { name: config.adminName, email: config.adminEmail, password: config.adminPassword, role: "admin" },
    { name: config.userName, email: config.userEmail, password: config.userPassword, role: "user" }
  ];

  for (const account of accounts) {
    const passwordHash = await hashPassword(account.password);
    await query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, lower($2), $3, $4)
      ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
    `, [account.name, account.email, passwordHash, account.role]);
  }

  console.log("Administrator and user accounts prepared.");
}

seedAccounts()
  .catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => pool.end());
