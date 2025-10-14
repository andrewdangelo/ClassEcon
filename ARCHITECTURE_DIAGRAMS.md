# ClassEcon Authentication Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            ClassEcon Platform                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐        ┌──────────────┐        ┌──────────────┐       │
│  │  Frontend   │───────▶│   Backend    │───────▶│ Auth Service │       │
│  │  (React)    │◀───────│  (GraphQL)   │◀───────│  (Express)   │       │
│  │  Port 5173  │        │  Port 4000   │        │  Port 4001   │       │
│  └─────────────┘        └──────────────┘        └──────────────┘       │
│         │                       │                        │               │
│         │                       │                        │               │
│         ▼                       ▼                        ▼               │
│  ┌─────────────┐        ┌──────────────┐        ┌──────────────┐       │
│  │  ModernAuth │        │   MongoDB    │        │ JWT Tokens   │       │
│  │  Component  │        │  Database    │        │   bcrypt     │       │
│  └─────────────┘        └──────────────┘        └──────────────┘       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

External OAuth Providers:
┌──────────────┐                  ┌──────────────┐
│    Google    │                  │  Microsoft   │
│   OAuth 2.0  │                  │   OAuth 2.0  │
└──────────────┘                  └──────────────┘
```

---

## Authentication Flows

### 1. Traditional Email/Password Login

```
┌────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ User   │         │ Frontend │         │ Backend  │         │   Auth   │
│        │         │          │         │          │         │ Service  │
└───┬────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
    │                   │                    │                     │
    │ Enter email/pass  │                    │                     │
    ├──────────────────▶│                    │                     │
    │                   │                    │                     │
    │                   │ login(email, pwd)  │                     │
    │                   ├───────────────────▶│                     │
    │                   │                    │                     │
    │                   │                    │ verifyPassword()    │
    │                   │                    ├────────────────────▶│
    │                   │                    │                     │
    │                   │                    │ {isValid: true}     │
    │                   │                    │◀────────────────────┤
    │                   │                    │                     │
    │                   │                    │ signTokens()        │
    │                   │                    ├────────────────────▶│
    │                   │                    │                     │
    │                   │                    │ {access, refresh}   │
    │                   │                    │◀────────────────────┤
    │                   │                    │                     │
    │                   │ {user, accessToken}│                     │
    │                   │◀───────────────────┤                     │
    │                   │                    │                     │
    │  Login Success    │                    │                     │
    │◀──────────────────┤                    │                     │
    │                   │                    │                     │
    │  Redirect to /    │                    │                     │
    │◀──────────────────┤                    │                     │
    │                   │                    │                     │
```

### 2. OAuth Sign-In (Google/Microsoft)

```
┌────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ User   │    │ Frontend │    │ Provider │    │ Backend  │    │   Auth   │
│        │    │          │    │  (OAuth) │    │          │    │ Service  │
└───┬────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
    │              │               │               │               │
    │ Click OAuth  │               │               │               │
    ├─────────────▶│               │               │               │
    │              │               │               │               │
    │              │ Redirect to   │               │               │
    │              │ OAuth consent │               │               │
    │              ├──────────────▶│               │               │
    │              │               │               │               │
    │  Login with  │               │               │               │
    │  Provider    │               │               │               │
    ├──────────────┼──────────────▶│               │               │
    │              │               │               │               │
    │              │ Grant perms   │               │               │
    ├──────────────┼──────────────▶│               │               │
    │              │               │               │               │
    │              │ Redirect with │               │               │
    │              │ auth code     │               │               │
    │              │◀──────────────┤               │               │
    │              │               │               │               │
    │              │ oauthLogin(   │               │               │
    │              │   provider,   │               │               │
    │              │   code)       │               │               │
    │              ├──────────────────────────────▶│               │
    │              │               │               │               │
    │              │               │               │ POST /oauth/  │
    │              │               │               │ {provider}    │
    │              │               │               ├──────────────▶│
    │              │               │               │               │
    │              │               │               │               │ Exchange
    │              │               │               │               │ code for
    │              │               │               │ GET user info │ token
    │              │               │               │◀──────────────┤
    │              │               │◀──────────────┼───────────────┤
    │              │               │               │               │
    │              │               │ User info     │               │
    │              │               ├──────────────▶│               │
    │              │               │               │               │
    │              │               │  Create/Find  │               │
    │              │               │  User in DB   │               │
    │              │               │               │               │
    │              │               │               │ signTokens()  │
    │              │               │               ├──────────────▶│
    │              │               │               │               │
    │              │               │               │ JWT tokens    │
    │              │               │               │◀──────────────┤
    │              │               │               │               │
    │              │ {user, token} │               │               │
    │              │◀──────────────────────────────┤               │
    │              │               │               │               │
    │  Login Success & Redirect    │               │               │
    │◀─────────────┤               │               │               │
    │              │               │               │               │
