// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

/**
 * Middleware to verify JWT token
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      role: string;
    };

    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.userRole !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

/**
 * Optional auth - sets user info if token present but doesn't require it
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as {
        sub: string;
        role: string;
      };

      req.userId = payload.sub;
      req.userRole = payload.role;
    } catch {
      // Token invalid, continue without auth
    }
  }

  next();
}

/**
 * Service-to-service authentication middleware
 * Accepts x-api-key header for internal service calls
 * The userId should be passed via x-user-id header.
 */
export function requireServiceAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const apiKey = getHeaderValue(req.headers["x-api-key"]);
  
  // Check if service API key is provided and valid
  if (apiKey && apiKey === env.SERVICE_API_KEY) {
    // Service-to-service call - resolve identity from headers first, then fallback body.
    const userIdFromHeader = getHeaderValue(req.headers["x-user-id"]);
    const userRoleFromHeader = getHeaderValue(req.headers["x-user-role"]);
    const body = typeof req.body === "object" && req.body !== null ? req.body as Record<string, unknown> : {};
    const userIdFromBody = typeof body.userId === "string" ? body.userId : undefined;
    const userRoleFromBody = typeof body.userRole === "string" ? body.userRole : undefined;
    const userId = userIdFromHeader || userIdFromBody;
    const userRole = userRoleFromHeader || userRoleFromBody;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required for service-to-service calls",
        hint: "Provide x-user-id header (or userId in request body for backward compatibility).",
      });
    }

    req.userId = userId;
    req.userRole = userRole || "TEACHER";
    return next();
  }
  
  // Fallback to JWT auth
  return requireAuth(req, res, next);
}
