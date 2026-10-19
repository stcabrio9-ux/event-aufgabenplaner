import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  authSecret: process.env.AUTH_SECRET,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminName: process.env.ADMIN_NAME || "Administrator",
  userEmail: process.env.USER_EMAIL,
  userPassword: process.env.USER_PASSWORD,
  userName: process.env.USER_NAME || "Benutzer"
};

export function validateDatabaseUrl() {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL ist nicht gesetzt.");
  }

  let url;
  try {
    url = new URL(config.databaseUrl);
  } catch {
    throw new Error("DATABASE_URL ist keine gültige URL.");
  }

  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("DATABASE_URL muss eine PostgreSQL-URL sein.");
  }
}
