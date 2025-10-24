# 💳 Stripe Test Mode Integration Guide

> Complete guide to testing subscription payments with Stripe Test Mode

**Last Updated:** October 24, 2025

---

## 🎯 Overview

This guide walks you through setting up and testing Stripe subscription payments in **Test Mode**. No real money will be charged - all payments are simulated.

### What You'll Get

✅ Complete subscription checkout flow  
✅ Stripe Customer Portal for managing subscriptions  
✅ Webhook handling for real-time updates  
✅ Test cards for different scenarios  
✅ GraphQL API for subscription management  

---

## 📋 Prerequisites

- Stripe account (free to sign up)
- ClassEcon Backend running locally
- Test account credentials (see [`TEST_ACCOUNTS.md`](TEST_ACCOUNTS.md))

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Stripe Test Keys

1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### Step 2: Create Subscription Products

1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Click **+ Add product** and create three products:

#### Product 1: Starter Plan
- **Name:** ClassEcon Starter
- **Description:** Perfect for individual teachers
- **Pricing:** $7/month (recurring)
- **Copy the Price ID** (starts with `price_`) → This is `STRIPE_PRICE_STARTER`

#### Product 2: Professional Plan  
- **Name:** ClassEcon Professional
- **Description:** For power users
- **Pricing:** $19/month (recurring)
- **Copy the Price ID** → This is `STRIPE_PRICE_PROFESSIONAL`

#### Product 3: School Plan
- **Name:** ClassEcon School
- **Description:** Enterprise solution
- **Pricing:** $49/month (recurring)
- **Copy the Price ID** → This is `STRIPE_PRICE_SCHOOL`

### Step 3: Create Founding Member Coupon

1. Go to [Coupons](https://dashboard.stripe.com/test/coupons)
2. Click **+ Create coupon**
3. Configure:
   - **ID:** `FOUNDING50`
   - **Type:** Percentage discount
   - **Discount:** 50%
   - **Duration:** Forever
   - **Applies to:** Specific products → Select "ClassEcon Professional"
4. Click **Create coupon**

### Step 4: Configure Environment Variables

Add to `Backend/.env`:

```bash
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Stripe Price IDs (from Step 2)
STRIPE_PRICE_STARTER=price_YOUR_STARTER_PRICE_ID
STRIPE_PRICE_PROFESSIONAL=price_YOUR_PRO_PRICE_ID
STRIPE_PRICE_SCHOOL=price_YOUR_SCHOOL_PRICE_ID

# Stripe Coupon ID
STRIPE_COUPON_FOUNDING=FOUNDING50

# Stripe Webhook Secret (will get this in Step 5)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### Step 5: Set Up Webhooks (Local Testing)

#### Option A: Using Stripe CLI (Recommended)

1. **Install Stripe CLI:**
   ```bash
   # Windows (with Scoop)
   scoop install stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost:**
   ```bash
   stripe listen --forward-to localhost:4000/webhooks/stripe
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`)  
   Add it to `.env` as `STRIPE_WEBHOOK_SECRET`

#### Option B: Using ngrok (Alternative)

