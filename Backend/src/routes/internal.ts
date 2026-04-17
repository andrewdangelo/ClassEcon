// src/routes/internal.ts
/**
 * Internal API routes for service-to-service communication
 * These endpoints are called by the PaymentService to update user data
 */

import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { AuditLog } from "../models/AuditLog";
import { Notification } from "../models/Notification";
import { Types } from "mongoose";

const router = Router();

// API key validation middleware
const validateApiKey = (req: Request, res: Response, next: Function) => {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.INTERNAL_API_KEY;

  // If no key configured, allow in development
  if (!expectedKey && process.env.NODE_ENV !== "production") {
    return next();
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  next();
};

router.use(validateApiKey);

/**
 * Update user subscription status
 * Called by PaymentService after webhook processing
 */
router.post("/subscription-update", async (req: Request, res: Response) => {
  try {
    const {
      userId,
      subscriptionTier,
      subscriptionStatus,
      stripeCustomerId,
      stripeSubscriptionId,
      subscriptionExpiresAt,
      trialEndsAt,
      isFoundingMember,
      cancelAtPeriodEnd,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const updateData: any = {};

    if (subscriptionTier !== undefined) updateData.subscriptionTier = subscriptionTier;
    if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
    if (stripeCustomerId !== undefined) updateData.stripeCustomerId = stripeCustomerId;
    if (stripeSubscriptionId !== undefined) updateData.stripeSubscriptionId = stripeSubscriptionId;
    if (subscriptionExpiresAt !== undefined) {
      updateData.subscriptionExpiresAt = subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null;
    }
    if (trialEndsAt !== undefined) {
      updateData.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null;
    }
    if (isFoundingMember !== undefined) updateData.isFoundingMember = isFoundingMember;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`[Internal] Updated subscription for user ${userId}:`, updateData);

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error("[Internal] Subscription update error:", error);
    res.status(500).json({
      error: "Failed to update subscription",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get user info
 * Called by PaymentService to get user details
 */
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      isFoundingMember: user.isFoundingMember,
    });
  } catch (error) {
    console.error("[Internal] Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

/**
 * Create audit log entry
 * Called by PaymentService for admin actions
 */
router.post("/audit-log", async (req: Request, res: Response) => {
  try {
    const { adminUserId, action, targetType, targetId, details } = req.body;

    const auditLog = await AuditLog.create({
      adminUserId: new Types.ObjectId(adminUserId),
      action,
      targetType,
      targetId: new Types.ObjectId(targetId),
      details,
    });

    res.json({
      success: true,
      id: auditLog._id.toString(),
    });
  } catch (error) {
    console.error("[Internal] Audit log error:", error);
    res.status(500).json({ error: "Failed to create audit log" });
  }
});

/**
 * Send notification to user
 * Called by PaymentService for subscription notifications
 */
router.post("/notification", async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, metadata } = req.body;

    const notification = await Notification.create({
      userId: new Types.ObjectId(userId),
      type: type || "SYSTEM",
      title,
      message,
      metadata,
      isRead: false,
    });

    res.json({
      success: true,
      id: notification._id.toString(),
    });
  } catch (error) {
    console.error("[Internal] Notification error:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

export default router;
