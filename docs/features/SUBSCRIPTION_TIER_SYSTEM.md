# Subscription Tier System Implementation

## Overview
Implemented a comprehensive subscription tier system with feature restrictions and a trial period.

## Branch
`feature/subscription-tiers`

## Subscription Tiers

### 1. **FREE Tier**
- **Price**: $0
- **Limits**:
  - 10 students max
  - 1 class max
- **Features**:
  - Basic jobs
  - Basic store
  - Student dashboard
  - Basic transactions

### 2. **TRIAL Tier** ⭐
- **Price**: $0
- **Duration**: 14 days
- **Limits**: UNLIMITED
- **Features**: ALL FEATURES (*)
- Automatically downgrades to FREE when trial expires

### 3. **STARTER Tier**
- **Price**: $9/month ($4.50 for founding members)
- **Limits**:
  - 30 students max
  - 1 class max
- **Features**:
  - All FREE features
  - Email support
  - Pay requests
  - Fine system
  - Basic reports

### 4. **PROFESSIONAL Tier**
- **Price**: $19/month ($9.50 for founding members)
- **Limits**:
  - Unlimited students
  - 3 classes max
- **Features**:
  - All STARTER features
  - Analytics dashboard
  - Advanced reports
  - Custom branding
  - Priority support
  - Goal tracking
  - Export data
  - Balance history
  - Activity tracking

### 5. **SCHOOL Tier**
- **Price**: Custom pricing
- **Limits**: UNLIMITED
- **Features**: ALL FEATURES (*)
- Enterprise solution for schools and districts

## Implementation Details

### Backend Changes

#### 1. User Model (`Backend/src/models/User.ts`)
Added subscription fields:
```typescript
subscriptionTier: SubscriptionTier;
subscriptionStatus: SubscriptionStatus;
subscriptionExpiresAt?: Date | null;
trialStartedAt?: Date | null;
trialEndsAt?: Date | null;
isFoundingMember: boolean;
stripeCustomerId?: string | null;
stripeSubscriptionId?: string | null;
```

#### 2. Enums (`Backend/src/utils/enums.ts`)
```typescript
export type SubscriptionTier = "FREE" | "TRIAL" | "STARTER" | "PROFESSIONAL" | "SCHOOL";
export type SubscriptionStatus = "ACTIVE" | "TRIAL" | "EXPIRED" | "CANCELED" | "PAST_DUE";
```

#### 3. Tier Constants (`Backend/src/utils/tierConstants.ts`)
- `TIER_FEATURES`: Complete feature definitions for each tier
- `hasFeatureAccess()`: Check if a feature is available for a tier
- `checkStudentLimit()`: Validate student count against tier limits
- `checkClassLimit()`: Validate class count against tier limits
- `isTrialExpired()`: Check if trial period has ended
- `isSubscriptionExpired()`: Check if subscription has expired

#### 4. GraphQL Schema (`Backend/src/schema.ts`)
Added enums and fields to User type:
```graphql
enum SubscriptionTier {
  FREE
  TRIAL
  STARTER
  PROFESSIONAL
  SCHOOL
}

enum SubscriptionStatus {
  ACTIVE
  TRIAL
  EXPIRED
  CANCELED
  PAST_DUE
}
```

### Frontend Changes

#### 1. User Type (`Frontend/src/redux/authSlice.ts`)
Extended User type with subscription fields

#### 2. Tier Constants (`Frontend/src/lib/tierConstants.ts`)
- Mirror of backend tier definitions
- Helper functions for feature checking
- `getEffectiveTier()`: Calculates actual tier considering expirations

#### 3. Custom Hooks (`Frontend/src/hooks/useSubscriptionTier.ts`)

##### `useFeatureAccess(featureName: string)`
```typescript
const hasAnalytics = useFeatureAccess("analytics");
// Returns: boolean
```

##### `useStudentLimit(currentCount: number)`
```typescript
const { withinLimit, limit, remaining, exceeded } = useStudentLimit(25);
// Returns: { withinLimit: boolean, limit: number | null, remaining: number | null, exceeded: boolean }
```

##### `useClassLimit(currentCount: number)`
```typescript
const { withinLimit, limit, remaining, exceeded } = useClassLimit(2);
```

##### `useSubscriptionTier()`
```typescript
const {
  tier,
  status,
  displayName,
  features,
  isTrialActive,
  isTrialExpired,
  isSubscriptionExpired,
  daysRemainingInTrial,
  isFoundingMember
} = useSubscriptionTier();
```

