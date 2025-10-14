// src/config.ts
import "dotenv/config";

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  PORT: Number(process.env.PORT || 4000),
  ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  // Legacy JWT config (can be removed after migration)
  JWT_SECRET: process.env.JWT_SECRET || "legacy-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",

  REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || "legacy-refresh-secret",
  REFRESH_JWT_EXPIRES_IN: process.env.REFRESH_JWT_EXPIRES_IN || "7d",

  DATABASE_URL: req("DATABASE_URL"),
};
