# Subscription Tier Testing Guide

## Quick Start

### Access the Testing Page
Navigate to: **`/dev/tier-testing`** after logging in

Example: `http://localhost:5173/dev/tier-testing`

### Testing with Demo Account
Use your demo account: **teacher+carter@demo.school**

## Feature Gates Implemented

### 1. Student Dashboard (`StudentDashboard.tsx`)
✅ **Balance History Chart** - Gated behind `balanceHistory` feature
- **Available in**: Professional, School, Trial
- **Restricted in**: FREE, Starter

✅ **Activity Tracking Widget** - Gated behind `activityTracking` feature
- **Available in**: Professional, School, Trial
- **Restricted in**: FREE, Starter

### 2. Teacher Dashboard (`TeacherDashboard.tsx`)
✅ **Tier Badge** - Displays current subscription tier in header
✅ **Trial Banner** - Shows trial countdown when active
✅ **Class Limit Tracking** - Built into dashboard (ready for enforcement)

## Testing Workflow

### Step 1: Log In
```
Email: teacher+carter@demo.school
Password: [your password]
```

### Step 2: Navigate to Testing Page
Go to: `/dev/tier-testing`

### Step 3: Test Each Tier

#### Test FREE Tier
1. Click "Free" button in Tier Testing Panel
2. Expected behavior:
   - ✅ Tier Badge shows "Free"
   - ✅ Max 10 students
   - ✅ Max 1 class
   - ❌ Balance History Chart - HIDDEN (shows upgrade prompt)
   - ❌ Activity Tracking Widget - HIDDEN (shows upgrade prompt)
   - ✅ Feature Access Tests show RED X for premium features

#### Test TRIAL Tier
1. Click "Trial" button in Tier Testing Panel
2. Expected behavior:
   - ✅ Tier Badge shows "Trial" with days remaining (14d left)
   - ✅ Trial Banner appears at top
   - ✅ Unlimited students
   - ✅ Unlimited classes
   - ✅ Balance History Chart - VISIBLE
   - ✅ Activity Tracking Widget - VISIBLE
   - ✅ All Feature Access Tests show GREEN checkmark
   - ✅ "Trial Active" banner shows countdown

#### Test STARTER Tier
1. Click "Starter" button in Tier Testing Panel
2. Expected behavior:
   - ✅ Tier Badge shows "Starter"
   - ✅ Max 30 students
   - ✅ Max 1 class
   - ❌ Balance History Chart - HIDDEN (shows upgrade prompt)
   - ❌ Activity Tracking Widget - HIDDEN (shows upgrade prompt)
   - ❌ Analytics, Advanced Reports, Custom Branding - RESTRICTED

#### Test PROFESSIONAL Tier
1. Click "Professional" button in Tier Testing Panel
2. Expected behavior:
   - ✅ Tier Badge shows "Professional"
   - ✅ Unlimited students
   - ✅ Max 3 classes
   - ✅ Balance History Chart - VISIBLE
   - ✅ Activity Tracking Widget - VISIBLE
   - ✅ All premium features ACCESSIBLE
   - ✅ All Feature Access Tests show GREEN checkmark

#### Test SCHOOL Tier
1. Click "School" button in Tier Testing Panel
2. Expected behavior:
   - ✅ Tier Badge shows "School"
   - ✅ Unlimited students
   - ✅ Unlimited classes
   - ✅ All features ACCESSIBLE
   - ✅ Enterprise-level access

### Step 4: Test Special Scenarios

#### Founding Member
1. Click "Pro (Founding Member)" button
2. Expected behavior:
   - ✅ Price shown as $9.50/mo instead of $19/mo (50% discount)
   - ✅ "Founding Member" badge visible

#### Trial Expiring Soon
1. Click "Trial (1 day left)" button
2. Expected behavior:
   - ✅ Trial banner shows "1 day left"
   - ✅ Urgency indicator (consider upgrading)

#### Expired Subscription
1. Click "Starter (Expired)" button
2. Expected behavior:
   - ❌ Downgraded to FREE tier features
   - ✅ Premium features locked
   - ✅ Expiration notice shown

### Step 5: Test Limit Warnings

#### Student Limits
1. On testing page, adjust student count slider
2. Test at:
   - **5 students** (FREE: 50% capacity - no warning)
   - **8 students** (FREE: 80% capacity - warning appears)
   - **10 students** (FREE: at limit - blocked)
   - **25 students** (STARTER: within limit)
   - **30 students** (STARTER: at limit - blocked)

#### Class Limits
1. On testing page, adjust class count
2. Test at:
   - **1 class** (FREE/STARTER: at limit)
   - **2 classes** (FREE/STARTER: blocked, PROFESSIONAL: within limit)
   - **3 classes** (PROFESSIONAL: at limit)