```

---

## Component Architecture

### Frontend Components

```
┌─────────────────────────────────────────────────┐
│                  main.tsx                        │
│  ┌───────────────────────────────────────────┐  │
│  │         React Router Routes              │  │
│  │                                           │  │
│  │  /auth ──────────▶ ModernAuth            │  │
│  │  /auth/callback/google ──▶ OAuthCallback │  │
│  │  /auth/callback/microsoft ▶ OAuthCallback│  │
│  │  / ──────────────▶ Dashboard (Protected) │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

ModernAuth Component Structure:
┌──────────────────────────────────────────┐
│           ModernAuth.tsx                 │
│  ┌────────────────────────────────────┐  │
│  │   Tabs (Login / Signup)            │  │
│  │  ┌──────────────┬──────────────┐  │  │
│  │  │   Login      │   Signup     │  │  │
│  │  │              │              │  │  │
│  │  │ • Email      │ • Name       │  │  │
│  │  │ • Password   │ • Email      │  │  │
│  │  │ • 👁 Toggle  │ • Password   │  │  │
│  │  │              │ • 👁 Toggle  │  │  │
│  │  │              │ • Role       │  │  │
│  │  │              │ • Join Code  │  │  │
│  │  │              │              │  │  │
│  │  │ [LoginBtn]   │ [Sign Up]    │  │  │
│  │  └──────────────┴──────────────┘  │  │
│  │                                    │  │
│  │  ┌──────────────────────────────┐ │  │
│  │  │   OAuth Providers            │ │  │
│  │  │  [🔵 Google]  [🔷 Microsoft] │ │  │
│  │  └──────────────────────────────┘ │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### Backend Services

