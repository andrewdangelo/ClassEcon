// src/components/subscription/SubscriptionStatus.tsx
import { format, formatDistanceToNow } from 'date-fns';
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Star, 
  XCircle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BillingPortalButton } from './BillingPortalButton';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
}

export function SubscriptionStatus({ onUpgrade }: SubscriptionStatusProps) {
  const { subscription, isOnTrial, daysRemaining, loading } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>Get started with a free trial today</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onUpgrade}>Start Free Trial</Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (subscription.status) {
      case 'ACTIVE':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'TRIAL':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'PAST_DUE':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'CANCELED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'TRIAL':
        return <Badge variant="secondary">Trial</Badge>;
      case 'PAST_DUE':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'CANCELED':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="outline">{subscription.status}</Badge>;
    }
  };

  const trialProgress = isOnTrial && daysRemaining !== undefined
    ? Math.max(0, Math.min(100, ((14 - daysRemaining) / 14) * 100))
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="flex items-center gap-2">
                {subscription.planTier} Plan
                {subscription.isFoundingMember && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    <Star className="h-3 w-3 mr-1" />
                    Founding Member
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {getStatusBadge()}
              </CardDescription>
            </div>
          </div>
          <BillingPortalButton size="sm" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trial Progress */}
        {isOnTrial && trialProgress !== null && subscription.trialEndsAt && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Trial Period</span>
              <span className="font-medium">
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
              </span>
            </div>
            <Progress value={trialProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Your trial ends on {format(new Date(subscription.trialEndsAt!), 'MMMM d, yyyy')}
            </p>
          </div>
        )}

        <Separator />

        {/* Billing Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Current Period
            </p>
            <p className="text-sm font-medium">
              {subscription.currentPeriodStart && subscription.currentPeriodEnd
                ? `${format(new Date(subscription.currentPeriodStart), 'MMM d')} - ${format(
                    new Date(subscription.currentPeriodEnd),
                    'MMM d, yyyy'
                  )}`
                : 'Not available'}
            </p>
          </div>

          {subscription.currentPeriodEnd && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Next Billing
              </p>
              <p className="text-sm font-medium">
                {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
                <span className="text-muted-foreground ml-1">
                  ({formatDistanceToNow(new Date(subscription.currentPeriodEnd), { addSuffix: true })})
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Cancel Warning */}
        {subscription.cancelAtPeriodEnd && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Subscription Ending</p>
                <p className="text-muted-foreground">
                  Your subscription will end on{' '}
                  {subscription.currentPeriodEnd
                    ? format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')
                    : 'the end of your current billing cycle'}
                  .
                  You'll lose access to premium features after this date.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Past Due Warning */}
        {subscription.status === 'PAST_DUE' && (
          <div className="rounded-lg bg-yellow-50 p-4 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
              <div>
                <p className="font-medium text-yellow-800">Payment Past Due</p>
                <p className="text-yellow-700">
                  We were unable to process your payment. Please update your payment method
                  to avoid service interruption.
                </p>
                <BillingPortalButton 
                  variant="secondary" 
                  size="sm" 
                  className="mt-2"
                >
                  Update Payment Method
                </BillingPortalButton>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Button for lower tiers */}
        {(subscription.planTier === 'FREE' || 
          subscription.planTier === 'TRIAL' || 
          subscription.planTier === 'STARTER') && (
          <div className="pt-2">
            <Button onClick={onUpgrade} className="w-full">
              {subscription.planTier === 'STARTER' ? 'Upgrade to Professional' : 'Upgrade Now'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
