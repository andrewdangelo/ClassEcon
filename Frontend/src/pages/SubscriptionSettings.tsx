import { useState } from 'react';
import { useSubscription, useAvailablePlans } from '@/hooks/useSubscription';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Check, X, Loader2, AlertCircle, Receipt, Settings } from 'lucide-react';
import { 
  SubscriptionStatus, 
  PricingSection, 
  BillingPortalButton, 
  InvoiceHistory,
  UpgradeModal 
} from '@/components/subscription';

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
  const { subscription, loading: subLoading, refetch, isPremium } = useSubscription();
  const { loading: plansLoading } = useAvailablePlans();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="page-stack mx-auto w-full max-w-6xl">
        <h1 className="page-title">Subscription</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have an active subscription. Choose a plan to get started!
          </AlertDescription>
        </Alert>
        <PricingSection />
      </div>
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

  return (
    <div className="page-stack mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Subscription & Billing</h1>
        <BillingPortalButton />
      </div>

      <Tabs defaultValue="overview" className="flex flex-col gap-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Billing History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex flex-col gap-6">
          <SubscriptionStatus onUpgrade={() => setUpgradeModalOpen(true)} />
          
          {/* Plan Limits Card */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Limits</CardTitle>
              <CardDescription>Your current plan allows the following</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Classes:</span>{' '}
                  <span className="font-medium">
                    {subscription.limits?.maxClasses === null ? 'Unlimited' : subscription.limits?.maxClasses}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Students per class:</span>{' '}
                  <span className="font-medium">
                    {subscription.limits?.maxStudentsPerClass === null ? 'Unlimited' : subscription.limits?.maxStudentsPerClass}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Store items:</span>{' '}
                  <span className="font-medium">
                    {subscription.limits?.maxStoreItems === null ? 'Unlimited' : subscription.limits?.maxStoreItems}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Jobs:</span>{' '}
                  <span className="font-medium">
                    {subscription.limits?.maxJobs === null ? 'Unlimited' : subscription.limits?.maxJobs}
                  </span>
                </div>
              </div>
              
              {/* Features */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold mb-3">Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <FeatureItem enabled={subscription.limits?.customCurrency} label="Custom Currency" />
                  <FeatureItem enabled={subscription.limits?.analytics} label="Analytics" />
                  <FeatureItem enabled={subscription.limits?.exportData} label="Export Data" />
                  <FeatureItem enabled={subscription.limits?.prioritySupport} label="Priority Support" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Subscription Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Actions</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              {subscription.cancelAtPeriodEnd ? (
                <Button
                  onClick={handleReactivate}
                  disabled={reactivating}
                >
                  {reactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reactivate Subscription
                </Button>
              ) : subscription.planTier !== 'FREE' && subscription.planTier !== 'TRIAL' && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cancel Subscription
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <PricingSection showFoundingMemberBanner={subscription.isFoundingMember || !isPremium} />
        </TabsContent>

        {/* Billing History Tab */}
        <TabsContent value="billing">
          <InvoiceHistory />
        </TabsContent>
      </Tabs>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        targetTier="PROFESSIONAL"
      />
    </div>
  );
}

function FeatureItem({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={enabled ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
