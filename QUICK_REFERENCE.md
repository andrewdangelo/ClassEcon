# ClassEcon Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Install all dependencies
cd Backend && pnpm install
cd ../Frontend && pnpm install
cd ../AuthService && pnpm install

# Start development servers
cd AuthService && pnpm run dev    # Terminal 1 - Port 4001
cd Backend && pnpm run dev         # Terminal 2 - Port 4000
cd Frontend && pnpm run dev        # Terminal 3 - Port 5173

# Build for production
pnpm run build

# Run tests
pnpm test

# Generate GraphQL types
cd Frontend && pnpm run codegen
```

## 📂 Project URLs

| Service | Development | Production |
|---------|-------------|------------|
| Frontend | http://localhost:5173 | https://app.classecon.com |
| Backend GraphQL | http://localhost:4000/graphql | https://api.classecon.com/graphql |
| Auth Service | http://localhost:4001/health | https://auth.classecon.com/health |

## 🔐 Environment Variables

### Required for All Services

```env
# Backend
MONGODB_URI=mongodb://localhost:27017/classecon
AUTH_SERVICE_URL=http://localhost:4001
SERVICE_API_KEY=<generate-32-byte-hex>

# AuthService
PORT=4001
JWT_SECRET=<generate-32-byte-hex>
REFRESH_JWT_SECRET=<generate-32-byte-hex>
SERVICE_API_KEY=<same-as-backend>

# Frontend
VITE_GRAPHQL_URL=http://localhost:4000/graphql
VITE_AUTH_SERVICE_URL=http://localhost:4001
```

### Optional OAuth

```env
# AuthService
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback/google

MICROSOFT_CLIENT_ID=your-id
MICROSOFT_CLIENT_SECRET=your-secret
MICROSOFT_REDIRECT_URI=http://localhost:5173/auth/callback/microsoft

# Frontend
VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
VITE_MICROSOFT_CLIENT_ID=your-id
```

## 📖 Key File Locations

```
Backend/
├── src/models/              # Database models
├── src/resolvers/           # GraphQL resolvers
├── src/services/            # Business logic
├── src/schema.ts            # GraphQL schema
└── .env                     # Environment config

Frontend/
├── src/components/          # React components
├── src/graphql/mutations/   # GraphQL mutations
├── src/graphql/queries/     # GraphQL queries
├── src/modules/             # Feature modules
├── src/redux/               # Redux store
└── .env                     # Environment config

AuthService/
├── src/auth.ts              # JWT operations
├── src/oauth.ts             # OAuth integration
├── src/routes.ts            # API endpoints
└── .env                     # Environment config
```

## 🛠️ Common Tasks

### Add New Feature

1. **Backend:**
   ```typescript
   // 1. Create model in Backend/src/models/
   // 2. Add to Backend/src/schema.ts
   // 3. Create resolver in Backend/src/resolvers/
   ```

2. **Frontend:**
   ```typescript
   // 1. Add mutation in Frontend/src/graphql/mutations/
   // 2. Run: pnpm run codegen
   // 3. Create component in Frontend/src/modules/
   ```

### Fix Build Errors

```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Regenerate types
cd Frontend && pnpm run codegen

# Check TypeScript errors
pnpm run type-check
```

### Debug Issues

```bash
# Check service health
curl http://localhost:4001/health    # Auth Service
curl http://localhost:4000/graphql   # Backend

# View logs
docker-compose logs -f               # Docker
pnpm run dev                         # Development

# Check MongoDB
mongosh
> use classecon
> db.users.find().pretty()
```

## 🔍 GraphQL Examples

### Authentication

```graphql
# Login
mutation {
  login(email: "user@test.com", password: "password123") {
    user { id name role email }
    accessToken
  }
}

# OAuth Login
mutation {
  oauthLogin(provider: GOOGLE, code: "auth-code") {
    user { id name email oauthProvider }
    accessToken
  }
}

# Sign Up
mutation {
  signUp(input: {
    name: "John Doe"
    email: "john@test.com"
    password: "password123"
    role: TEACHER
  }) {
    user { id name role }
    accessToken
  }
}
```

### Classes

```graphql
# Create Class
mutation {
  createClass(input: {
    name: "Math 101"
    settings: {
      currency: "dollars"
      overdraft: 50
    }
  }) {
    id
    name
    joinCode
  }
}

# Join Class
mutation {
  joinClass(joinCode: "ABC123") {
    id
    name
  }
}
```

### Jobs

```graphql
# Create Job
mutation {
  createJob(input: {
    classId: "class-id"
    title: "Line Leader"
    description: "Lead the line"
    salary: 10
    paySchedule: DAILY
    slots: 2
  }) {
    id
    title
    salary
  }
}