```
┌────────────────────────────────────────────────────┐
│              Backend GraphQL Server                │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │           GraphQL Schema                     │ │
│  │                                              │ │
│  │  type Mutation {                             │ │
│  │    login(email, password): AuthPayload       │ │
│  │    signUp(input): AuthPayload                │ │
│  │    oauthLogin(provider, code): AuthPayload   │ │
│  │    refreshAccessToken: String                │ │
│  │    logout: Boolean                           │ │
│  │  }                                           │ │
│  │                                              │ │
│  │  type User {                                 │ │
│  │    id, email, name, role                    │ │
│  │    oauthProvider, oauthProviderId           │ │
│  │    profilePicture                           │ │
│  │  }                                           │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │             Resolvers                        │ │
│  │  • Mutation.login()                          │ │
│  │  • Mutation.signUp()                         │ │
│  │  • Mutation.oauthLogin() ─────▶ Auth Service│ │
│  │  • Mutation.logout()                         │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │         AuthServiceClient                    │ │
│  │  • hashPassword()                            │ │
│  │  • verifyPassword()                          │ │
│  │  • signTokens()                              │ │
│  │  • verifyAccessToken()                       │ │
│  │  • request() ──────────────▶ HTTP to Auth   │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│              Auth Service (Express)                │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │             REST Endpoints                   │ │
│  │  POST /hash-password                         │ │
│  │  POST /verify-password                       │ │
│  │  POST /sign-tokens                           │ │
│  │  POST /verify-access-token                   │ │
│  │  POST /verify-refresh-token                  │ │
│  │  POST /refresh                               │ │
│  │  POST /logout                                │ │
│  │  POST /oauth/google ────▶ OAuthService       │ │
│  │  POST /oauth/microsoft ─▶ OAuthService       │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │          OAuthService                        │ │
│  │  • handleGoogleCallback()                    │ │
│  │    - Exchange code for token                 │ │
│  │    - Fetch user info                         │ │
│  │  • handleMicrosoftCallback()                 │ │
│  │    - Exchange code for token                 │ │
│  │    - Fetch user info                         │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │          Core Auth Functions                 │ │
│  │  • hashPassword (bcrypt)                     │ │
│  │  • verifyPassword (bcrypt)                   │ │
│  │  • signAccessToken (JWT 15min)               │ │
│  │  • signRefreshToken (JWT 7days)              │ │
│  │  • verifyAccessToken (JWT)                   │ │
│  │  • verifyRefreshToken (JWT)                  │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

---

## Database Schema

### User Model (MongoDB)

```javascript
{
  _id: ObjectId,
  email: String (unique, sparse index),
  name: String (required),
  role: "TEACHER" | "STUDENT" | "PARENT" (required),
  status: "ACTIVE" | "INVITED" | "DISABLED",
  
  // Traditional auth
  passwordHash: String (nullable for OAuth users),
  
  // OAuth integration
  oauthProvider: "google" | "microsoft" | null,
  oauthProviderId: String (provider's user ID),
  profilePicture: String (URL from OAuth provider),
  
  // Timestamps
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Example Documents

**Traditional User:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "teacher@school.com",
  "name": "John Teacher",
  "role": "TEACHER",
  "status": "ACTIVE",
  "passwordHash": "$2a$12$xyz...",
  "oauthProvider": null,
  "oauthProviderId": null,
  "profilePicture": null
}
```

**OAuth User (Google):**
```json
{
  "_id": "507f1f77bcf86cd799439022",
  "email": "student@gmail.com",
  "name": "Jane Student",
  "role": "STUDENT",
  "status": "ACTIVE",
  "passwordHash": null,
  "oauthProvider": "google",
  "oauthProviderId": "google_123456789",
  "profilePicture": "https://lh3.googleusercontent.com/a/..."
}
```

**Hybrid User (Has Both):**
```json
{
  "_id": "507f1f77bcf86cd799439033",
  "email": "parent@outlook.com",
  "name": "Bob Parent",
  "role": "PARENT",
  "status": "ACTIVE",
  "passwordHash": "$2a$12$abc...",
  "oauthProvider": "microsoft",
  "oauthProviderId": "microsoft_987654321",
  "profilePicture": "https://graph.microsoft.com/..."
}
```

---

## Security Architecture

### Token Flow

```
┌──────────────────────────────────────────────────────┐
│                  JWT Token System                    │
│                                                      │
│  Access Token (15 minutes)                          │
│  ┌────────────────────────────────────────────────┐ │
│  │  Header: { "alg": "HS256", "typ": "JWT" }      │ │
│  │  Payload: {                                    │ │
│  │    "sub": "userId",                            │ │
│  │    "role": "TEACHER",                          │ │
│  │    "iat": 1234567890,                          │ │
│  │    "exp": 1234568790                           │ │
│  │  }                                             │ │
│  │  Signature: HMACSHA256(header.payload, secret)│ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Refresh Token (7 days)                             │
│  ┌────────────────────────────────────────────────┐ │
│  │  Header: { "alg": "HS256", "typ": "JWT" }      │ │
│  │  Payload: {                                    │ │
│  │    "sub": "userId",                            │ │
│  │    "role": "TEACHER",                          │ │
│  │    "iat": 1234567890,                          │ │
│  │    "exp": 1235172690                           │ │
│  │  }                                             │ │
│  │  Signature: HMACSHA256(header.payload, secret)│ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Storage:                                           │
│  • Access Token: localStorage + Redux state         │
│  • Refresh Token: HTTP-only cookie                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Service-to-Service Authentication

```
┌─────────────────────────────────────────────────┐
│     Backend ──────────────▶ Auth Service        │
│                                                 │
│  Request Headers:                               │
│  ┌───────────────────────────────────────────┐ │
│  │  Content-Type: application/json           │ │
│  │  x-service-api-key: <32-byte-hex-key>     │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Environment Variables:                         │
│  • Backend/.env: SERVICE_API_KEY=abc123...     │
│  • AuthService/.env: SERVICE_API_KEY=abc123... │
│  (Must match!)                                  │
│                                                 │
│  Middleware Protection:                         │
│  • validateServiceApiKey() on all protected    │
│    endpoints                                    │
│  • Rejects requests with invalid/missing key   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Environment Variables

### Auth Service (.env)
```env
PORT=4001
JWT_SECRET=<32-byte-hex>
REFRESH_JWT_SECRET=<32-byte-hex>
SERVICE_API_KEY=<32-byte-hex>

# OAuth (Optional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback/google

MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx
MICROSOFT_REDIRECT_URI=http://localhost:5173/auth/callback/microsoft
```

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/classecon
AUTH_SERVICE_URL=http://localhost:4001
SERVICE_API_KEY=<same-as-auth-service>
```

### Frontend (.env)
```env
VITE_GRAPHQL_URL=http://localhost:4000/graphql
VITE_AUTH_SERVICE_URL=http://localhost:4001

# OAuth Client IDs (NOT secrets!)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_MICROSOFT_CLIENT_ID=xxx
```

---

## API Reference

### Auth Service REST API

```
GET  /health
  Response: { status: "ok", service: "auth-service" }

POST /hash-password
  Headers: x-service-api-key
  Body: { password: string }
  Response: { hash: string }

POST /verify-password
  Headers: x-service-api-key
  Body: { password: string, hash: string }
  Response: { isValid: boolean }

POST /sign-tokens
  Headers: x-service-api-key
  Body: { userId: string, role: string }
  Response: { accessToken: string, refreshToken: string }

POST /verify-access-token
  Headers: x-service-api-key
  Body: { token: string }
  Response: { payload: { sub, role, iat, exp } }

POST /oauth/google
  Headers: x-service-api-key
  Body: { code: string }
  Response: { userInfo: { id, email, name, picture, provider } }

POST /oauth/microsoft
  Headers: x-service-api-key
  Body: { code: string }
  Response: { userInfo: { id, email, name, provider } }
```

### Backend GraphQL API

```graphql
type Mutation {
  login(email: String!, password: String!): AuthPayload!
  signUp(input: SignUpInput!): AuthPayload!
  oauthLogin(provider: OAuthProvider!, code: String!): AuthPayload!
  refreshAccessToken: String!
  logout: Boolean!
}

type AuthPayload {
  user: User!
  accessToken: String!
}

enum OAuthProvider {
  GOOGLE
  MICROSOFT
}
```

---

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Secure microservice communication
- ✅ Scalable OAuth integration
- ✅ Modern UX with multiple auth methods
- ✅ Production-ready security patterns
