# EmailService

A production-grade email microservice with GraphQL API, Resend integration, MongoDB persistence, and background worker processing.

## Features

- **Transactional Emails**: 2FA OTP codes, password reset links
- **Bulk Email Campaigns**: Draft, queue, send, and track campaigns
- **Subscriber Management**: Lists with subscribe/unsubscribe/suppression
- **Background Worker**: Atomic job claiming, retry with exponential backoff
- **Webhook Handling**: Resend bounce/complaint/delivery events
- **Rate Limiting**: Per-email, per-user, per-IP rate limiting
- **Token Management**: Secure OTP/reset tokens with Argon2 hashing
- **Railway-Ready**: Dockerfile and railway.toml included

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   GraphQL API   │     │     Worker      │     │    Webhooks     │
│   (Port 4000)   │     │   (Background)  │     │  (POST /hooks)  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────┬───────┴───────────────────────┘
                         │
                  ┌──────▼──────┐
                  │   MongoDB   │
                  │ email_svc   │
                  └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │   Resend    │
                  │    API      │
                  └─────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB (local or Atlas)
- Resend account (free tier works)

### Local Development

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Start MongoDB (if local)
docker run -d -p 27017:27017 mongo:7

# Start the API server
pnpm dev

# In another terminal, start the worker
pnpm worker:dev

