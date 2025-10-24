import { useMemo } from "react";
import { useAppSelector } from "@/redux/store/store";
import { selectUser } from "@/redux/authSlice";
import {
  hasFeatureAccess,
  checkStudentLimit,
  checkClassLimit,
  getEffectiveTier,
  TIER_FEATURES,
  type SubscriptionTier,
} from "@/lib/tierConstants";

/**
 * Hook to check if the current user has access to a specific feature
 * @param featureName - The name of the feature to check
 * @returns boolean - true if user has access, false otherwise
 */
export function useFeatureAccess(featureName: string): boolean {
  const user = useAppSelector(selectUser);
  
  const hasAccess = useMemo(() => {
    if (!user) return false;
    
    const effectiveTier = getEffectiveTier(
      user.subscriptionTier || "FREE",
      user.subscriptionStatus || "ACTIVE",
      user.trialEndsAt,
      user.subscriptionExpiresAt
    );
    
    return hasFeatureAccess(effectiveTier, featureName);
  }, [user, featureName]);
  
  return hasAccess;
}

/**
 * Hook to get student limit information for the current user
 * @param currentStudentCount - The current number of students in the class
 * @returns Object with withinLimit, limit, remaining, and exceeded properties
 */
export function useStudentLimit(currentStudentCount: number = 0) {
  const user = useAppSelector(selectUser);
  
  return useMemo(() => {
    if (!user) {
      return {
        withinLimit: false,
        limit: 0,
        remaining: 0,
        exceeded: true,
      };
    }
    
    const effectiveTier = getEffectiveTier(
      user.subscriptionTier || "FREE",
      user.subscriptionStatus || "ACTIVE",
      user.trialEndsAt,
      user.subscriptionExpiresAt
    );
    
    const result = checkStudentLimit(effectiveTier, currentStudentCount);
    
    return {
      ...result,
      exceeded: !result.withinLimit,
    };
  }, [user, currentStudentCount]);
}

/**
 * Hook to get class limit information for the current user
 * @param currentClassCount - The current number of classes the user has
 * @returns Object with withinLimit, limit, remaining, and exceeded properties
 */
export function useClassLimit(currentClassCount: number = 0) {
  const user = useAppSelector(selectUser);
  
  return useMemo(() => {
    if (!user) {
      return {
        withinLimit: false,
        limit: 0,
        remaining: 0,
        exceeded: true,
      };
    }
    
    const effectiveTier = getEffectiveTier(
      user.subscriptionTier || "FREE",
      user.subscriptionStatus || "ACTIVE",
      user.trialEndsAt,
      user.subscriptionExpiresAt
    );
    
    const result = checkClassLimit(effectiveTier, currentClassCount);
    
    return {
      ...result,
      exceeded: !result.withinLimit,
    };
  }, [user, currentClassCount]);
}

/**
 * Hook to get the user's subscription tier information
 * @returns Object with tier info, features, and limits
 */
export function useSubscriptionTier() {
  const user = useAppSelector(selectUser);
  
  return useMemo(() => {
    if (!user) {
      return {
        tier: "FREE" as SubscriptionTier,
        status: "ACTIVE",
        displayName: "Free",
        features: TIER_FEATURES.FREE,
        isTrialActive: false,
        isTrialExpired: false,
        isSubscriptionExpired: false,
        daysRemainingInTrial: null,
      };
    }
    
    const effectiveTier = getEffectiveTier(
      user.subscriptionTier || "FREE",
      user.subscriptionStatus || "ACTIVE",
      user.trialEndsAt,
      user.subscriptionExpiresAt
    );
    
    const tierFeatures = TIER_FEATURES[effectiveTier];
    
    // Calculate trial info
    const isTrialActive = 
      user.subscriptionTier === "TRIAL" && 
      user.subscriptionStatus === "TRIAL" &&
      user.trialEndsAt &&
      new Date(user.trialEndsAt) > new Date();
    
    const isTrialExpired = 
      user.subscriptionTier === "TRIAL" &&
      user.trialEndsAt &&
      new Date(user.trialEndsAt) <= new Date();
    
    const isSubscriptionExpired = 
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) <= new Date();
    
    let daysRemainingInTrial: number | null = null;
    if (isTrialActive && user.trialEndsAt) {
      const now = new Date();
      const trialEnd = new Date(user.trialEndsAt);
      const diffTime = trialEnd.getTime() - now.getTime();
      daysRemainingInTrial = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return {
      tier: effectiveTier,
      status: user.subscriptionStatus || "ACTIVE",
      displayName: tierFeatures.displayName,
      features: tierFeatures,
      isTrialActive,
      isTrialExpired,
      isSubscriptionExpired,
      daysRemainingInTrial,
      isFoundingMember: user.isFoundingMember || false,
    };
  }, [user]);
}

/**
 * Hook to check multiple features at once
 * @param featureNames - Array of feature names to check
 * @returns Object with feature names as keys and boolean access as values
 */
export function useMultipleFeatureAccess(featureNames: string[]) {
  const user = useAppSelector(selectUser);
  
  return useMemo(() => {
    if (!user) {
      return Object.fromEntries(featureNames.map((name) => [name, false]));
    }
    
    const effectiveTier = getEffectiveTier(
      user.subscriptionTier || "FREE",
      user.subscriptionStatus || "ACTIVE",
      user.trialEndsAt,
      user.subscriptionExpiresAt
    );
    
    return Object.fromEntries(
      featureNames.map((name) => [name, hasFeatureAccess(effectiveTier, name)])
    );
  }, [user, featureNames]);
}
