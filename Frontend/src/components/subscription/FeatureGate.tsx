import React from 'react';
import { useSubscription, SubscriptionLimits } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureGateProps {
  feature: keyof SubscriptionLimits;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Component that gates features based on subscription plan
 * Shows children if user has access, otherwise shows upgrade prompt or fallback
 */
export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true 
}: FeatureGateProps) {
  const { subscription, hasFeature, loading, isPremium } = useSubscription();

  if (loading) {
    return null;
  }

  const hasAccess = hasFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <Lock className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium text-amber-900">
            {isPremium ? 'Enterprise Feature' : 'Premium Feature'}
          </span>
          <p className="text-sm text-amber-700 mt-1">
            Upgrade your plan to unlock this feature
          </p>
        </div>
        <Link to="/settings/subscription">
          <Button variant="default" size="sm" className="ml-4">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}

interface FeatureLimitGateProps {
  feature: 'maxClasses' | 'maxStudentsPerClass' | 'maxStoreItems' | 'maxJobs';
  currentUsage: number;
  children: React.ReactNode;
  showWarning?: boolean;
  warningThreshold?: number;
}

/**
 * Component that gates features based on usage limits
 * Shows children if under limit, otherwise shows upgrade prompt
 */
export function FeatureLimitGate({ 
  feature, 
  currentUsage, 
  children,
  showWarning = true,
  warningThreshold = 0.8 // Show warning at 80% of limit
}: FeatureLimitGateProps) {
  const { subscription, getLimit, isPremium } = useSubscription();

  const limit = getLimit(feature) as number | null;
  
  // If no limit (null means unlimited), always show children
  if (limit === null) {
    return <>{children}</>;
  }

  const isAtLimit = currentUsage >= limit;
  const isNearLimit = currentUsage / limit >= warningThreshold;

  if (isAtLimit) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <span className="font-medium text-red-900">
              Limit Reached
            </span>
            <p className="text-sm text-red-700 mt-1">
              You've reached your limit of {limit} {feature.replace('max', '').toLowerCase()}.
              Upgrade to increase your limit.
            </p>
          </div>
          <Link to="/settings/subscription">
            <Button variant="destructive" size="sm" className="ml-4">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {showWarning && isNearLimit && (
        <Alert className="border-amber-200 bg-amber-50 mb-4">
          <AlertDescription>
            <span className="font-medium text-amber-900">
              Approaching Limit
            </span>
            <p className="text-sm text-amber-700 mt-1">
              You're using {currentUsage} of {limit} {feature.replace('max', '').toLowerCase()}.
              <Link to="/settings/subscription" className="underline ml-1">
                Upgrade your plan
              </Link> to increase your limit.
            </p>
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  );
}

/**
 * Simple badge to show premium/trial status
 */
export function PlanBadge() {
  const { subscription, isOnTrial, isPremium } = useSubscription();

  if (!subscription) return null;

  if (isOnTrial) {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
        <Crown className="mr-1 h-3 w-3" />
        Trial
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
        <Crown className="mr-1 h-3 w-3" />
        {subscription.planTier === 'ENTERPRISE' ? 'Enterprise' : 'Premium'}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
      {subscription.planTier === 'FREE_TRIAL' ? 'Free Trial' : 'Basic'}
    </div>
  );
}
