# ClassEcon Auth Microservice Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ClassEcon System                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   Frontend (React)   │  Port: 5173
│   ─────────────────  │
│   • Login UI         │
│   • Signup UI        │
│   • Auth State       │
│   • Token Storage    │
└──────────┬───────────┘
           │
           │ HTTP/GraphQL
           │ - Authorization: Bearer <token>
           │ - Cookie: refresh_token
           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       Backend (GraphQL)                               │
│                       Port: 4000                                      │
│   ────────────────────────────────────────────────────────────       │
│                                                                       │
│   ┌─────────────────┐    ┌──────────────────┐   ┌───────────────┐  │
│   │   Resolvers     │    │   Auth Client    │   │   Database    │  │
│   │   ─────────     │    │   ───────────    │   │   ────────    │  │
│   │ • signUp()      │───▶│ • hashPassword() │   │   MongoDB     │  │
│   │ • login()       │    │ • verifyPassword │   │               │  │
│   │ • logout()      │    │ • signTokens()   │   │ • Users       │  │
│   │ • me()          │    │ • verifyTokens() │   │ • Classes     │  │
│   └─────────────────┘    └────────┬─────────┘   │ • Accounts    │  │
│                                   │              └───────────────┘  │
│                                   │ Internal API                    │
│                                   │ (HTTP + API Key)                │
└───────────────────────────────────┼─────────────────────────────────┘
                                    │
                                    │ POST /hash-password
                                    │ POST /verify-password
                                    │ POST /sign-tokens
                                    │ POST /verify-access-token
                                    │ POST /verify-refresh-token
                                    │
                                    │ Headers:
                                    │   x-service-api-key: <secret>
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       Auth Service (Express)                          │
│                       Port: 4001                                      │
│   ─────────────────────────────────────────────────────────────      │
│                                                                       │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐ │
│   │   Routes     │    │   Auth Logic │    │   Middleware         │ │
│   │   ──────     │    │   ──────────  │    │   ──────────         │ │
│   │ • /health    │───▶│ • JWT Sign   │    │ • API Key Validator  │ │
│   │ • /hash-*    │    │ • JWT Verify │    │ • Error Handler      │ │
│   │ • /verify-*  │    │ • Bcrypt Hash│    │ • CORS               │ │
│   │ • /sign-*    │    │ • Bcrypt Cmp │    │ • Cookie Parser      │ │
│   │ • /refresh   │    └──────────────┘    └──────────────────────┘ │
│   │ • /logout    │                                                   │
│   └──────────────┘                                                   │
│                                                                       │
│   [NO DATABASE - Stateless Service]                                  │
└───────────────────────────────────────────────────────────────────────┘
```

## Request Flow Diagrams

### 1. User Signup Flow

```
┌────────┐         ┌─────────┐         ┌──────────┐
│Frontend│         │ Backend │         │Auth Svc  │
└───┬────┘         └────┬────┘         └────┬─────┘
    │                   │                   │
    │ signUp mutation   │                   │
    │──────────────────▶│                   │
    │                   │                   │
    │                   │ POST /hash-password
    │                   │──────────────────▶│
    │                   │   { password }    │
    │                   │                   │
    │                   │ { hash }          │
    │                   │◀──────────────────│
    │                   │                   │
    │      Create user in DB with hash      │
    │                   │                   │
    │                   │ POST /sign-tokens │
    │                   │──────────────────▶│
    │                   │ {userId, role}    │
    │                   │                   │
    │                   │ {access, refresh} │
    │                   │◀──────────────────│
    │                   │                   │
    │  {user, token}    │                   │
    │◀──────────────────│                   │
    │  + refresh cookie │                   │
    │                   │                   │
```

### 2. User Login Flow

```
┌────────┐         ┌─────────┐         ┌──────────┐
│Frontend│         │ Backend │         │Auth Svc  │
└───┬────┘         └────┬────┘         └────┬─────┘
    │                   │                   │
    │ login mutation    │                   │
    │──────────────────▶│                   │
    │                   │                   │
    │         Find user in DB               │
    │                   │                   │
    │                   │ POST /verify-password
    │                   │──────────────────▶│
    │                   │ {password, hash}  │
    │                   │                   │
    │                   │ { isValid: true } │
    │                   │◀──────────────────│
    │                   │                   │
    │                   │ POST /sign-tokens │
    │                   │──────────────────▶│
    │                   │ {userId, role}    │
    │                   │                   │
    │                   │ {access, refresh} │
    │                   │◀──────────────────│
    │                   │                   │
    │  {user, token}    │                   │
    │◀──────────────────│                   │
    │  + refresh cookie │                   │
    │                   │                   │
```

### 3. Protected Request Flow

```
┌────────┐         ┌─────────┐         ┌──────────┐
│Frontend│         │ Backend │         │Auth Svc  │
└───┬────┘         └────┬────┘         └────┬─────┘
    │                   │                   │
    │ query me {}       │                   │
    │ Auth: Bearer xyz  │                   │
    │──────────────────▶│                   │
    │                   │                   │
    │                   │ POST /verify-access-token
    │                   │──────────────────▶│
    │                   │ { token: "xyz" }  │
    │                   │                   │
    │                   │ { payload }       │
    │                   │◀──────────────────│
    │                   │                   │
    │       Fetch user data from DB         │
    │                   │                   │
    │  { user data }    │                   │
    │◀──────────────────│                   │
    │                   │                   │
