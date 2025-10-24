# Subscription System Developer Guide

## Quick Start

### Check if user can access a feature

```tsx
import { useSubscription } from '@/hooks/useSubscription';

function MyComponent() {
  const { hasFeature, getLimit } = useSubscription();
  
  // Check boolean features
  if (hasFeature('analytics')) {
    return <AnalyticsPanel />;
  }
  
  // Check numeric limits
  const maxJobs = getLimit('maxJobs');
  if (maxJobs === null) {
    // Unlimited
  }
}
```

### Gate a feature with UI

```tsx
import { FeatureGate } from '@/components/subscription/FeatureGate';

function PremiumFeature() {
  return (
    <FeatureGate 
      feature="exportData" 
      showUpgradePrompt={true}
      fallback={<div>Premium only</div>}
    >
      <ExportDataButton />
    </FeatureGate>
  );
}
```

### Check usage limits

```tsx
import { FeatureLimitGate } from '@/components/subscription/FeatureGate';
import { useCanCreateClass } from '@/hooks/useSubscription';

function CreateClassButton() {
  const { canCreate, currentUsage, limit } = useCanCreateClass();
  
  return (
    <FeatureLimitGate 
      feature="maxClasses" 
      currentUsage={currentUsage || 0}
      warningThreshold={0.8} // Show warning at 80%
    >
      <Button onClick={handleCreate}>Create Class</Button>
    </FeatureLimitGate>
  );
}
```

### Display subscription status

```tsx
import { PlanBadge } from '@/components/subscription/FeatureGate';
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner';

function Dashboard() {
  return (
    <div>
      <SubscriptionBanner />
      <h1>Dashboard <PlanBadge /></h1>
    </div>
  );
}
```

## Available Features

### Boolean Features (hasFeature)
- `customCurrency` - Allow custom currency names
- `analytics` - Access to analytics dashboard
- `exportData` - Export data functionality
- `prioritySupport` - Priority customer support

### Numeric Limits (getLimit)
- `maxClasses` - Maximum number of classes
- `maxStudentsPerClass` - Maximum students per class
- `maxStoreItems` - Maximum store items
- `maxJobs` - Maximum job postings

## Plan Tiers

### FREE_TRIAL
- Duration: 14 days
- Classes: 2
- Students/class: 30
- All premium features enabled
- Auto-expires after 14 days

### BASIC
- Price: $9.99/month
- Classes: 3
- Students/class: 35
- Limited features

### PREMIUM
- Price: $19.99/month
- Classes: 10
- Students/class: 50
- All features except priority support

### ENTERPRISE
- Price: Custom
- Everything unlimited
- Priority support included

## Backend Usage

### Check permissions in resolvers

```typescript
import { SubscriptionService } from '../services/subscription';

async myResolver(parent, args, context) {
  // Check if user can create a class
  const check = await SubscriptionService.canCreateClass(context.user.id);
  if (!check.allowed) {
    throw new GraphQLError(check.reason);
  }
  
  // Proceed with creation
}
```

### Get user's subscription

```typescript
const subscription = await SubscriptionService.getOrCreateSubscription(userId);
console.log(subscription.planTier); // FREE_TRIAL, BASIC, etc.
console.log(subscription.limits.maxClasses); // 2, 3, 10, or null
```

## Error Handling

The system uses **fail-open** architecture:
- If subscription check fails → allow access
- If database error → allow access
- If invalid data → allow access

This ensures existing functionality never breaks due to subscription system issues.

## Testing with Existing Accounts

1. Existing accounts automatically get FREE_TRIAL on first access
2. Trial expires 14 days after creation
3. System logs subscription creation to console
4. Users can manage subscription in Settings → Subscription

## Stripe Integration (Future)

When ready to add Stripe:

1. Update `createCheckoutSession` mutation in `SubscriptionPlan.ts`
2. Add Stripe webhook handler
3. Update subscription status on payment success
4. Handle subscription cancellation events

## Common Patterns

### Check before creating resources

```tsx
const { canCreate } = useCanCreateClass();

<Button 
  disabled={!canCreate}
  onClick={handleCreate}
>
  Create Class
</Button>
```

### Show upgrade prompts

```tsx
const { isPremium, subscription } = useSubscription();

{!isPremium && (
  <Alert>
    Upgrade to Premium for unlimited classes!
  </Alert>
)}
```

### Display usage stats

```tsx
const { currentUsage, limit } = useCanCreateClass();

<div>
  Classes: {currentUsage} / {limit ?? '∞'}
</div>
```

## GraphQL Queries

### Get subscription
```graphql
query MySubscription {
  mySubscription {
    planTier
    status
    limits {
      maxClasses
      customCurrency
    }
  }
}
```

### Check feature
```graphql
query CanCreateClass {
  canCreateClass {
    allowed
    currentUsage
    limit
    reason
  }
}
```

### Manage subscription
```graphql
mutation CancelSubscription {
  cancelSubscription {
    status
    cancelAtPeriodEnd
  }
}
```
