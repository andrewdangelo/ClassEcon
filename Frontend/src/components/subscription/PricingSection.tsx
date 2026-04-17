// src/components/subscription/PricingSection.tsx
import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { PricingCard, type PricingPlan } from './PricingCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/Label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

const CREATE_CHECKOUT_SESSION = gql`
  mutation CreatePaymentCheckout($tier: String!, $interval: String!, $isFoundingMember: Boolean) {
    createPaymentCheckout(tier: $tier, interval: $interval, isFoundingMember: $isFoundingMember) {
      sessionId
      url
    }
  }
`;

const PLANS: PricingPlan[] = [
  {
    tier: 'STARTER',
    name: 'Starter',
    description: 'Perfect for individual teachers just getting started',
    pricing: { monthly: 9, yearly: 90 },
    features: [
      'Up to 30 students',
      '1 classroom',
      'Basic job system',
      'Classroom store',
      'Transaction tracking',
      'Email support',
    ],
    limits: {
      maxClasses: 1,
      maxStudentsPerClass: 30,
      maxStoreItems: 20,
      maxJobs: 10,
      customCurrency: false,
      analytics: false,
      exportData: false,
      prioritySupport: false,
    },
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional',
    description: 'Best for teachers who want the full experience',
    pricing: { monthly: 19, yearly: 190 },
    features: [
      'Unlimited students',
      'Up to 5 classrooms',
      'Advanced job system',
      'Custom store items',
      'Analytics dashboard',
      'Fine management',
      'Priority support',
      'Custom currency names',
    ],
    limits: {
      maxClasses: 5,
      maxStudentsPerClass: -1,
      maxStoreItems: 100,
      maxJobs: 50,
      customCurrency: true,
      analytics: true,
      exportData: true,
      prioritySupport: false,
    },
    popular: true,
  },
  {
    tier: 'SCHOOL',
    name: 'School',
    description: 'For schools and districts with multiple teachers',
    pricing: { monthly: 0, yearly: 0, custom: true },
    features: [
      'Unlimited classrooms',
      'Unlimited students',
      'All Professional features',
      'Admin dashboard',
      'Bulk student management',
      'Training sessions',
      'Dedicated support',
      'Custom integrations',
    ],
    limits: {
      maxClasses: -1,
      maxStudentsPerClass: -1,
      maxStoreItems: -1,
      maxJobs: -1,
      customCurrency: true,
      analytics: true,
      exportData: true,
      prioritySupport: true,
    },
  },
];

interface PricingSectionProps {
  showFoundingMemberBanner?: boolean;
}

interface CreatePaymentCheckoutData {
  createPaymentCheckout?: {
    sessionId: string;
    url: string;
  } | null;
}

interface CreatePaymentCheckoutVars {
  tier: string;
  interval: 'monthly' | 'yearly';
  isFoundingMember?: boolean;
}

export function PricingSection({ showFoundingMemberBanner = true }: PricingSectionProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const { subscription, isOnTrial } = useSubscription();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const [createCheckout, { loading, error }] = useMutation<
    CreatePaymentCheckoutData,
    CreatePaymentCheckoutVars
  >(CREATE_CHECKOUT_SESSION, {
    onCompleted: (data: CreatePaymentCheckoutData) => {
      if (data.createPaymentCheckout?.url) {
        window.location.href = data.createPaymentCheckout.url;
      }
    },
  });

  const handleSelectPlan = async (tier: string) => {
    if (tier === 'SCHOOL') {
      // Redirect to contact page for enterprise
      window.location.href = '/contact?plan=school';
      return;
    }

    // Check if user is authenticated
    if (!isLoggedIn) {
      // Store the intended plan and redirect to login
      sessionStorage.setItem('returnToCheckout', JSON.stringify({ tier, interval: billingInterval }));
      navigate('/login?redirect=/pricing');
      return;
    }

    setSelectedTier(tier);

    try {
      await createCheckout({
        variables: {
          tier,
          interval: billingInterval,
          isFoundingMember: subscription?.isFoundingMember || false,
        },
      });
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Founding Member Banner */}
      {showFoundingMemberBanner && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6" />
            <h3 className="text-xl font-bold">Founding Member Special</h3>
          </div>
          <p className="font-semibold">50% OFF LIFETIME for the first 100 teachers!</p>
          <p className="text-amber-100 text-sm mt-1">
            Lock in these prices forever + get exclusive early access to new features
          </p>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label
          htmlFor="billing-toggle"
          className={billingInterval === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}
        >
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={billingInterval === 'yearly'}
          onCheckedChange={(checked) => setBillingInterval(checked ? 'yearly' : 'monthly')}
        />
        <Label
          htmlFor="billing-toggle"
          className={billingInterval === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}
        >
          Yearly
          <span className="ml-1 text-xs text-green-600 font-normal">(Save 2 months)</span>
        </Label>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to create checkout session. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Trial Info */}
      {(!subscription || isOnTrial) && (
        <Alert>
          <AlertDescription>
            All paid plans include a 14-day free trial. No credit card required to start.
          </AlertDescription>
        </Alert>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.tier}
            plan={plan}
            currentTier={subscription?.planTier}
            billingInterval={billingInterval}
            onSelect={handleSelectPlan}
            loading={loading && selectedTier === plan.tier}
            isFoundingMember={subscription?.isFoundingMember}
          />
        ))}
      </div>
    </div>
  );
}