# Apply for Job
mutation {
  applyForJob(input: {
    jobId: "job-id"
    coverLetter: "I'd be great at this!"
  }) {
    id
    status
  }
}
```

### Store

```graphql
# Create Store Item
mutation {
  createStoreItem(input: {
    classId: "class-id"
    title: "Homework Pass"
    price: 50
    stock: 10
  }) {
    id
    title
    price
  }
}

# Make Purchase
mutation {
  makePurchase(input: {
    classId: "class-id"
    items: [
      { storeItemId: "item-id", quantity: 1 }
    ]
  }) {
    id
    total
  }
}
```

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check SERVICE_API_KEY matches in Backend and AuthService .env |
| "Cannot connect to database" | Ensure MongoDB is running: `mongosh` |
| "Port already in use" | Kill process: `taskkill /PID <PID> /F` (Windows) or `kill -9 <PID>` (Unix) |
| "OAuth not configured" | Add OAuth credentials to AuthService .env and restart |
| GraphQL type errors | Run `cd Frontend && pnpm run codegen` |
| WebSocket connection fails | Check CORS settings and protocol (ws:// vs wss://) |

## 📚 Documentation Quick Links

| Topic | Link |
|-------|------|
| **Complete Guide** | [DEVELOPER_DOCUMENTATION.md](DEVELOPER_DOCUMENTATION.md) |
| **Architecture** | [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) |
| **OAuth Setup** | [docs/authentication/OAUTH_SETUP_GUIDE.md](docs/authentication/OAUTH_SETUP_GUIDE.md) |
| **Job System** | [docs/features/JOB_SYSTEM_SUMMARY.md](docs/features/JOB_SYSTEM_SUMMARY.md) |
| **Testing** | [docs/guides/TESTING_GUIDE.md](docs/guides/TESTING_GUIDE.md) |
| **All Docs** | [docs/README.md](docs/README.md) |

## 🎯 User Roles & Permissions

| Role | Can Do |
|------|--------|
| **TEACHER** | Create classes, manage jobs, approve requests, access all data |
| **STUDENT** | Join classes, apply for jobs, submit requests, make purchases |
| **PARENT** | View child's data, read-only access |

## 🔑 API Endpoints

### Auth Service (REST)

```
GET  /health                    # Health check
POST /hash-password             # Hash a password
POST /verify-password           # Verify password
POST /sign-tokens               # Generate JWT tokens
POST /verify-access-token       # Verify access token
POST /verify-refresh-token      # Verify refresh token
POST /oauth/google              # Google OAuth callback
POST /oauth/microsoft           # Microsoft OAuth callback
```

All endpoints (except `/health`) require `x-service-api-key` header.

### Backend (GraphQL)

See [Backend/src/schema.ts](Backend/src/schema.ts) for complete schema.

## 🧪 Test Accounts

```
Teacher: teacher@demo.com / password123
Student: student@demo.com / password123
```

## 📦 Database Collections

```
users              # User accounts
classes            # Classes
memberships        # Class memberships
jobs               # Jobs
jobapplications    # Job applications
employments        # Active employment
storeitems         # Store items
purchases          # Purchase records
transactions       # Financial transactions
payrequests        # Pay requests
redemptionrequests # Redemption requests
notifications      # User notifications
```

## 🚀 Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Update OAuth redirect URIs
- [ ] Change all secrets
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update environment variables
- [ ] Test all flows
- [ ] Set up error tracking

## 💡 Tips & Tricks

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Quick MongoDB queries:**
```javascript
// Find all teachers
db.users.find({ role: "TEACHER" })

// Count students in a class
db.memberships.countDocuments({ classId: ObjectId("...") })

// Recent transactions
db.transactions.find().sort({ createdAt: -1 }).limit(10)
```

**Debug GraphQL:**
```bash
# Enable debug mode
DEBUG=* pnpm run dev

# Test mutation
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { me { id name } }"}'
```

## 🆘 Getting Help

1. Check [DEVELOPER_DOCUMENTATION.md](DEVELOPER_DOCUMENTATION.md)
2. Search [docs/](docs/) directory
3. Review [GitHub Issues](https://github.com/andrewdangelo/ClassEcon/issues)
4. Ask in [GitHub Discussions](https://github.com/andrewdangelo/ClassEcon/discussions)

---

**Print this page for quick reference!** 🖨️

**Last Updated:** October 13, 2025
