# Auth Microservice Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Setup (run once)
./setup-auth-service.sh    # Linux/Mac
setup-auth-service.bat     # Windows

# Start all services
# Terminal 1
cd AuthService && pnpm dev

# Terminal 2
cd Backend && pnpm dev

# Terminal 3
cd Frontend && pnpm dev
```

## 🔌 Service Endpoints

### Auth Service (Port 4001)
```
GET  /health                      # Health check
POST /hash-password               # Hash a password
POST /verify-password             # Verify password
POST /sign-tokens                 # Generate JWT tokens
POST /verify-access-token         # Verify access token
POST /verify-refresh-token        # Verify refresh token
POST /refresh                     # Refresh access token
POST /logout                      # Clear cookies
```

### Backend (Port 4000)
```
POST /graphql
  - signUp(input)              # Create account
  - login(email, password)     # Login
  - logout                     # Logout
  - refreshAccessToken         # Refresh token
  - me                         # Get current user
```

## 🔐 Authentication Headers

### Frontend → Backend
```
Authorization: Bearer <accessToken>
Cookie: refresh_token=<refreshToken>
```

### Backend → Auth Service
```
Content-Type: application/json
x-service-api-key: <serviceApiKey>
```

## 🌍 Environment Variables

### AuthService/.env
```env
PORT=4001
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=<32-byte-hex>
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=<32-byte-hex>
REFRESH_JWT_EXPIRES_IN=7d
SERVICE_API_KEY=<32-byte-hex>
```

### Backend/.env
```env
PORT=4000
CORS_ORIGIN=http://localhost:5173
AUTH_SERVICE_URL=http://localhost:4001
SERVICE_API_KEY=<same-as-auth-service>
DATABASE_URL=mongodb://localhost:27017/classecon
```

## 🔑 Generate Secure Keys

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🧪 Quick Test Commands

```bash
# Test Auth Service health
curl http://localhost:4001/health

# Test Backend GraphQL
curl http://localhost:4000/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'

# Test password hashing
curl -X POST http://localhost:4001/hash-password \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: YOUR_KEY" \
  -d '{"password":"test123"}'
```

## 📊 Service Architecture

```
Frontend (5173) ──► Backend (4000) ──► Auth Service (4001)
                    ├─► MongoDB
                    └─► (Internal API Key)
```

## 🔄 Token Flow

1. **Login/Signup** → Returns accessToken + sets refresh cookie
2. **Protected Request** → Send accessToken in Authorization header
3. **Token Expired** → Use refreshAccessToken mutation
4. **Logout** → Clear tokens and cookies

## 🛠️ Common Commands

```bash
# Install dependencies
cd AuthService && pnpm install

# Build TypeScript
cd AuthService && pnpm build

# Start production
cd AuthService && pnpm start

# Check logs
# View terminal output or implement logging
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect to Auth Service" | Check Auth Service is running on port 4001 |
| "Invalid API key" | Verify SERVICE_API_KEY matches in both .env files |
| "Token expired" | Use refreshAccessToken mutation |
| "Port already in use" | Change PORT in .env or kill process on port |

## 📁 Key Files

```
AuthService/
├── src/index.ts          # Main server
├── src/auth.ts           # JWT & bcrypt logic
└── src/routes.ts         # API endpoints

Backend/
├── src/services/auth-client.ts    # Auth Service client
├── src/index.ts                   # GraphQL context
└── src/resolvers/Mutation.ts      # Auth mutations
```

## 🔒 Security Checklist

- [ ] Different secrets for JWT_SECRET and REFRESH_JWT_SECRET
- [ ] SERVICE_API_KEY is 32+ bytes
- [ ] Same SERVICE_API_KEY in both services
- [ ] CORS_ORIGIN set correctly
- [ ] HTTPS in production (secure: true for cookies)
- [ ] Auth Service in private network (production)

## 📚 Documentation

- `AuthService/README.md` - Auth Service docs
- `AUTH_MICROSERVICE_MIGRATION.md` - Migration guide
- `AUTH_TESTING_GUIDE.md` - Testing guide
- `AUTH_ARCHITECTURE.md` - Architecture diagrams
- `AUTH_REFACTOR_SUMMARY.md` - Complete summary

## 🎯 Production Checklist

- [ ] Use environment-specific secrets
- [ ] Enable HTTPS (secure cookies)
- [ ] Set up monitoring & logging
- [ ] Add rate limiting
- [ ] Use secrets manager (AWS Secrets Manager, etc.)
- [ ] Deploy Auth Service in private subnet
- [ ] Set up health checks
- [ ] Configure auto-scaling
- [ ] Enable request logging
- [ ] Set up alerts

## 📞 Quick Help

```bash
# View Auth Service logs
cd AuthService && pnpm dev

# View Backend logs
cd Backend && pnpm dev

# Check if services are running
curl http://localhost:4001/health
curl http://localhost:4000/graphql -d '{"query":"{ __typename }"}'

# Generate new API key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔗 Useful URLs

- Auth Service: http://localhost:4001
- Backend GraphQL: http://localhost:4000/graphql
- Frontend: http://localhost:5173

## 📦 Docker Commands

```bash
# Build and run with Docker Compose
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f auth-service
docker-compose logs -f backend
```

## ⚡ Performance Tips

- Auth Service is stateless → can scale horizontally
- Add Redis for rate limiting
- Use connection pooling for HTTP requests
- Monitor response times with APM tools
- Cache frequently used tokens (with caution)

---

**Quick Reference Version: 1.0**
**Last Updated: [Current Date]**
