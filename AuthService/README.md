# Auth Service Microservice

A dedicated authentication microservice for ClassEcon that handles JWT token generation, password hashing, and token verification.

## 🚀 Features

- **Password Hashing**: Secure bcrypt password hashing
- **JWT Token Management**: Access and refresh token generation and verification
- **Service-to-Service Authentication**: Protected endpoints with API key authentication
- **Cookie Management**: Secure HTTP-only cookie handling for refresh tokens
- **Stateless Design**: No database dependency, pure cryptographic operations

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Environment variables configured (see `.env.example`)

## 🛠️ Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** (see Configuration section below)

4. **Start the service**:
   ```bash
   # Development mode with hot reload
   pnpm dev

   # Production build
   pnpm build
   pnpm start
   ```

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=4001
CORS_ORIGIN=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-secret-key-here-min-32-chars
JWT_EXPIRES_IN=15m

REFRESH_JWT_SECRET=your-refresh-secret-key-here-min-32-chars
REFRESH_JWT_EXPIRES_IN=7d

# API Keys for inter-service communication
SERVICE_API_KEY=your-service-api-key-here
```

### 🔐 Generating Secure Keys

Use these commands to generate secure random keys:

```bash
# Generate JWT secrets (32 bytes = 256 bits)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate service API key (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important**: Use the SAME `SERVICE_API_KEY` in both AuthService and Backend `.env` files.

## 📡 API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `POST /refresh` - Refresh access token using cookie
- `POST /logout` - Clear refresh token cookie

### Protected Endpoints (Require `x-service-api-key` header)

- `POST /hash-password` - Hash a password
- `POST /verify-password` - Verify password against hash
- `POST /sign-tokens` - Generate access and refresh tokens
- `POST /verify-access-token` - Verify and decode access token
- `POST /verify-refresh-token` - Verify and decode refresh token

## 🔌 Integration with Backend

The Backend service communicates with Auth Service using the `AuthServiceClient` class. Configure Backend with:

```env
# Backend .env
AUTH_SERVICE_URL=http://localhost:4001
SERVICE_API_KEY=same-key-as-auth-service
```

## 🏗️ Architecture

```
┌─────────────┐          ┌──────────────┐
│   Frontend  │◄────────►│   Backend    │
└─────────────┘          │  (GraphQL)   │
                         └──────┬───────┘
                                │
                         Internal API
                         (API Key Auth)
                                │
                         ┌──────▼───────┐
                         │ Auth Service │
                         │  (Port 4001) │
                         └──────────────┘
```

## 🧪 Testing Endpoints

### Hash a password:
```bash
curl -X POST http://localhost:4001/hash-password \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: your-api-key" \
  -d '{"password": "mypassword123"}'
```

### Verify password:
```bash
curl -X POST http://localhost:4001/verify-password \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: your-api-key" \
  -d '{"password": "mypassword123", "hash": "$2a$12$..."}'
```

### Sign tokens:
```bash
curl -X POST http://localhost:4001/sign-tokens \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: your-api-key" \
  -d '{"userId": "123", "role": "TEACHER"}'
```

## 🚨 Security Considerations

1. **API Key Protection**: Never expose `SERVICE_API_KEY` in frontend code
2. **HTTPS in Production**: Set `secure: true` for cookies in production
3. **Secret Rotation**: Regularly rotate JWT secrets and API keys
4. **Network Isolation**: In production, run auth service in private network
5. **Rate Limiting**: Consider adding rate limiting for production deployments

## 📦 Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 4001
CMD ["npm", "start"]
```

### Environment-specific configs

- **Development**: Use `.env.development`
- **Production**: Use environment variables from hosting platform
- **Testing**: Use `.env.test` with different ports

## 🔄 Migration from Monolithic Auth

The Backend has been updated to use `AuthServiceClient` instead of direct auth functions. The old `auth.ts` file in Backend can be safely removed after verifying the integration works.

## 📝 License

Same as ClassEcon main project
