// src/config.ts
import "dotenv/config";

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  PORT: Number(process.env.PORT || 4001),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  JWT_SECRET: req("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",

  REFRESH_JWT_SECRET: req("REFRESH_JWT_SECRET"),
  REFRESH_JWT_EXPIRES_IN: process.env.REFRESH_JWT_EXPIRES_IN || "7d",

  SERVICE_API_KEY: req("SERVICE_API_KEY"),

  // OAuth Google (optional)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "",

  // OAuth Microsoft (optional)
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID || "",
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET || "",
  MICROSOFT_REDIRECT_URI: process.env.MICROSOFT_REDIRECT_URI || "",
};
