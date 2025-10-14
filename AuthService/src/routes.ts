// src/routes.ts
import { Router, Request, Response } from "express";
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from "./auth";
import { validateServiceApiKey } from "./middleware";

const router = Router();

// Health check endpoint (public)
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "auth-service" });
});

// Hash password (protected - for backend service)
router.post("/hash-password", validateServiceApiKey, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    
    const hash = await hashPassword(password);
    res.json({ hash });
  } catch (error) {
    res.status(500).json({ error: "Failed to hash password" });
  }
});

// Verify password (protected - for backend service)
router.post("/verify-password", validateServiceApiKey, async (req: Request, res: Response) => {
  try {
    const { password, hash } = req.body;
    if (!password || !hash) {
      return res.status(400).json({ error: "Password and hash are required" });
    }
    
    const isValid = await verifyPassword(password, hash);
    res.json({ isValid });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify password" });
  }
});

// Sign tokens (protected - for backend service)
router.post("/sign-tokens", validateServiceApiKey, (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ error: "userId and role are required" });
    }
    
    if (!["TEACHER", "STUDENT", "PARENT"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    
    const accessToken = signAccessToken(userId, role);
    const refreshToken = signRefreshToken(userId, role);
    
    // Set refresh token as cookie
    setRefreshCookie(res, refreshToken);
    
    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: "Failed to sign tokens" });
  }
});

// Verify access token (protected - for backend service)
router.post("/verify-access-token", validateServiceApiKey, (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    
    const payload = verifyAccessToken(token);
    res.json({ payload });
  } catch (error: any) {
    res.status(401).json({ error: error.message || "Invalid token" });
  }
});

// Verify refresh token (protected - for backend service)
router.post("/verify-refresh-token", validateServiceApiKey, (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    
    const payload = verifyRefreshToken(token);
    res.json({ payload });
  } catch (error: any) {
    res.status(401).json({ error: error.message || "Invalid token" });
  }
});

// Refresh access token (can be called directly from frontend or backend)
router.post("/refresh", (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" });
    }
    
    const payload = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken(payload.sub, payload.role);
    
    res.json({ accessToken: newAccessToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message || "Invalid refresh token" });
  }
});

// Logout (clear refresh cookie)
router.post("/logout", (req: Request, res: Response) => {
  clearRefreshCookie(res);
  res.json({ success: true });
});

// OAuth endpoints (for handling callbacks from providers)
router.post("/oauth/google", validateServiceApiKey, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const { oauthService } = await import("./oauth");
    const userInfo = await oauthService.handleGoogleCallback(code);
    
    res.json({ userInfo });
  } catch (error: any) {
    console.error("Google OAuth error:", error);
    res.status(500).json({ error: error.message || "Google OAuth failed" });
  }
});

router.post("/oauth/microsoft", validateServiceApiKey, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const { oauthService } = await import("./oauth");
    const userInfo = await oauthService.handleMicrosoftCallback(code);
    
    res.json({ userInfo });
  } catch (error: any) {
    console.error("Microsoft OAuth error:", error);
    res.status(500).json({ error: error.message || "Microsoft OAuth failed" });
  }
});

export default router;