## Verification Checklist

### Visual Elements
- [ ] Tier Badge appears in teacher dashboard header
- [ ] Trial Banner shows when in TRIAL tier
- [ ] Upgrade prompts appear when accessing locked features
- [ ] Limit warnings show at 80% capacity
- [ ] Limit blocks appear at 100% capacity

### Feature Access
- [ ] Balance History visible only in Pro/School/Trial
- [ ] Activity Tracking visible only in Pro/School/Trial
- [ ] Analytics feature check works correctly
- [ ] Export Data feature check works correctly
- [ ] Custom Branding feature check works correctly

### Limit Enforcement
- [ ] Student limits calculate correctly
- [ ] Class limits calculate correctly
- [ ] Warnings appear at 80% threshold
- [ ] Blocks appear at 100% threshold
- [ ] Unlimited tiers show "∞" symbol

### Tier Switching
- [ ] FREE tier locks premium features
- [ ] TRIAL tier unlocks all features
- [ ] STARTER tier has partial access
- [ ] PROFESSIONAL tier has advanced access
- [ ] SCHOOL tier has full access
- [ ] Founding member pricing displays correctly
- [ ] Expired subscriptions revert to FREE

## Important Notes

### ⚠️ Testing Limitations
1. **Changes are NOT persisted** - Tier changes only affect your browser session
2. **Refresh resets** - Refreshing the page will reset tier to FREE (or whatever's in your actual user record)
3. **Backend not updated** - The testing panel only updates Redux state, not the database
4. **No Stripe integration yet** - Payment flows are not implemented

### 🔧 How It Works
The Tier Testing Panel:
1. Gets current user from Redux
2. Updates user object with new tier data
3. Dispatches updated user back to Redux
4. All components react to the Redux state change
5. Feature gates re-evaluate based on new tier

### 📝 Actual Implementation
When ready for production:
1. Add tier field to User mutation/update
2. Create Stripe checkout integration
3. Add webhook handlers for subscription events
4. Implement trial activation on signup
5. Add cron job for trial/subscription expiration
6. Enforce limits in backend resolvers

## Testing Each Feature

### Balance History Chart
1. Go to Student Dashboard (switch to student role if needed)
2. Switch tier using testing panel
3. Observe:
   - **FREE/STARTER**: Shows orange upgrade prompt
   - **PROFESSIONAL/SCHOOL/TRIAL**: Shows chart with balance over time

### Activity Tracking Widget
1. Go to Student Dashboard
2. Switch tier using testing panel
3. Observe:
   - **FREE/STARTER**: Shows orange upgrade prompt
   - **PROFESSIONAL/SCHOOL/TRIAL**: Shows recent activity widget

### Analytics (Future)
When implemented, will show:
- Class performance metrics
- Student progress tracking
- Economic trends
- Available only in Professional/School/Trial

### Custom Branding (Future)
When implemented, will allow:
- Custom logo
- Custom colors
- Custom currency name/symbol
- Available only in Professional/School/Trial

## API Endpoints Needed (Future)

### Mutations
```graphql
mutation StartTrial {
  startTrial {
    user {
      id
      subscriptionTier
      subscriptionStatus
      trialEndsAt
    }
  }
}

mutation CreateCheckoutSession($tier: SubscriptionTier!) {
  createCheckoutSession(tier: $tier)
}

mutation CancelSubscription {
  cancelSubscription {
    user {
      id
      subscriptionTier
      subscriptionStatus
    }
  }
}
```

### Queries
```graphql
query CheckFeatureAccess($feature: String!) {
  checkFeatureAccess(feature: $feature) {
    allowed
    reason
  }
}

query CheckStudentLimit($classId: ID!) {
  checkStudentLimit(classId: $classId) {
    allowed
    current
    limit
    remaining
  }
}
```

## Next Steps

1. **Backend Implementation**
   - Add tier checks to GraphQL resolvers
   - Implement Stripe integration
   - Create webhook handlers
   - Add trial activation on signup

2. **Frontend Implementation**
   - Create pricing page
   - Add upgrade flow modals
   - Implement subscription management UI
   - Add more feature gates

3. **Testing**
   - Write integration tests
   - Test tier transitions
   - Test limit enforcement
   - Test payment flows

4. **Deployment**
   - Set up Stripe webhooks
   - Configure environment variables
   - Test in staging environment
   - Monitor trial conversions

---

**Last Updated**: October 24, 2025  
**Branch**: `feature/subscription-tiers`  
**Status**: ✅ Ready for testing
