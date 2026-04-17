// src/db/connection.ts
import mongoose from "mongoose";
import { env } from "../config.js";

export async function connectDatabase(): Promise<void> {
  if (!env.DATABASE_URL) {
    console.log("[DB] No DATABASE_URL provided, skipping connection");
    return;
  }

  try {
    await mongoose.connect(env.DATABASE_URL);
    console.log("[DB] Connected to MongoDB");
  } catch (error) {
    console.error("[DB] Failed to connect to MongoDB:", error);
    throw error;
  }
}

export { mongoose };
