# Subscription Webhook Issue - Root Cause Analysis

## Problem
Stripe subscription purchases were not reflecting in the user's account on the frontend. The user's tier remained "FREE" even after successful payment.

## Root Cause
The subscription data flow was broken at multiple points:

### 1. User Account Missing
- The teacher+carter@demo.school user existed in Stripe but **not in the Backend database**
- Stripe webhooks attempt to update the user via PaymentService → Backend internal API
- Backend's `/api/internal/subscription-update` endpoint cannot update a non-existent user

### 2. Webhook Delivery Issue (Development Environment)
- Stripe webhooks cannot reach localhost in development without:
  - Stripe CLI (`stripe listen --forward-to localhost:4003/webhooks/stripe`)
  - Ngrok or similar tunneling service
- This means subscriptions purchased in development won't trigger automatic updates

### 3. Missing Environment Variables
- `BACKEND_API_KEY` was not set in PaymentService `.env`
- However, Backend's internal API allows requests in development mode when no key is configured

## Immediate Fix Applied
Created a manual sync script to pull subscription data from Stripe and update the user:

```bash
cd Backend
npx tsx scripts/sync-stripe-subscription.ts
```

This script:
1. Finds the user by email
2. Fetches their Stripe customer and subscription data
3. Extracts subscription details (tier, status, dates)
4. Updates the user's subscription fields in MongoDB

## Verified Working
User `teacher+carter@demo.school` now shows:
- ✅ Tier: PROFESSIONAL
- ✅ Status: ACTIVE  
- ✅ Stripe Customer ID: cus_Tuy6ALBUSwZVo6
- ✅ Stripe Subscription ID: sub_1Sx8MGDkLTTCCw3OeWvIrsVo
- ✅ Expires At: Wed Mar 04 2026

## Production Deployment Checklist

### For Webhooks to Work Automatically:
1. **Configure Stripe Webhook Endpoint**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-production-domain.com/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret

2. **Update PaymentService Environment**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
   BACKEND_URL=https://your-backend-url.com
   BACKEND_API_KEY=your-secure-api-key
   ```

3. **Update Backend Environment**
   ```env
   INTERNAL_API_KEY=your-secure-api-key  # Must match PaymentService's BACKEND_API_KEY
   ```

4. **Ensure User Exists Before Checkout**
   - Users must be created via signup/registration before purchasing
   - The checkout session includes `userId` in metadata
   - Webhooks use this `userId` to update the correct user

## Development Workflow

### Option 1: Stripe CLI (Recommended)
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local PaymentService
stripe listen --forward-to localhost:4003/webhooks/stripe

# Use the webhook secret from CLI output
# Update PaymentService/.env with: STRIPE_WEBHOOK_SECRET=whsec_...
```

### Option 2: Manual Sync Script
When testing without webhook forwarding:
```bash
cd Backend
npx tsx scripts/sync-stripe-subscription.ts
```

## Data Flow (Production)
```
User Purchases Subscription
    ↓
Stripe Checkout Completed
    ↓
Stripe sends webhook → PaymentService (/webhooks/stripe)
    ↓
PaymentService processes webhook
    ↓
PaymentService calls Backend (/api/internal/subscription-update)
    ↓
Backend updates User model in MongoDB
    ↓
Frontend queries mySubscription → shows updated tier
```

## Testing Checklist
- [ ] User account exists in Backend database
- [ ] Stripe webhook endpoint configured (production)
- [ ] Stripe CLI forwarding webhooks (development)
- [ ] STRIPE_WEBHOOK_SECRET set correctly
- [ ] BACKEND_API_KEY matches INTERNAL_API_KEY
- [ ] Test purchase completes successfully
- [ ] Frontend shows updated subscription immediately
- [ ] Admin dashboard reflects new subscription stats

## Files Modified
- `Backend/scripts/sync-stripe-subscription.ts` - Manual sync script (created)
- `Backend/scripts/check-user.ts` - User verification script (created)
- `PaymentService/.env` - Added BACKEND_API_KEY placeholder
