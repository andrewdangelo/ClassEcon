// src/middleware.ts
import { Request, Response, NextFunction } from "express";
import { env } from "./config";

export function validateServiceApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-service-api-key"];
  
  if (apiKey !== env.SERVICE_API_KEY) {
    return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }
  
  next();
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Error:", err);
  
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }
  
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }
  
  res.status(500).json({ error: "Internal server error" });
}
