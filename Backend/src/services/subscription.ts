import {
  Subscription,
  ISubscription,
  PlanTier,
  PlanStatus,
} from "../models/Subscription";
import { PLAN_CONFIGS } from "../config/plans";
import { Types } from "mongoose";
import { ClassModel } from "../models";

export class SubscriptionService {
  // Get or create subscription for user (backward compatible)
  static async getOrCreateSubscription(
    userId: string | Types.ObjectId
  ): Promise<ISubscription> {
    const userObjectId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    let subscription = await Subscription.findOne({ userId: userObjectId });

    if (!subscription) {
      // Create free trial subscription for existing users
      subscription = await Subscription.create({
        userId: userObjectId,
        planTier: PlanTier.FREE_TRIAL,
        status: PlanStatus.TRIAL,
        limits: PLAN_CONFIGS[PlanTier.FREE_TRIAL].limits,
        features: PLAN_CONFIGS[PlanTier.FREE_TRIAL].features,
      });
      console.log(`Created subscription for existing user: ${userId}`);
    }

    return subscription;
  }

  // Check if subscription is active
  static async isActive(userId: string | Types.ObjectId): Promise<boolean> {
    try {
      const subscription = await this.getOrCreateSubscription(userId);

      // Check if trial is still valid
      if (subscription.status === PlanStatus.TRIAL) {
        if (subscription.trialEndsAt && new Date() > subscription.trialEndsAt) {
          // Trial expired, downgrade to expired
          subscription.status = PlanStatus.EXPIRED;
          await subscription.save();
          return false;
        }
        return true;
      }

      // Check if paid subscription is active
      if (subscription.status === PlanStatus.ACTIVE) {
        if (subscription.endDate && new Date() > subscription.endDate) {
          subscription.status = PlanStatus.EXPIRED;
          await subscription.save();
          return false;
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      // Fail open for backward compatibility
      return true;
    }
  }

  // Check if user can perform action based on limits
  static async checkLimit(
    userId: string | Types.ObjectId,
    limitType: keyof (typeof PLAN_CONFIGS)[PlanTier]["limits"],
    currentCount: number
  ): Promise<{
    allowed: boolean;
    reason?: string;
    currentLimit?: number;
    recommendedPlan?: PlanTier;
  }> {
    try {
      const subscription = await this.getOrCreateSubscription(userId);
      const isActive = await this.isActive(userId);

      if (!isActive) {
        return {
          allowed: false,
          reason: "Your subscription has expired. Please upgrade to continue.",
          recommendedPlan: PlanTier.BASIC,
        };
      }

      const limit = subscription.limits[limitType];

      // Boolean limits
      if (typeof limit === "boolean") {
        if (!limit) {
          return {
            allowed: false,
            reason: `This feature is not available in your ${
              PLAN_CONFIGS[subscription.planTier].name
            } plan.`,
            recommendedPlan: PlanTier.PREMIUM,
          };
        }
        return { allowed: true };
      }

      // Number limits (-1 means unlimited)
      if (typeof limit === "number") {
        if (limit === -1) {
          return { allowed: true };
        }

        if (currentCount >= limit) {
          return {
            allowed: false,
            reason: `You've reached your limit of ${limit} ${limitType}. Upgrade to increase this limit.`,
            currentLimit: limit,
            recommendedPlan: this.getRecommendedUpgrade(subscription.planTier),
          };
        }

        return { allowed: true, currentLimit: limit };
      }

      return { allowed: false, reason: "Invalid limit type" };
    } catch (error) {
      console.error("Error checking limit:", error);
      // Fail open for backward compatibility
      return { allowed: true };
    }
  }

  // Get recommended upgrade plan
  static getRecommendedUpgrade(currentTier: PlanTier): PlanTier {
    const tierOrder = [
      PlanTier.FREE_TRIAL,
      PlanTier.BASIC,
      PlanTier.PREMIUM,
      PlanTier.ENTERPRISE,
    ];
    const currentIndex = tierOrder.indexOf(currentTier);
    return tierOrder[Math.min(currentIndex + 1, tierOrder.length - 1)];
  }

  // Check if user can create a new class
  static async canCreateClass(
    userId: string | Types.ObjectId
  ): Promise<ReturnType<typeof this.checkLimit>> {
    try {
      const userObjectId =
        typeof userId === "string" ? new Types.ObjectId(userId) : userId;

      const currentCount = await ClassModel.countDocuments({
        teacherIds: userObjectId,
        isArchived: { $ne: true },
      });

      return this.checkLimit(userId, "maxClasses", currentCount);
    } catch (error) {
      console.error("Error checking class creation:", error);
      // Fail open for backward compatibility
      return { allowed: true };
    }
  }

  // Check if user can add student to class
  static async canAddStudent(
    userId: string | Types.ObjectId,
    classId: string
  ): Promise<ReturnType<typeof this.checkLimit>> {
    try {
      const classroom = await ClassModel.findById(classId);
      if (!classroom) {
        return { allowed: false, reason: "Class not found" };
      }

      // Count students via Membership
      const { Membership } = await import("../models");
      const currentCount = await Membership.countDocuments({
        classIds: new Types.ObjectId(classId),
        role: "STUDENT",
      });

      return this.checkLimit(userId, "maxStudentsPerClass", currentCount);
    } catch (error) {
      console.error("Error checking student addition:", error);
      // Fail open for backward compatibility
      return { allowed: true };
    }
  }

  // Update subscription plan (after payment)
  static async upgradePlan(
    userId: string | Types.ObjectId,
    newTier: PlanTier,
    stripeSubscriptionId: string,
    stripeCustomerId: string
  ): Promise<ISubscription> {
    const subscription = await this.getOrCreateSubscription(userId);

    subscription.planTier = newTier;
    subscription.status = PlanStatus.ACTIVE;
    subscription.limits = PLAN_CONFIGS[newTier].limits;
    subscription.features = PLAN_CONFIGS[newTier].features;
    subscription.stripeSubscriptionId = stripeSubscriptionId;
    subscription.stripeCustomerId = stripeCustomerId;
    subscription.startDate = new Date();
    subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await subscription.save();
    return subscription;
  }

  // Cancel subscription
  static async cancelSubscription(
    userId: string | Types.ObjectId
  ): Promise<ISubscription> {
    const subscription = await this.getOrCreateSubscription(userId);
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();
    return subscription;
  }

  // Reactivate subscription
  static async reactivateSubscription(
    userId: string | Types.ObjectId
  ): Promise<ISubscription> {
    const subscription = await this.getOrCreateSubscription(userId);
    subscription.cancelAtPeriodEnd = false;
    if (subscription.status === PlanStatus.CANCELLED) {
      subscription.status = PlanStatus.ACTIVE;
    }
    await subscription.save();
    return subscription;
  }
}
