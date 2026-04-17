// src/services/backend.ts
import axios from "axios";
import { env } from "../config.js";
import type { SubscriptionTier, SubscriptionStatus } from "../models/index.js";

/**
 * Service to communicate with the Backend service
 * Sends subscription updates to keep user data in sync
 */
export class BackendService {
  private static client = axios.create({
    baseURL: env.BACKEND_URL,
    headers: {
      "Content-Type": "application/json",
      ...(env.BACKEND_API_KEY && { "X-API-Key": env.BACKEND_API_KEY }),
    },
    timeout: 10000,
  });

  /**
   * Update user subscription status in backend
   */
  static async updateUserSubscription(params: {
    userId: string;
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
    trialEnd?: Date;
    isFoundingMember?: boolean;
    cancelAtPeriodEnd?: boolean;
  }): Promise<void> {
    try {
      const response = await this.client.post("/api/internal/subscription-update", {
        userId: params.userId,
        subscriptionTier: params.tier,
        subscriptionStatus: params.status,
        stripeCustomerId: params.stripeCustomerId,
        stripeSubscriptionId: params.stripeSubscriptionId,
        subscriptionExpiresAt: params.currentPeriodEnd?.toISOString(),
        trialEndsAt: params.trialEnd?.toISOString(),
        isFoundingMember: params.isFoundingMember,
        cancelAtPeriodEnd: params.cancelAtPeriodEnd,
      });

      console.log(
        `[Backend] Updated subscription for user ${params.userId}: ${params.tier} ${params.status}`
      );
      return response.data;
    } catch (error) {
      console.error(`[Backend] Failed to update subscription for user ${params.userId}:`, error);
      // Don't throw - we don't want webhook processing to fail
    }
  }

  /**
   * Get user info from backend
   */
  static async getUser(userId: string): Promise<{
    id: string;
    email?: string;
    name?: string;
    subscriptionTier: SubscriptionTier;
    subscriptionStatus: SubscriptionStatus;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  } | null> {
    try {
      const response = await this.client.get(`/api/internal/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`[Backend] Failed to get user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Create audit log entry for admin actions
   */
  static async createAuditLog(params: {
    adminUserId: string;
    action: string;
    targetType: string;
    targetId: string;
    details?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.client.post("/api/internal/audit-log", params);
    } catch (error) {
      console.error(`[Backend] Failed to create audit log:`, error);
    }
  }

  /**
   * Send notification to user
   */
  static async sendNotification(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.client.post("/api/internal/notification", params);
    } catch (error) {
      console.error(`[Backend] Failed to send notification:`, error);
    }
  }
}
