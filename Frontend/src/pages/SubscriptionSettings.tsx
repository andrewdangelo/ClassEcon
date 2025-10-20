import React from 'react';
import { useSubscription, useAvailablePlans } from '@/hooks/useSubscription';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription {
    cancelSubscription {
      id
      status
      cancelAtPeriodEnd
      cancelledAt
    }
  }
`;

const REACTIVATE_SUBSCRIPTION = gql`
  mutation ReactivateSubscription {
    reactivateSubscription {
      id
      status
      cancelAtPeriodEnd
    }
  }
`;

export function SubscriptionSettingsPage() {
  const { subscription, loading: subLoading, refetch, isOnTrial, isPremium, isActive } = useSubscription();
  const { plans, loading: plansLoading } = useAvailablePlans();
  
  const [cancelSubscription, { loading: cancelling }] = useMutation(CANCEL_SUBSCRIPTION, {
    onCompleted: () => {
      refetch();
    },
  });
  
  const [reactivateSubscription, { loading: reactivating }] = useMutation(REACTIVATE_SUBSCRIPTION, {
    onCompleted: () => {
      refetch();
    },
  });

  if (subLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load subscription information. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      try {
        await cancelSubscription();
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        alert('Failed to cancel subscription. Please try again.');
      }
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateSubscription();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert('Failed to reactivate subscription. Please try again.');
    }
  };

  const currentPlan = plans.find(p => p.tier === subscription.planTier);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Manage your ClassEcon subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{currentPlan?.name || subscription.planTier}</h3>
                {isPremium && <Crown className="h-6 w-6 text-amber-500" />}
                <Badge variant={isActive ? 'default' : 'destructive'}>
                  {subscription.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {currentPlan ? `$${currentPlan.price}/month` : 'Free'}
              </p>
            </div>
          </div>

          {/* Trial Info */}
          {isOnTrial && subscription.trialEndsAt && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-900">
                Your trial ends on{' '}
                <span className="font-semibold">
                  {format(new Date(subscription.trialEndsAt), 'MMMM d, yyyy')}
                </span>
                {' '}({differenceInDays(new Date(subscription.trialEndsAt), new Date())} days remaining)
              </AlertDescription>
            </Alert>
          )}

          {/* Billing Info */}
          {subscription.currentPeriodEnd && !isOnTrial && (
            <div className="text-sm text-gray-600">
              {subscription.cancelAtPeriodEnd ? (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertDescription className="text-orange-900">
                    Your subscription will end on{' '}
                    <span className="font-semibold">
                      {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
                    </span>
                  </AlertDescription>
                </Alert>
              ) : (
                <p>
                  Next billing date:{' '}
                  <span className="font-semibold">
                    {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Plan Limits */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Plan Limits</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Classes:</span>{' '}
                <span className="font-medium">
                  {subscription.limits.maxClasses === null ? 'Unlimited' : subscription.limits.maxClasses}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Students per class:</span>{' '}
                <span className="font-medium">
                  {subscription.limits.maxStudentsPerClass === null ? 'Unlimited' : subscription.limits.maxStudentsPerClass}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Store items:</span>{' '}
                <span className="font-medium">
                  {subscription.limits.maxStoreItems === null ? 'Unlimited' : subscription.limits.maxStoreItems}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Jobs:</span>{' '}
                <span className="font-medium">
                  {subscription.limits.maxJobs === null ? 'Unlimited' : subscription.limits.maxJobs}
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Features</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <FeatureItem enabled={subscription.limits.customCurrency} label="Custom Currency" />
              <FeatureItem enabled={subscription.limits.analytics} label="Analytics" />
              <FeatureItem enabled={subscription.limits.exportData} label="Export Data" />
              <FeatureItem enabled={subscription.limits.prioritySupport} label="Priority Support" />
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-4 flex gap-2">
            {subscription.cancelAtPeriodEnd ? (
              <Button
                onClick={handleReactivate}
                disabled={reactivating}
              >
                {reactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reactivate Subscription
              </Button>
            ) : subscription.planTier !== 'FREE_TRIAL' && (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.tier}
              plan={plan}
              current={plan.tier === subscription.planTier}
              onUpgrade={() => {
                // TODO: Implement Stripe checkout
                alert('Stripe integration coming soon!');
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-gray-400" />
      )}
      <span className={enabled ? 'text-gray-900' : 'text-gray-400'}>{label}</span>
    </div>
  );
}

function PlanCard({ plan, current, onUpgrade }: any) {
  return (
    <Card className={current ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          {current && <Badge>Current</Badge>}
        </div>
        <CardDescription className="text-2xl font-bold">
          ${plan.price}
          <span className="text-sm font-normal text-gray-500">/month</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm">
          {plan.features.slice(0, 4).map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {!current && (
          <Button className="w-full" onClick={onUpgrade}>
            <Crown className="mr-2 h-4 w-4" />
            Upgrade
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