```

### 4. Token Refresh Flow

```
┌────────┐         ┌─────────┐         ┌──────────┐
│Frontend│         │ Backend │         │Auth Svc  │
└───┬────┘         └────┬────┘         └────┬─────┘
    │                   │                   │
    │ refreshAccessToken│                   │
    │ Cookie: refresh_* │                   │
    │──────────────────▶│                   │
    │                   │                   │
    │                   │ POST /verify-refresh-token
    │                   │──────────────────▶│
    │                   │ { token: "..." }  │
    │                   │                   │
    │                   │ { payload }       │
    │                   │◀──────────────────│
    │                   │                   │
    │                   │ POST /sign-tokens │
    │                   │──────────────────▶│
    │                   │ {userId, role}    │
    │                   │                   │
    │                   │ { accessToken }   │
    │                   │◀──────────────────│
    │                   │                   │
    │  { accessToken }  │                   │
    │◀──────────────────│                   │
    │                   │                   │
```

## Security Layers

```
┌────────────────────────────────────────────────────────┐
│                    Security Layer 1                    │
│              Frontend ↔ Backend (Public)               │
│  ─────────────────────────────────────────────────────  │
│  • JWT Bearer tokens in Authorization header          │
│  • HTTP-only refresh cookies                          │
│  • CORS with credentials enabled                      │
│  • Token expiry: 15 minutes                           │
│  • Refresh expiry: 7 days                             │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                    Security Layer 2                    │
│            Backend ↔ Auth Service (Internal)           │
│  ─────────────────────────────────────────────────────  │
│  • Service API Key in x-service-api-key header        │
│  • Key must match on both services                    │
│  • Internal network (production)                      │
│  • Rate limiting (recommended)                        │
│  • Request/response validation                        │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                    Security Layer 3                    │
│                  Cryptographic Layer                   │
│  ─────────────────────────────────────────────────────  │
│  • JWT signed with HMAC SHA256                        │
│  • Bcrypt with salt rounds: 12                        │
│  • Secrets minimum 32 bytes (256 bits)                │
│  • No secrets in code or logs                         │
└────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│                    User Password                     │
│                  "MyPassword123"                     │
└─────────────┬───────────────────────────────────────┘
              │
              │ Signup/Change Password
              ▼
┌─────────────────────────────────────────────────────┐
│              Auth Service: hashPassword              │
│         Bcrypt with 12 salt rounds                  │
└─────────────┬───────────────────────────────────────┘
              │
              │ Returns hash
              ▼
┌─────────────────────────────────────────────────────┐
│              Hashed Password in DB                   │
│  "$2a$12$N9qo8uLOickgx2ZMRZoMye..."                │
└──────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────┐
│              Login: Password + Hash                  │
└─────────────┬───────────────────────────────────────┘
              │
              │ Verification request
              ▼
┌─────────────────────────────────────────────────────┐
│         Auth Service: verifyPassword                 │
│         Bcrypt compare                              │
└─────────────┬───────────────────────────────────────┘
              │
              │ isValid: true/false
              ▼
┌─────────────────────────────────────────────────────┐
│           If valid: Generate Tokens                  │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
    ┌─────────────────┐      ┌────────────────────┐
    │  Access Token   │      │  Refresh Token     │
    │  (15 min)       │      │  (7 days)          │
    │  In localStorage│      │  In HTTP-only      │
    │  or memory      │      │  Cookie            │
    └─────────────────┘      └────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Production Setup                      │
└──────────────────────────────────────────────────────────┘

                    ┌───────────────┐
                    │  Load Balancer│
                    │   (Nginx/ALB) │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐    ┌────────▼───────┐
        │   Frontend     │    │   Backend      │
        │   (Static)     │    │   (GraphQL)    │
        │   CDN/S3       │    │   ECS/K8s      │
        └────────────────┘    └────────┬───────┘
                                       │
                              Private Network
                                       │
                              ┌────────▼───────┐
                              │  Auth Service  │
                              │  (Internal)    │
                              │   ECS/K8s      │
                              └────────┬───────┘
                                       │
                              Not Publicly Accessible
```

## File Structure

```
ClassEcon/
│
├── AuthService/              # New microservice
│   ├── src/
│   │   ├── index.ts         # Entry point
│   │   ├── config.ts        # Environment config
│   │   ├── auth.ts          # JWT & bcrypt logic
│   │   ├── routes.ts        # API endpoints
│   │   └── middleware.ts    # Security middleware
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env
│
├── Backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── auth-client.ts    # NEW: Auth Service client
│   │   ├── index.ts              # UPDATED: Uses authClient
│   │   └── resolvers/
│   │       └── Mutation.ts       # UPDATED: Uses authClient
│   └── .env                      # UPDATED: New vars
│
├── Frontend/
│   └── [No changes required]
│
├── docker-compose.yml        # Multi-service orchestration
├── setup-auth-service.sh     # Setup script (Linux/Mac)
├── setup-auth-service.bat    # Setup script (Windows)
│
└── Documentation/
    ├── AUTH_REFACTOR_SUMMARY.md
    ├── AUTH_MICROSERVICE_MIGRATION.md
    ├── AUTH_TESTING_GUIDE.md
    └── AUTH_ARCHITECTURE.md       # This file
```

---

**Note**: All diagrams use ASCII art for universal compatibility.
For production documentation, consider using Mermaid, PlantUML, or Draw.io.
