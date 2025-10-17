// Backend/src/services/auth-client.ts
import type { Response } from "express";

// Lazy getters to ensure env vars are loaded after dotenv initialization
const getAuthServiceUrl = () => process.env.AUTH_SERVICE_URL || "http://localhost:4001";
const getServiceApiKey = () => process.env.SERVICE_API_KEY || "";

export type JWTPayload = { sub: string; role: "TEACHER" | "STUDENT" | "PARENT" };

export class AuthServiceClient {
  async request<T>(
    endpoint: string,
    method: "POST" | "GET" = "POST",
    body?: any,
    options: { useApiKey?: boolean } = {}
  ): Promise<T> {
    const authServiceUrl = getAuthServiceUrl();
    
    // Check if auth service URL is configured
    if (!authServiceUrl || authServiceUrl.includes('localhost')) {
      console.warn(`[Auth Service] WARNING: AUTH_SERVICE_URL not properly configured (${authServiceUrl}). Skipping auth service call.`);
      throw new Error('Auth service not available');
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (options.useApiKey !== false) {
      headers["x-service-api-key"] = getServiceApiKey();
    }

    try {
      const response = await fetch(`${authServiceUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || `Auth service error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[Auth Service] Request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const result = await this.request<{ hash: string }>("/hash-password", "POST", { password });
    return result.hash;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const result = await this.request<{ isValid: boolean }>("/verify-password", "POST", {
      password,
      hash,
    });
    return result.isValid;
  }

  async signTokens(
    userId: string,
    role: JWTPayload["role"],
    res?: Response
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const result = await this.request<{ accessToken: string; refreshToken: string }>(
      "/sign-tokens",
      "POST",
      { userId, role }
    );

    // If Express response is provided, set the cookie from auth service
    if (res) {
      // The auth service sets the cookie, but we need to proxy it
      // In production, consider using a shared cookie domain
      this.setRefreshCookie(res, result.refreshToken);
    }

    return result;
  }

  async verifyAccessToken(token: string): Promise<JWTPayload> {
    const result = await this.request<{ payload: JWTPayload }>(
      "/verify-access-token",
      "POST",
      { token }
    );
    return result.payload;
  }

  async verifyRefreshToken(token: string): Promise<JWTPayload> {
    const result = await this.request<{ payload: JWTPayload }>(
      "/verify-refresh-token",
      "POST",
      { token }
    );
    return result.payload;
  }

  // Helper to set refresh cookie (mirroring auth service behavior)
  setRefreshCookie(res: Response, token: string): void {
    res.cookie("refresh_token", token, {
      httpOnly: true,
      secure: false, // true in prod with HTTPS
      sameSite: "lax",
      path: "/graphql",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  clearRefreshCookie(res: Response): void {
    res.clearCookie("refresh_token", { path: "/graphql" });
  }
}

// Export singleton instance
export const authClient = new AuthServiceClient();