##### `useMultipleFeatureAccess(features: string[])`
```typescript
const access = useMultipleFeatureAccess(["analytics", "exportData", "customBranding"]);
// Returns: { analytics: boolean, exportData: boolean, customBranding: boolean }
```

#### 4. UI Components (`Frontend/src/components/subscription/TierComponents.tsx`)

##### `<FeatureGate>`
Gates content behind feature flags with upgrade prompts:
```tsx
<FeatureGate feature="analytics">
  <AnalyticsDashboard />
</FeatureGate>
```

##### `<TierBadge>`
Displays user's current tier with icon and trial countdown:
```tsx
<TierBadge />
```

##### `<LimitWarning>`
Shows warnings when approaching tier limits:
```tsx
<LimitWarning 
  current={28} 
  limit={30} 
  itemName="students" 
/>
```

##### `<TrialBanner>`
Shows trial status and days remaining:
```tsx
<TrialBanner />
```

## Usage Examples

### 1. Gate a Feature
```tsx
import { FeatureGate } from "@/components/subscription/TierComponents";

function TeacherDashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Only show to Professional+ users */}
      <FeatureGate feature="analytics">
        <AnalyticsPanel />
      </FeatureGate>
    </div>
  );
}
```

### 2. Check Feature in Logic
```tsx
import { useFeatureAccess } from "@/hooks/useSubscriptionTier";

function ExportButton() {
  const canExport = useFeatureAccess("exportData");
  
  return (
    <Button 
      disabled={!canExport}
      onClick={exportData}
    >
      {canExport ? "Export Data" : "Upgrade to Export"}
    </Button>
  );
}
```

### 3. Enforce Student Limit
```tsx
import { useStudentLimit } from "@/hooks/useSubscriptionTier";

function AddStudentButton() {
  const students = useQuery(GET_STUDENTS);
  const { exceeded, remaining } = useStudentLimit(students.length);
  
  if (exceeded) {
    return (
      <Alert>
        Student limit reached. Upgrade to add more students.
      </Alert>
    );
  }
  
  return (
    <div>
      <Button>Add Student</Button>
      <p>{remaining} slots remaining</p>
    </div>
  );
}
```

### 4. Show Trial Banner
```tsx
import { TrialBanner } from "@/components/subscription/TierComponents";

function Layout() {
  return (
    <div>
      <TrialBanner />
      {/* Rest of layout */}
    </div>
  );
}
```

## Feature Restriction Checklist

### To Be Implemented:
- [ ] **Student Limits**: Prevent adding students beyond tier limit
- [ ] **Class Limits**: Prevent creating classes beyond tier limit
- [ ] **Analytics Dashboard**: Gate behind Professional+ tier
- [ ] **Advanced Reports**: Gate behind Professional+ tier
- [ ] **Custom Branding**: Gate behind Professional+ tier
- [ ] **Export Data**: Gate behind Professional+ tier
- [ ] **Balance History Chart**: Gate behind Professional+ tier
- [ ] **Activity Tracking Widget**: Gate behind Professional+ tier
- [ ] **Goal Tracking**: Gate behind Professional+ tier
- [ ] **Trial Start Flow**: Auto-assign TRIAL tier to new users
- [ ] **Trial Expiration**: Cron job to downgrade expired trials
- [ ] **Stripe Integration**: Checkout sessions for upgrades
- [ ] **Subscription Management**: Cancel/reactivate subscriptions

## Next Steps

1. **Implement Trial Start Flow**
   - Add trial assignment during signup
   - Create trial activation mutation

2. **Add Feature Gates to Existing Components**
   - Wrap analytics components with `<FeatureGate>`
   - Add student/class limit checks to forms

3. **Stripe Integration**
   - Add Stripe checkout mutation
   - Handle webhook events
   - Implement subscription management UI

4. **Backend Enforcement**
   - Add middleware to check tier limits
   - Create resolvers for tier checks
   - Implement cron jobs for expiration handling

5. **UI Enhancements**
   - Create pricing page component
   - Add upgrade flow modals
   - Implement tier comparison table

## Testing Considerations

- Test trial expiration logic
- Test tier downgrade scenarios
- Test feature access with different tiers
- Test limit enforcement
- Test founding member pricing
- Test subscription status changes

## Migration Strategy

For existing users:
1. Default all existing users to `FREE` tier
2. Optionally grant `TRIAL` tier to active users
3. Manually upgrade early adopters to founding member pricing
4. Send notification about new tier system

---

**Commit**: `924922e`  
**Date**: October 24, 2025  
**Status**: ✅ Ready for testing and integration
