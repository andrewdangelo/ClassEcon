import type { SubscriptionTier } from "./enums";

export interface TierFeatures {
  maxStudents: number | null; // null = unlimited
  maxClasses: number | null; // null = unlimited
  features: string[];
  displayName: string;
  price: number; // in dollars per month
  foundingMemberPrice: number; // 50% off for founding members
  description: string;
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  FREE: {
    maxStudents: 10,
    maxClasses: 1,
    features: [
      "basicJobs",
      "basicStore",
      "studentDashboard",
      "basicTransactions",
    ],
    displayName: "Free",
    price: 0,
    foundingMemberPrice: 0,
    description: "Perfect for trying out ClassEcon with a small group",
  },
  TRIAL: {
    maxStudents: null, // unlimited during trial
    maxClasses: null, // unlimited during trial
    features: ["*"], // all features during trial
    displayName: "Trial",
    price: 0,
    foundingMemberPrice: 0,
    description: "14-day free trial with full access to all features",
  },
  STARTER: {
    maxStudents: 30,
    maxClasses: 1,
    features: [
      "basicJobs",
      "basicStore",
      "studentDashboard",
      "basicTransactions",
      "emailSupport",
      "payRequests",
      "fineSystem",
      "basicReports",
    ],
    displayName: "Starter",
    price: 9,
    foundingMemberPrice: 4.5,
    description: "Essential features for a single classroom",
  },
  PROFESSIONAL: {
    maxStudents: null, // unlimited
    maxClasses: 3,
    features: [
      "basicJobs",
      "basicStore",
      "studentDashboard",
      "basicTransactions",
      "emailSupport",
      "payRequests",
      "fineSystem",
      "basicReports",
      "analytics",
      "advancedReports",
      "customBranding",
      "prioritySupport",
      "goalTracking",
      "exportData",
      "balanceHistory",
      "activityTracking",
    ],
    displayName: "Professional",
    price: 19,
    foundingMemberPrice: 9.5,
    description: "Advanced features for dedicated educators",
  },
  SCHOOL: {
    maxStudents: null, // unlimited
    maxClasses: null, // unlimited
    features: ["*"], // all features
    displayName: "School",
    price: 0, // custom pricing
    foundingMemberPrice: 0,
    description: "Enterprise solution for schools and districts",
  },
};

export const TRIAL_DURATION_DAYS = 14;

// Helper function to check if a feature is available for a tier
export function hasFeatureAccess(
  tier: SubscriptionTier,
  featureName: string
): boolean {
  const tierFeatures = TIER_FEATURES[tier];
  if (!tierFeatures) return false;
  
  // Check if tier has all features (*)
  if (tierFeatures.features.includes("*")) return true;
  
  // Check if specific feature is included
  return tierFeatures.features.includes(featureName);
}

// Helper function to check student limit
export function checkStudentLimit(
  tier: SubscriptionTier,
  currentStudentCount: number
): { withinLimit: boolean; limit: number | null; remaining: number | null } {
  const tierFeatures = TIER_FEATURES[tier];
  const limit = tierFeatures?.maxStudents;
  
  if (limit === null) {
    return { withinLimit: true, limit: null, remaining: null };
  }
  
  return {
    withinLimit: currentStudentCount < limit,
    limit,
    remaining: Math.max(0, limit - currentStudentCount),
  };
}

// Helper function to check class limit
export function checkClassLimit(
  tier: SubscriptionTier,
  currentClassCount: number
): { withinLimit: boolean; limit: number | null; remaining: number | null } {
  const tierFeatures = TIER_FEATURES[tier];
  const limit = tierFeatures?.maxClasses;
  
  if (limit === null) {
    return { withinLimit: true, limit: null, remaining: null };
  }
  
  return {
    withinLimit: currentClassCount < limit,
    limit,
    remaining: Math.max(0, limit - currentClassCount),
  };
}

// Check if trial has expired
export function isTrialExpired(trialEndsAt: Date | null | undefined): boolean {
  if (!trialEndsAt) return false;
  return new Date() > new Date(trialEndsAt);
}

// Check if subscription has expired
export function isSubscriptionExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
}
