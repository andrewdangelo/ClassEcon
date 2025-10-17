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
  CORS_ORIGINS: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  LANDING_PAGE_URL: process.env.LANDING_PAGE_URL || "http://localhost:5174",

  // Legacy JWT config (can be removed after migration)
  JWT_SECRET: process.env.JWT_SECRET || "legacy-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",

  REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || "legacy-refresh-secret",
  REFRESH_JWT_EXPIRES_IN: process.env.REFRESH_JWT_EXPIRES_IN || "7d",

  DATABASE_URL: req("DATABASE_URL"),
  
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};
