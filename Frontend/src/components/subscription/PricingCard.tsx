// src/components/subscription/PricingCard.tsx
import { Check, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PricingPlan {
  tier: string;
  name: string;
  description: string;
  pricing: {
    monthly: number;
    yearly: number;
    custom?: boolean;
  };
  features: string[];
  limits: {
    maxClasses: number;
    maxStudentsPerClass: number;
    maxStoreItems: number;
    maxJobs: number;
    customCurrency: boolean;
    analytics: boolean;
    exportData: boolean;
    prioritySupport: boolean;
  };
  popular?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  currentTier?: string;
  billingInterval: 'monthly' | 'yearly';
  onSelect: (tier: string) => void;
  loading?: boolean;
  isFoundingMember?: boolean;
}

export function PricingCard({
  plan,
  currentTier,
  billingInterval,
  onSelect,
  loading,
  isFoundingMember,
}: PricingCardProps) {
  const isCurrent = currentTier === plan.tier;
  const isCustom = plan.pricing.custom;
  const price = billingInterval === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;
  const monthlyPrice = billingInterval === 'yearly' ? Math.round(plan.pricing.yearly / 12) : price;
  
  // Founding member discount (50% off)
  const discountedPrice = isFoundingMember && plan.tier === 'PROFESSIONAL' 
    ? Math.round(monthlyPrice * 0.5) 
    : monthlyPrice;

  const getButtonText = () => {
    if (isCurrent) return 'Current Plan';
    if (isCustom) return 'Contact Sales';
    if (!currentTier || currentTier === 'FREE' || currentTier === 'TRIAL') return 'Start Free Trial';
    return 'Upgrade';
  };

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        plan.popular && 'border-primary shadow-lg scale-105',
        isCurrent && 'ring-2 ring-primary'
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary">Current</Badge>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        
        <div className="mt-4">
          {isCustom ? (
            <div className="text-3xl font-bold">Custom</div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-1">
                {isFoundingMember && plan.tier === 'PROFESSIONAL' && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${monthlyPrice}
                  </span>
                )}
                <span className="text-4xl font-bold">${discountedPrice}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              {billingInterval === 'yearly' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Billed ${plan.pricing.yearly}/year
                </p>
              )}
              {isFoundingMember && plan.tier === 'PROFESSIONAL' && (
                <Badge variant="outline" className="mt-2 bg-amber-50 text-amber-700 border-amber-300">
                  50% Founding Member Discount
                </Badge>
              )}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-3 flex-1">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className="w-full mt-6"
          variant={plan.popular ? 'default' : 'outline'}
          disabled={isCurrent || loading}
          onClick={() => onSelect(plan.tier)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            getButtonText()
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