1. **Install ngrok:** [https://ngrok.com/download](https://ngrok.com/download)

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 4000
   ```

3. **Add webhook in Stripe Dashboard:**
   - Go to [Webhooks](https://dashboard.stripe.com/test/webhooks)
   - Click **+ Add endpoint**
   - URL: `https://YOUR-NGROK-URL.ngrok.io/webhooks/stripe`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click **Add endpoint**
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Step 6: Update Backend Index

Add the Stripe webhook route to `Backend/src/index.ts`:

```typescript
import stripeWebhookRouter from './routes/stripe';

// ... existing code ...

// IMPORTANT: Add BEFORE body parsing middleware
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRouter);

// Then add regular body parsing
app.use(express.json());
```

### Step 7: Add GraphQL Schema Types

Add to `Backend/src/schema.ts`:

```graphql
type SubscriptionDetails {
  tier: String!
  status: String!
  expiresAt: DateTime
  trialEndsAt: DateTime
  isFoundingMember: Boolean!
  cancelAtPeriodEnd: Boolean!
  currentPeriodEnd: DateTime
}

type CheckoutSession {
  sessionId: String!
  url: String!
}

type PortalSession {
  url: String!
}

type SubscriptionResponse {
  success: Boolean!
  message: String!
}

type Invoice {
  amountDue: Float!
  currency: String!
  periodStart: DateTime!
  periodEnd: DateTime!
}

type PaymentMethod {
  id: String!
  brand: String
  last4: String
  expiryMonth: Int
  expiryYear: Int
}

extend type Query {
  mySubscription: SubscriptionDetails!
  upcomingInvoice: Invoice
  myPaymentMethods: [PaymentMethod!]!
}

extend type Mutation {
  createCheckoutSession(
    tier: String!
    isFoundingMember: Boolean
    successUrl: String!
    cancelUrl: String!
  ): CheckoutSession!
  
  createPortalSession(returnUrl: String!): PortalSession!
  cancelSubscription: SubscriptionResponse!
  reactivateSubscription: SubscriptionResponse!
  updateSubscriptionTier(tier: String!): SubscriptionResponse!
}
```

### Step 8: Register Resolvers

In your main resolver file, import and merge:

```typescript
import { stripeSubscriptionResolvers } from './resolvers/stripe-subscription';

// Merge with existing resolvers
const resolvers = mergeResolvers([
  // ... existing resolvers
  stripeSubscriptionResolvers,
]);
```

---

## 🧪 Testing the Integration

### Test Cards

Use these test card numbers in Stripe Checkout:

| Scenario | Card Number | CVC | Expiry |
|----------|-------------|-----|--------|
| ✅ Success | `4242 4242 4242 4242` | Any 3 digits | Any future date |
| ❌ Declined | `4000 0000 0000 0002` | Any 3 digits | Any future date |
| 🔐 3D Secure | `4000 0025 0000 3155` | Any 3 digits | Any future date |
| ⚠️ Insufficient Funds | `4000 0000 0000 9995` | Any 3 digits | Any future date |

### Test Flow

#### 1. Create Checkout Session

**GraphQL Mutation:**
```graphql
mutation {
  createCheckoutSession(
    tier: "PROFESSIONAL"
    isFoundingMember: false
    successUrl: "http://localhost:5173/subscription/success"
    cancelUrl: "http://localhost:5173/subscription/cancel"
  ) {
    sessionId
    url
  }
}
```

**Response:**
```json
{
  "data": {
    "createCheckoutSession": {
      "sessionId": "cs_test_abc123",
      "url": "https://checkout.stripe.com/c/pay/cs_test_abc123"
    }
  }
}
```

#### 2. Complete Checkout

1. Open the `url` from the response
2. Fill in:
   - **Email:** Any email address
   - **Card:** `4242 4242 4242 4242`
   - **Expiry:** Any future date
   - **CVC:** Any 3 digits
   - **Name:** Any name
3. Click **Subscribe**

#### 3. Verify Webhook Processing

Check your terminal running `stripe listen`:

```bash
2025-10-24 15:30:45   --> checkout.session.completed
2025-10-24 15:30:46   --> customer.subscription.created
2025-10-24 15:30:47   --> invoice.payment_succeeded
```

#### 4. Check User Subscription

**GraphQL Query:**
```graphql
query {
  mySubscription {
    tier
    status
    expiresAt
    isFoundingMember
    cancelAtPeriodEnd
    currentPeriodEnd
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "mySubscription": {
      "tier": "PROFESSIONAL",
      "status": "ACTIVE",
      "expiresAt": "2025-11-24T15:30:00.000Z",
      "isFoundingMember": false,
      "cancelAtPeriodEnd": false,
      "currentPeriodEnd": "2025-11-24T15:30:00.000Z"
    }
  }
}
```

---

## 🎯 Testing Specific Scenarios

### Test 1: Founding Member Discount

```graphql
mutation {
  createCheckoutSession(
    tier: "PROFESSIONAL"
    isFoundingMember: true  # <-- Founding member flag
    successUrl: "http://localhost:5173/subscription/success"
    cancelUrl: "http://localhost:5173/subscription/cancel"
  ) {
    url
  }
}
```

**Expected:** 50% discount applied at checkout ($19/mo → $9.50/mo)

### Test 2: Billing Portal

```graphql
mutation {
  createPortalSession(
    returnUrl: "http://localhost:5173/dashboard"
  ) {
    url
  }
}
```

**Actions Available:**
- Update payment method
- View invoices
- Cancel subscription
- Update subscription tier

### Test 3: Cancel Subscription

```graphql
mutation {
  cancelSubscription {
    success
    message
  }
}
```

**Expected:** Subscription stays active until period end, then downgrades to FREE

### Test 4: Reactivate Subscription

```graphql
mutation {
  reactivateSubscription {
    success
    message
  }
}
```

**Expected:** Cancellation removed, subscription continues

### Test 5: Upgrade/Downgrade Tier

```graphql
mutation {
  updateSubscriptionTier(tier: "SCHOOL") {
    success
    message
  }
}
```

**Expected:** Prorated charge/refund, tier updated immediately

---

## 🔍 Monitoring & Debugging

### View Stripe Dashboard

- **Payments:** [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
- **Subscriptions:** [https://dashboard.stripe.com/test/subscriptions](https://dashboard.stripe.com/test/subscriptions)
- **Customers:** [https://dashboard.stripe.com/test/customers](https://dashboard.stripe.com/test/customers)
- **Events & Logs:** [https://dashboard.stripe.com/test/events](https://dashboard.stripe.com/test/events)

### Check Webhook Logs

```bash
# In Stripe CLI terminal
stripe listen --print-json
```

### Backend Logs

Look for:
```
✅ Checkout session completed: cs_test_abc123
✅ Subscription created: sub_abc123
✅ Updated user 507f1f77bcf86cd799439011 subscription to PROFESSIONAL tier
```

---

## 🚨 Common Issues

### Issue: "No such price: price_..."

**Solution:** Make sure you copied the correct Price ID from Stripe Dashboard → Products

### Issue: Webhook signature verification failed

**Solution:** 
1. Make sure `STRIPE_WEBHOOK_SECRET` matches the signing secret
2. For Stripe CLI: Use the `whsec_` value from `stripe listen` output
3. For ngrok: Copy from Stripe Dashboard → Webhooks → your endpoint

### Issue: User subscription not updated after checkout

**Solution:**
1. Check webhook logs for errors
2. Verify `userId` is in session metadata
3. Check Backend logs for webhook processing

### Issue: "This API call cannot be made with a publishable API key"

**Solution:** Use `STRIPE_SECRET_KEY` (starts with `sk_test_`), not publishable key

---

## 📚 Frontend Integration

### Add Stripe.js to Frontend

```bash
cd Frontend
pnpm add @stripe/stripe-js
```

### Create Checkout Button Component

```typescript
import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from '@apollo/client';
import { CREATE_CHECKOUT_SESSION } from './mutations';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function SubscribeButton({ tier }: { tier: string }) {
  const [createCheckout] = useMutation(CREATE_CHECKOUT_SESSION);

  const handleSubscribe = async () => {
    const { data } = await createCheckout({
      variables: {
        tier,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancel`,
      },
    });

    // Redirect to Stripe Checkout
    window.location.href = data.createCheckoutSession.url;
  };

  return (
    <button onClick={handleSubscribe}>
      Subscribe to {tier}
    </button>
  );
}
```

### Add to Frontend `.env`

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
```

