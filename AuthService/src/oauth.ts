// src/oauth.ts
import axios from "axios";
import { env } from "./config";

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "google" | "microsoft";
}

export class OAuthService {
  /**
   * Exchange Google OAuth code for access token and fetch user info
   */
  async handleGoogleCallback(code: string): Promise<OAuthUserInfo> {
    try {
      // Exchange code for tokens
      const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      });

      const { access_token } = tokenResponse.data;

      // Fetch user info
      const userResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const user = userResponse.data;
      return {
        id: `google_${user.id}`,
        email: user.email,
        name: user.name,
        picture: user.picture,
        provider: "google",
      };
    } catch (error: any) {
      console.error("Google OAuth error:", error.response?.data || error.message);
      throw new Error("Failed to authenticate with Google");
    }
  }

  /**
   * Exchange Microsoft OAuth code for access token and fetch user info
   */
  async handleMicrosoftCallback(code: string): Promise<OAuthUserInfo> {
    try {
      // Exchange code for tokens
      const tokenResponse = await axios.post(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        new URLSearchParams({
          code,
          client_id: env.MICROSOFT_CLIENT_ID,
          client_secret: env.MICROSOFT_CLIENT_SECRET,
          redirect_uri: env.MICROSOFT_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const { access_token } = tokenResponse.data;

      // Fetch user info
      const userResponse = await axios.get("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const user = userResponse.data;
      return {
        id: `microsoft_${user.id}`,
        email: user.userPrincipalName || user.mail,
        name: user.displayName,
        provider: "microsoft",
      };
    } catch (error: any) {
      console.error("Microsoft OAuth error:", error.response?.data || error.message);
      throw new Error("Failed to authenticate with Microsoft");
    }
  }
}

export const oauthService = new OAuthService();