# GraphQL Playground available at http://localhost:4000/graphql
```

### Production Build

```bash
pnpm build
pnpm start          # API server
pnpm worker         # Worker process
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | API server port (default: 4000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB_NAME` | No | Database name (default: email_service) |
| `RESEND_API_KEY` | Yes | Resend API key |
| `FROM_EMAIL` | Yes | Sender email address |
| `APP_URL` | Yes | Frontend application URL |
| `ADMIN_TOKEN` | Yes | Admin authentication token (32+ chars) |
| `SERVICE_TOKEN` | Yes | Service-to-service auth token (32+ chars) |
| `WEBHOOK_SECRET` | Yes | Resend webhook secret (16+ chars) |

See [.env.example](.env.example) for all options.

## Authentication

All GraphQL mutations require authentication via headers:

- **Admin access**: `x-admin-token: <ADMIN_TOKEN>`
- **Service access**: `x-service-token: <SERVICE_TOKEN>`

```graphql
# Example request headers
{
  "x-service-token": "your-service-token"
}
```

## GraphQL API

### Transactional Emails

```graphql
# Send 2FA OTP code
mutation Send2FA {
  sendTwoFactorCode(email: "user@example.com", userId: "user123") {
    success
    message
    expiresAt
    cooldownSeconds
  }
}

# Verify OTP code
mutation Verify2FA {
  verifyTwoFactorCode(email: "user@example.com", userId: "user123", code: "123456") {
    success
    message
    attemptsRemaining
  }
}

# Send password reset email
mutation SendReset {
  sendPasswordReset(email: "user@example.com", userId: "user123") {
    success
    message
    expiresAt
  }
}

# Verify reset token
mutation VerifyReset {
  verifyPasswordResetToken(token: "abc123...") {
    success
    message
    userId
    email
  }
}

# Consume reset token (after password update)
mutation ConsumeReset {
  consumePasswordResetToken(token: "abc123...") {
    success
    message
  }
}
```

### Subscriber Management

```graphql
# Add subscriber
mutation Subscribe {
  subscribe(email: "user@example.com", name: "John Doe", metadata: {source: "landing-page"}) {
    id
    email
    status
  }
}

# Unsubscribe
mutation Unsubscribe {
  unsubscribe(email: "user@example.com", token: "hmac-token")
}

# List subscribers
query ListSubscribers {
  subscribers(limit: 100, status: SUBSCRIBED) {
    edges {
      id
      email
      name
      status
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

### Campaigns

```graphql
# Create campaign
mutation CreateCampaign {
  createCampaign(input: {
    name: "Weekly Newsletter"
    subject: "This Week's Updates"
    bodyHtml: "<h1>Hello {{name}}!</h1>"
    bodyText: "Hello {{name}}!"
  }) {
    id
    name
    status
  }
}

# Update campaign
mutation UpdateCampaign {
  updateCampaign(id: "campaign123", input: {
    subject: "Updated Subject"
  }) {
    id
    subject
    updatedAt
  }
}

# Schedule or send campaign
mutation QueueCampaign {
  queueCampaign(id: "campaign123", scheduledAt: "2024-01-15T10:00:00Z") {
    id
    status
    scheduledAt
  }
}

# Get campaign stats
query CampaignStats {
  campaign(id: "campaign123") {
    id
    name
    status
    stats {
      total
      pending
      sent
      delivered
      bounced
      complained
      failed
    }
  }
}
```

## Worker Process

The worker runs as a separate process and handles:

- **Job claiming**: Atomic `findOneAndUpdate` to prevent duplicates
- **Retry logic**: Exponential backoff (1m, 5m, 15m, 1h, etc.)
- **Rate limiting**: Configurable sends per second
- **Stale recovery**: Reclaims jobs locked for 10+ minutes

```bash
# Run worker
pnpm worker

# Configuration
WORKER_CONCURRENCY=5          # Parallel jobs
WORKER_SENDS_PER_SECOND=10    # Rate limit
WORKER_MAX_ATTEMPTS=5         # Max retries
WORKER_POLL_INTERVAL_MS=1000  # Poll frequency
```

## Webhooks

Configure Resend webhooks to point to:

```
POST https://your-domain.com/webhooks/resend
```

**Events handled:**
- `email.delivered` - Updates job status
- `email.bounced` - Suppresses subscriber
- `email.complained` - Suppresses subscriber
- `email.delivery_delayed` - Logs warning

Webhook signature verification uses `WEBHOOK_SECRET`.

## Railway Deployment

### 1. Create Railway Project

```bash
railway login
railway init
```

### 2. Add MongoDB Plugin

In Railway dashboard, add MongoDB plugin or use external MongoDB Atlas.

### 3. Set Environment Variables

```bash
railway variables set PORT=4000
railway variables set MONGODB_URI=mongodb://...
railway variables set RESEND_API_KEY=re_...
# ... set all required variables
```

### 4. Deploy API

```bash
cd EmailService
railway up
```

### 5. Deploy Worker

Create a second Railway service for the worker:

1. In Railway dashboard, click "New Service" → "Docker"
2. Point to same repo/EmailService directory
3. Set **Start Command** override: `pnpm worker`
4. Set same environment variables

### Railway Configuration

The included [railway.toml](railway.toml) configures:

- Build command: `pnpm install && pnpm build`
- Start command: `pnpm start`
- Health check: `GET /health`
- Auto-restart on failure

## Database Indexes

MongoDB indexes are created automatically on startup:

```javascript
// Subscribers
{ email: 1 }              // unique

// Campaigns  
{ status: 1, createdAt: -1 }

// DeliveryJobs
{ status: 1, scheduledAt: 1 }  // compound for worker queries
{ subscriberId: 1 }
{ campaignId: 1 }
{ resendMessageId: 1 }

// AuthTokens
{ expiresAt: 1 }          // TTL - auto-deletes expired tokens

// RateLimits
{ resetAt: 1 }            // TTL - auto-cleanup
```

## Security

- **Tokens**: Never stored raw - hashed with Argon2
- **Rate limiting**: Per-email, per-user, per-IP limits
- **Lockout**: 3 failed OTP attempts locks for 15 minutes
- **HMAC unsubscribe**: Cryptographically signed unsubscribe links
- **Webhook verification**: Resend signature validation
- **Input validation**: Zod schemas on all inputs

## Monitoring

### Health Check

```bash
curl http://localhost:4000/health
# {"status":"ok","timestamp":"2024-..."}
```

### Logs

Uses Pino for structured JSON logging:

```json
{"level":30,"time":1705123456789,"component":"worker","msg":"Job completed","jobId":"...","took":234}
```

## Integration with Backend

In your main Backend service, call EmailService via GraphQL:

```typescript
import { GraphQLClient } from 'graphql-request';

const emailService = new GraphQLClient(process.env.EMAIL_SERVICE_URL + '/graphql', {
  headers: {
    'x-service-token': process.env.EMAIL_SERVICE_TOKEN,
  },
});

// Send 2FA code
const result = await emailService.request(`
  mutation($email: String!, $userId: String!) {
    sendTwoFactorCode(email: $email, userId: $userId) {
      success
      message
      expiresAt
    }
  }
`, { email: user.email, userId: user.id });
```

## Development

```bash
# Type checking
pnpm typecheck

# Build
pnpm build

# Clean build
rm -rf dist && pnpm build
```

## License

MIT
