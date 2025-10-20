import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays } from 'date-fns';

/**
 * Banner that shows subscription status and prompts for action
 * Shows trial ending warning, expired trial, or cancelled subscription alerts
 */
export function SubscriptionBanner() {
  const { subscription, isOnTrial, isActive } = useSubscription();

  if (!subscription) return null;

  // Trial ending soon (less than 3 days left)
  if (isOnTrial && subscription.trialEndsAt) {
    const daysLeft = differenceInDays(new Date(subscription.trialEndsAt), new Date());
    
    if (daysLeft <= 3 && daysLeft >= 0) {
      return (
        <Alert className="border-amber-500 bg-amber-50 mb-4">
          <Clock className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-900 font-semibold">
            Trial Ending Soon
          </AlertTitle>
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <p>
                Your free trial ends in <span className="font-semibold">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>.
                Upgrade now to continue enjoying all premium features.
              </p>
              <Link to="/settings/subscription">
                <Button variant="default" size="sm" className="ml-4 shrink-0">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
  }

  // Trial expired
  if (subscription.status === 'EXPIRED' && subscription.trialEndsAt) {
    return (
      <Alert className="border-red-500 bg-red-50 mb-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-900 font-semibold">
          Trial Expired
        </AlertTitle>
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <p>
              Your free trial has expired. Upgrade to a paid plan to continue using ClassEcon.
            </p>
            <Link to="/settings/subscription">
              <Button variant="destructive" size="sm" className="ml-4 shrink-0">
                <Crown className="mr-2 h-4 w-4" />
                Choose Plan
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Subscription cancelled (but still active until end of period)
  if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
    const daysLeft = differenceInDays(new Date(subscription.currentPeriodEnd), new Date());
    
    return (
      <Alert className="border-orange-500 bg-orange-50 mb-4">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <AlertTitle className="text-orange-900 font-semibold">
          Subscription Cancelled
        </AlertTitle>
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <p>
              Your subscription will end in <span className="font-semibold">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>.
              You can reactivate anytime before it expires.
            </p>
            <Link to="/settings/subscription">
              <Button variant="default" size="sm" className="ml-4 shrink-0">
                Reactivate
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Subscription fully cancelled/expired
  if (subscription.status === 'CANCELLED') {
    return (
      <Alert className="border-red-500 bg-red-50 mb-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-900 font-semibold">
          Subscription Inactive
        </AlertTitle>
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <p>
              Your subscription has been cancelled. Reactivate or choose a new plan to continue.
            </p>
            <Link to="/settings/subscription">
              <Button variant="destructive" size="sm" className="ml-4 shrink-0">
                <Crown className="mr-2 h-4 w-4" />
                Reactivate
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

/**
 * Compact version for use in headers/navbars
 */
export function SubscriptionBannerCompact() {
  const { subscription, isOnTrial } = useSubscription();

  if (!subscription) return null;

  // Only show for trial ending soon or expired/cancelled subscriptions
  if (isOnTrial && subscription.trialEndsAt) {
    const daysLeft = differenceInDays(new Date(subscription.trialEndsAt), new Date());
    
    if (daysLeft <= 3 && daysLeft >= 0) {
      return (
        <div className="bg-amber-500 text-white px-4 py-2 text-sm text-center">
          Trial ends in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}.{' '}
          <Link to="/settings/subscription" className="underline font-semibold">
            Upgrade now
          </Link>
        </div>
      );
    }
  }

  if (subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED') {
    return (
      <div className="bg-red-500 text-white px-4 py-2 text-sm text-center">
        Your subscription has {subscription.status === 'EXPIRED' ? 'expired' : 'been cancelled'}.{' '}
        <Link to="/settings/subscription" className="underline font-semibold">
          Upgrade now
        </Link>
      </div>
    );
  }

  if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
    const daysLeft = differenceInDays(new Date(subscription.currentPeriodEnd), new Date());
    
    return (
      <div className="bg-orange-500 text-white px-4 py-2 text-sm text-center">
        Subscription ends in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}.{' '}
        <Link to="/settings/subscription" className="underline font-semibold">
          Reactivate
        </Link>
      </div>
    );
  }

  return null;
}
