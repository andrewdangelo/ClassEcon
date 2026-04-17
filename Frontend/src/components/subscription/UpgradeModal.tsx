// src/components/subscription/UpgradeModal.tsx
import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, ArrowUpCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

const UPGRADE_SUBSCRIPTION = gql`
  mutation UpgradeSubscription($tier: String!, $interval: String) {
    upgradeSubscription(tier: $tier, interval: $interval) {
      success
      message
      checkoutUrl
    }
  }
`;

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetTier?: 'STARTER' | 'PROFESSIONAL';
  reason?: string;
}

interface UpgradeSubscriptionData {
  upgradeSubscription?: {
    success: boolean;
    message?: string | null;
    checkoutUrl?: string | null;
  } | null;
}

interface UpgradeSubscriptionVars {
  tier: 'STARTER' | 'PROFESSIONAL';
  interval: 'monthly' | 'yearly';
}

const TIER_DETAILS = {
  STARTER: {
    name: 'Starter',
    price: 9,
    features: ['1 classroom', '30 students', 'Basic features'],
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 19,
    features: ['5 classrooms', 'Unlimited students', 'Advanced analytics', 'Priority support'],
  },
};

export function UpgradeModal({
  open,
  onOpenChange,
  targetTier = 'PROFESSIONAL',
  reason,
}: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<'STARTER' | 'PROFESSIONAL'>(targetTier);
  const { subscription } = useSubscription();
  
  const [upgradeSubscription, { loading }] = useMutation<
    UpgradeSubscriptionData,
    UpgradeSubscriptionVars
  >(UPGRADE_SUBSCRIPTION, {
    onCompleted: (data: UpgradeSubscriptionData) => {
      if (data.upgradeSubscription?.checkoutUrl) {
        window.location.href = data.upgradeSubscription.checkoutUrl;
      } else if (data.upgradeSubscription?.success) {
        onOpenChange(false);
        window.location.reload();
      }
    },
  });

  const handleUpgrade = async () => {
    try {
      await upgradeSubscription({
        variables: {
          tier: selectedTier,
          interval: 'monthly',
        },
      });
    } catch (err) {
      console.error('Upgrade error:', err);
    }
  };

  const currentTier = subscription?.planTier || 'FREE';
  const availableTiers = Object.entries(TIER_DETAILS).filter(
    ([tier]) => tier !== currentTier && 
      (currentTier === 'FREE' || currentTier === 'TRIAL' || 
       (currentTier === 'STARTER' && tier === 'PROFESSIONAL'))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            {reason || 'Unlock more features and grow your classroom economy.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedTier}
            onValueChange={(value) => setSelectedTier(value as 'STARTER' | 'PROFESSIONAL')}
            className="space-y-4"
          >
            {availableTiers.map(([tier, details]) => (
              <div
                key={tier}
                className={`relative flex items-start space-x-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                  selectedTier === tier
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setSelectedTier(tier as 'STARTER' | 'PROFESSIONAL')}
              >
                <RadioGroupItem value={tier} id={tier} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={tier} className="flex items-center gap-2 cursor-pointer">
                    <span className="font-semibold">{details.name}</span>
                    {tier === 'PROFESSIONAL' && (
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${details.price}/month
                  </p>
                  <ul className="mt-2 space-y-1">
                    {details.features.map((feature, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upgrade Now'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
