import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, TrendingUp, Crown } from "lucide-react";
import { useSubscriptionTier } from "@/hooks/useSubscriptionTier";
import { TIER_FEATURES } from "@/lib/tierConstants";
import { cn } from "@/lib/utils";

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Component that gates content behind a feature flag
 * Shows upgrade prompt if user doesn't have access
 */
export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showUpgradePrompt = true 
}: FeatureGateProps) {
  const { tier, features, displayName } = useSubscriptionTier();
  const hasAccess = 
    features.features.includes("*") || 
    features.features.includes(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    // Find which tier has this feature
    const tierWithFeature = Object.entries(TIER_FEATURES).find(([_, tierFeatures]) =>
      tierFeatures.features.includes("*") || tierFeatures.features.includes(feature)
    );

    return (
      <Alert className="border-orange-200 bg-orange-50">
        <Lock className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900">Premium Feature</AlertTitle>
        <AlertDescription className="text-orange-800">
          This feature requires a {tierWithFeature?.[1].displayName || "higher"} plan.
          {tier === "FREE" && (
            <span className="block mt-2">
              Start your free trial to unlock all features!
            </span>
          )}
          <Button size="sm" className="mt-3" variant="default">
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

interface TierBadgeProps {
  className?: string;
}

/**
 * Badge showing the user's current subscription tier
 */
export function TierBadge({ className }: TierBadgeProps) {
  const { displayName, tier, isTrialActive, daysRemainingInTrial } = useSubscriptionTier();

  const tierColors = {
    FREE: "bg-gray-100 text-gray-800 border-gray-300",
    TRIAL: "bg-purple-100 text-purple-800 border-purple-300",
    STARTER: "bg-blue-100 text-blue-800 border-blue-300",
    PROFESSIONAL: "bg-green-100 text-green-800 border-green-300",
    SCHOOL: "bg-amber-100 text-amber-800 border-amber-300",
  };

  const tierIcons = {
    FREE: null,
    TRIAL: Sparkles,
    STARTER: TrendingUp,
    PROFESSIONAL: Crown,
    SCHOOL: Crown,
  };

  const Icon = tierIcons[tier];

  return (
    <Badge 
      variant="outline" 
      className={cn(tierColors[tier], "font-medium", className)}
    >
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {displayName}
      {isTrialActive && daysRemainingInTrial !== null && (
        <span className="ml-1 text-xs">({daysRemainingInTrial}d left)</span>
      )}
    </Badge>
  );
}

interface LimitWarningProps {
  current: number;
  limit: number | null;
  itemName: string;
  className?: string;
}

/**
 * Warning component showing when approaching or at a tier limit
 */
export function LimitWarning({ current, limit, itemName, className }: LimitWarningProps) {
  if (limit === null) return null;

  const remaining = limit - current;
  const percentage = (current / limit) * 100;
  
  // Only show warning at 80% capacity
  if (percentage < 80) return null;

  const isAtLimit = current >= limit;
  const isNearLimit = percentage >= 80 && !isAtLimit;

  return (
    <Alert 
      className={cn(
        isAtLimit ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50",
        className
      )}
    >
      <AlertDescription className={isAtLimit ? "text-red-800" : "text-orange-800"}>
        {isAtLimit ? (
          <>
            <strong>Limit Reached:</strong> You've reached your limit of {limit} {itemName}.
            Upgrade your plan to add more.
          </>
        ) : (
          <>
            <strong>Approaching Limit:</strong> You're using {current} of {limit} {itemName}.
            Only {remaining} remaining.
          </>
        )}
        {isAtLimit && (
          <Button size="sm" className="mt-2" variant="default">
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface TrialBannerProps {
  className?: string;
}

/**
 * Banner showing trial status and days remaining
 */
export function TrialBanner({ className }: TrialBannerProps) {
  const { isTrialActive, daysRemainingInTrial, isTrialExpired } = useSubscriptionTier();

  if (!isTrialActive && !isTrialExpired) return null;

  if (isTrialExpired) {
    return (
      <Alert className={cn("border-red-200 bg-red-50", className)}>
        <AlertTitle className="text-red-900">Trial Expired</AlertTitle>
        <AlertDescription className="text-red-800">
          Your trial has ended. Upgrade to continue using all features.
          <Button size="sm" className="mt-2 ml-2" variant="default">
            <Sparkles className="h-4 w-4 mr-2" />
            Choose a Plan
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={cn("border-purple-200 bg-purple-50", className)}>
      <Sparkles className="h-4 w-4 text-purple-600" />
      <AlertTitle className="text-purple-900">Free Trial Active</AlertTitle>
      <AlertDescription className="text-purple-800">
        You have {daysRemainingInTrial} {daysRemainingInTrial === 1 ? "day" : "days"} left in your trial.
        Enjoying ClassEcon? Subscribe to keep all features!
        <Button size="sm" className="mt-2 ml-2" variant="default">
          Subscribe Now
        </Button>
      </AlertDescription>
    </Alert>
  );
}
