# Payment Service

Payment microservice for ClassEcon - handles Stripe subscription management.

## Features

- Subscription checkout and billing portal
- Webhook processing for subscription lifecycle
- Admin APIs for customer support
- Invoice and payment history
- Refunds and credits

## Environment Variables

```env
# Server
PORT=4002
NODE_ENV=development
BILLING_MODE=stripe # stripe | mock

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5175

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Price IDs
STRIPE_PRICE_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_STARTER_YEARLY=price_xxx
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxx
STRIPE_PRICE_PROFESSIONAL_YEARLY=price_xxx
STRIPE_PRICE_SCHOOL_MONTHLY=price_xxx
STRIPE_PRICE_SCHOOL_YEARLY=price_xxx

# Coupons
STRIPE_COUPON_FOUNDING=FOUNDING50

# Database
DATABASE_URL=mongodb://localhost:27017/classecon-payments

# Backend service
BACKEND_URL=http://localhost:4000
BACKEND_API_KEY=xxx

# Frontend URLs
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5175

# JWT (for token validation)
JWT_SECRET=xxx
```

## API Endpoints

### Public
- `GET /health` - Health check
- `GET /` - Service info

### Payments (`/api/payments`)
- `GET /plans` - Get available subscription plans
- `POST /checkout` - Create checkout session (auth required)
- `POST /portal` - Create billing portal session (auth required)
- `GET /subscription` - Get current subscription (auth required)
- `POST /cancel` - Cancel subscription (auth required)
- `POST /reactivate` - Reactivate subscription (auth required)
- `POST /change-tier` - Change subscription tier (auth required)
- `GET /invoices` - Get invoice history (auth required)
- `GET /payment-methods` - Get payment methods (auth required)
- `GET /upcoming-invoice` - Get upcoming invoice (auth required)

### Webhooks (`/webhooks`)
- `POST /stripe` - Stripe webhook endpoint

### Admin (`/api/admin`) - Admin only
- `GET /subscriptions` - List all subscriptions
- `GET /subscriptions/:userId` - Get user subscription
- `POST /subscriptions/:userId/update` - Update subscription
- `POST /subscriptions/:userId/cancel` - Cancel subscription
- `POST /refund` - Issue refund
- `POST /credit` - Apply credit
- `GET /invoices/:userId` - Get user invoices
- `GET /events` - Get webhook events
- `GET /stats` - Get subscription statistics

## Development

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

### Mock billing mode (for deterministic E2E)

Set `BILLING_MODE=mock` to bypass live Stripe calls. In this mode, checkout/portal/subscription
endpoints return stable simulated responses suitable for CI and local end-to-end testing.

## Stripe Test Cards

- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## Webhook Testing

Use Stripe CLI to forward webhooks locally:

```bash
stripe listen --forward-to localhost:4002/webhooks/stripe
```
