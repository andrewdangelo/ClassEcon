# Auth Microservice Refactor - Migration Guide

This document explains the refactoring of authentication into a separate microservice.

## 📋 Overview

The authentication system has been extracted from the Backend into a dedicated **Auth Service** microservice running on port 4001.

## 🏗️ Architecture Changes

### Before (Monolithic)
```
Backend (Port 4000)
├── GraphQL API
├── Database (MongoDB)
└── Auth Logic (JWT, bcrypt)
```

### After (Microservices)
```
Auth Service (Port 4001)          Backend (Port 4000)
├── JWT Operations                ├── GraphQL API
├── Password Hashing              ├── Database (MongoDB)
└── Token Verification            └── Auth Client (calls Auth Service)
```

## 🚀 Setup Instructions

### 1. Setup Auth Service

```bash
cd AuthService
pnpm install
cp .env.example .env
```

Edit `AuthService/.env`:
```env
PORT=4001
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=<generate-secure-32-byte-key>
REFRESH_JWT_SECRET=<generate-secure-32-byte-key>
SERVICE_API_KEY=<generate-secure-api-key>
```

### 2. Update Backend Environment

Add to `Backend/.env`:
```env
AUTH_SERVICE_URL=http://localhost:4001
SERVICE_API_KEY=<same-as-auth-service>
```

**Important**: The `SERVICE_API_KEY` must be identical in both services!

### 3. Generate Secure Keys

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Service API Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start Services

Terminal 1 - Auth Service:
```bash
cd AuthService
pnpm dev
```

Terminal 2 - Backend:
```bash
cd Backend
pnpm dev
```

Terminal 3 - Frontend:
```bash
cd Frontend
pnpm dev
```

## 🔄 What Changed

### Backend Changes

1. **Removed Direct Auth Functions**: `auth.ts` functions no longer used directly
2. **Added Auth Client**: New `services/auth-client.ts` communicates with Auth Service
3. **Updated Resolvers**: `Mutation.ts` now uses `authClient` methods
4. **Updated Context**: `index.ts` context creation uses `authClient`

### New Auth Service

- **Standalone Express server** on port 4001
- **Protected endpoints** with API key authentication
- **Stateless design** - no database dependency
- **RESTful API** for auth operations

## 📡 API Communication

The Backend communicates with Auth Service using HTTP requests:

```typescript
// Example: Backend signing tokens
const tokens = await authClient.signTokens(userId, role, res);
// Makes POST request to http://localhost:4001/sign-tokens
```

## 🔐 Security Model

### Service-to-Service (Backend ↔ Auth Service)
- Protected with `SERVICE_API_KEY` header
- Only Backend can call protected endpoints

### Frontend ↔ Backend
- Same as before: JWT Bearer tokens
- Refresh tokens via HTTP-only cookies

## ✅ Testing the Migration

### 1. Test Auth Service Health
```bash
curl http://localhost:4001/health
```

Expected: `{"status":"ok","service":"auth-service"}`

### 2. Test User Login (via Backend GraphQL)

```graphql
mutation {
  login(email: "test@example.com", password: "password") {
    user {
      id
      email
    }
    accessToken
  }
}
```

### 3. Test Token Refresh

```graphql
mutation {
  refreshAccessToken
}
```

## 🐛 Troubleshooting

### Issue: "Unauthorized: Invalid API key"
- Ensure `SERVICE_API_KEY` matches in both `.env` files
- Check Auth Service is running on port 4001

### Issue: "Auth service error: ECONNREFUSED"
- Auth Service is not running
- Check `AUTH_SERVICE_URL` in Backend `.env`

### Issue: "Cannot find module 'jsonwebtoken'"
- Run `pnpm install` in AuthService directory

### Issue: Refresh token not working
- Check cookie settings (domain, path)
- Ensure CORS credentials are enabled

## 🚢 Production Considerations

1. **Environment Variables**: Use secure vault for production secrets
2. **Network Isolation**: Run Auth Service in private network
3. **HTTPS**: Enable secure cookies (`secure: true`)
4. **Service Discovery**: Use service mesh or DNS for service URLs
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **Monitoring**: Add health checks and metrics
7. **Scaling**: Auth Service is stateless and can be horizontally scaled

## 📦 Deployment Options

### Option 1: Docker Compose
```yaml
services:
  auth-service:
    build: ./AuthService
    ports:
      - "4001:4001"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - SERVICE_API_KEY=${SERVICE_API_KEY}
  
  backend:
    build: ./Backend
    ports:
      - "4000:4000"
    environment:
      - AUTH_SERVICE_URL=http://auth-service:4001
      - SERVICE_API_KEY=${SERVICE_API_KEY}
```

### Option 2: Kubernetes
- Deploy as separate deployments
- Use Service for internal communication
- Use ConfigMaps/Secrets for environment variables

### Option 3: Serverless
- Deploy Auth Service as AWS Lambda / Azure Functions
- Use API Gateway for routing
- Backend calls Auth Service via HTTP

## 🔄 Rollback Plan

If issues arise, you can quickly rollback:

1. Stop Auth Service
2. Restore `Backend/src/auth.ts` to direct implementation
3. Revert changes to `Backend/src/index.ts` and `Backend/src/resolvers/Mutation.ts`
4. Restart Backend

## 📈 Benefits

✅ **Separation of Concerns**: Auth logic isolated from business logic
✅ **Scalability**: Auth Service can scale independently
✅ **Security**: Centralized auth management
✅ **Reusability**: Multiple services can use same Auth Service
✅ **Testing**: Easier to test auth logic in isolation

## 🎯 Next Steps

- [ ] Add rate limiting to Auth Service
- [ ] Add monitoring and logging
- [ ] Set up CI/CD for Auth Service
- [ ] Consider adding OAuth2 support
- [ ] Add audit logging for auth events