---

## ✅ Testing Checklist

- [ ] Stripe account created and in Test Mode
- [ ] All 3 subscription products created
- [ ] Founding member coupon created (FOUNDING50)
- [ ] Environment variables configured
- [ ] Stripe CLI installed and running (`stripe listen`)
- [ ] Webhook route added to Backend
- [ ] GraphQL schema updated with subscription types
- [ ] Resolvers registered
- [ ] Backend restarted
- [ ] Test checkout with success card (4242...)
- [ ] Webhook events received and processed
- [ ] User subscription updated in database
- [ ] Billing portal accessible
- [ ] Cancel/reactivate works
- [ ] Founding member discount applied correctly

---

## 🎓 Next Steps

Once testing is complete:

1. **Add Frontend UI:**
   - Subscription tier selection page
   - Billing portal link
   - Subscription status display

2. **Implement Feature Gates:**
   - Check subscription status before premium features
   - Show upgrade prompts to free users

3. **Add Email Notifications:**
   - Payment confirmation
   - Subscription renewal reminder
   - Payment failed alert

4. **Production Preparation:**
   - Switch to live Stripe keys
   - Create production products and prices
   - Update webhook endpoint to production URL

---

## 📖 Additional Resources

- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

---

## 💡 Pro Tips

1. **Use Stripe CLI for local development** - It's much easier than ngrok
2. **Test failed payments** - Use card `4000 0000 0000 0002` to simulate declines
3. **Check webhook logs** - Most issues are webhook-related
4. **Test all subscription states** - Active, trial, cancelled, past_due
5. **Verify proration** - Upgrade/downgrade should calculate correct amounts
6. **Test founding member flow** - Ensure 50% discount applies correctly

---

**Questions?** Check the [Stripe Dashboard Events](https://dashboard.stripe.com/test/events) for detailed logs of every API call.

**Happy testing! 💳**
