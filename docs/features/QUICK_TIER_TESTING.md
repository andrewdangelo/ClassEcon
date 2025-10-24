# Quick Tier Testing Setup

## For Immediate Testing (No Backend Changes)

### 1. Start the Application
```bash
# Terminal 1: Start Backend
cd Backend
pnpm dev

# Terminal 2: Start Frontend  
cd Frontend
pnpm dev
```

### 2. Log In with Demo Account
```
Email: teacher+carter@demo.school
Password: [your password]
```

### 3. Open Testing Page
Navigate to: **http://localhost:5173/dev/tier-testing**

### 4. Test Feature Gates

#### Test Scenario 1: FREE User Sees Upgrade Prompts
1. Click "Free" button in testing panel
2. Navigate to `/` (dashboard)
3. If you're a student, you'll see upgrade prompts for:
   - Balance History Chart
   - Activity Tracking Widget

#### Test Scenario 2: TRIAL User Sees Everything
1. Click "Trial" button in testing panel
2. Navigate to `/` (dashboard)
3. All premium features visible
4. Trial banner shows "14 days left"

#### Test Scenario 3: PROFESSIONAL User
1. Click "Professional" button in testing panel
2. All advanced features unlocked
3. Tier badge shows "Professional"

### 5. Test on Different Dashboards

#### As Teacher
- Dashboard shows tier badge in header
- Can see class limit warnings
- Create class button checks limits

#### As Student  
- Dashboard shows/hides premium widgets based on tier
- Balance chart only visible in Pro/Trial
- Activity widget only visible in Pro/Trial

## Setting Tier in Database (For Persistent Testing)

If you want to set a tier that persists across page refreshes:

### Using MongoDB Compass or CLI

```javascript
// Connect to your MongoDB
// Find your user
db.users.findOne({ email: "teacher+carter@demo.school" })

// Update to TRIAL tier
db.users.updateOne(
  { email: "teacher+carter@demo.school" },
  {
    $set: {
      subscriptionTier: "TRIAL",
      subscriptionStatus: "TRIAL",
      trialStartedAt: new Date(),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      isFoundingMember: false
    }
  }
)

// Update to PROFESSIONAL tier (Founding Member)
db.users.updateOne(
  { email: "teacher+carter@demo.school" },
  {
    $set: {
      subscriptionTier: "PROFESSIONAL",
      subscriptionStatus: "ACTIVE",
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isFoundingMember: true,
      trialStartedAt: null,
      trialEndsAt: null
    }
  }
)

// Reset to FREE
db.users.updateOne(
  { email: "teacher+carter@demo.school" },
  {
    $set: {
      subscriptionTier: "FREE",
      subscriptionStatus: "ACTIVE",
      subscriptionExpiresAt: null,
      trialStartedAt: null,
      trialEndsAt: null,
      isFoundingMember: false
    }
  }
)
```

### Using GraphQL (When Mutations Are Added)

```graphql
# Start trial
mutation {
  startTrial {
    id
    subscriptionTier
    subscriptionStatus
    trialEndsAt
  }
}

# Upgrade to Professional
mutation {
  updateSubscription(tier: PROFESSIONAL) {
    id
    subscriptionTier
    subscriptionStatus
  }
}
```

## Feature Gate Test Checklist

### Student Dashboard
- [ ] **FREE tier**: Both premium widgets show upgrade prompts
- [ ] **TRIAL tier**: Both premium widgets visible and working
- [ ] **STARTER tier**: Both premium widgets show upgrade prompts  
- [ ] **PROFESSIONAL tier**: Both premium widgets visible and working
- [ ] **SCHOOL tier**: Both premium widgets visible and working

### Teacher Dashboard
- [ ] **FREE tier**: Tier badge shows "Free"
- [ ] **TRIAL tier**: Trial banner appears with countdown
- [ ] **PROFESSIONAL tier**: Tier badge shows "Professional"
- [ ] All tiers: Badge color matches tier (gray/purple/blue/green/amber)

### Limits Testing
- [ ] Student count approaches limit → Warning appears at 80%
- [ ] Student count at limit → Block message appears
- [ ] Class count at limit → Warning/block appears
- [ ] Unlimited tiers show "∞" symbol

## Troubleshooting

### Feature gates not working?
1. Check Redux DevTools - is user.subscriptionTier set?
2. Check console for errors in useSubscriptionTier hook
3. Verify FeatureGate component is imported correctly
4. Check that feature name matches exactly (case-sensitive)

### Testing panel not changing tier?
1. Open Redux DevTools
2. Check if auth.user is being updated
3. Verify localStorage has accessToken
4. Check browser console for dispatch errors

### Changes reset on refresh?
This is expected! The testing panel only updates Redux (in-memory).
To persist changes, update the database directly (see above).

## Quick Test Commands

### Test All Tiers in Sequence
1. FREE → Check restrictions work
2. TRIAL → Check everything unlocks
3. STARTER → Check partial access
4. PROFESSIONAL → Check advanced features
5. SCHOOL → Check full access

### Test Special Scenarios
1. Founding member pricing displays
2. Trial expiring soon (1 day)
3. Expired subscription downgrade
4. Canceled subscription behavior

## Expected Behavior Summary

| Tier | Students | Classes | Balance Chart | Activity Widget | Analytics |
|------|----------|---------|---------------|-----------------|-----------|
| FREE | 10 | 1 | ❌ | ❌ | ❌ |
| TRIAL | ∞ | ∞ | ✅ | ✅ | ✅ |
| STARTER | 30 | 1 | ❌ | ❌ | ❌ |
| PROFESSIONAL | ∞ | 3 | ✅ | ✅ | ✅ |
| SCHOOL | ∞ | ∞ | ✅ | ✅ | ✅ |

---

**Ready to test!** Navigate to `/dev/tier-testing` and start switching tiers.
