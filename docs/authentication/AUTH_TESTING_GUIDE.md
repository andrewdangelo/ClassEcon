# Auth Microservice Testing Guide

Complete testing guide for the Auth Service refactor.

## 🧪 Testing Strategy

### 1. Unit Tests (Auth Service Endpoints)
### 2. Integration Tests (Backend ↔ Auth Service)
### 3. End-to-End Tests (Full User Flow)
### 4. Security Tests
### 5. Performance Tests

---

## 1️⃣ Unit Tests - Auth Service Endpoints

### Prerequisites
```bash
# Start Auth Service
cd AuthService
pnpm dev
# Should see: 🔐 Auth Service ready at http://localhost:4001
```

### Test 1.1: Health Check ✓
```bash
curl http://localhost:4001/health
```
**Expected Response:**
```json
{"status":"ok","service":"auth-service"}
```

### Test 1.2: Hash Password ✓
```bash
curl -X POST http://localhost:4001/hash-password \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: YOUR_SERVICE_API_KEY" \
  -d '{"password": "TestPassword123!"}'
```
**Expected Response:**
```json
{"hash":"$2a$12$..."}
```
**Copy the hash for next test**

### Test 1.3: Verify Password ✓
```bash
curl -X POST http://localhost:4001/verify-password \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: YOUR_SERVICE_API_KEY" \
  -d '{
    "password": "TestPassword123!",
    "hash": "$2a$12$..."
  }'
```
**Expected Response:**
```json
{"isValid":true}
```

### Test 1.4: Sign Tokens ✓
```bash
curl -X POST http://localhost:4001/sign-tokens \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: YOUR_SERVICE_API_KEY" \
  -d '{
    "userId": "test-user-123",
    "role": "TEACHER"
  }'
```
**Expected Response:**
```json
{
  "accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Copy the accessToken for next test**

### Test 1.5: Verify Access Token ✓
```bash
curl -X POST http://localhost:4001/verify-access-token \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: YOUR_SERVICE_API_KEY" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```
**Expected Response:**
```json
{
  "payload":{
    "sub":"test-user-123",
    "role":"TEACHER",
    "iat":1234567890,
    "exp":1234567890
  }
}
```

### Test 1.6: API Key Protection ✓
```bash
# Test without API key (should fail)
curl -X POST http://localhost:4001/hash-password \
  -H "Content-Type: application/json" \
  -d '{"password": "test"}'
```
**Expected Response:**
```json
{"error":"Unauthorized: Invalid API key"}
```
**Status Code: 401**

---

## 2️⃣ Integration Tests - Backend ↔ Auth Service

### Prerequisites
```bash
# Terminal 1: Auth Service
cd AuthService && pnpm dev

# Terminal 2: Backend
cd Backend && pnpm dev
# Should see: 🚀 GraphQL ready at http://localhost:4000/graphql
```

### Test 2.1: User Signup ✓

**GraphQL Mutation:**
```graphql
mutation {
  signUp(input: {
    name: "Test Teacher"
    email: "teacher@test.com"
    password: "SecurePass123!"
    role: TEACHER
  }) {
    user {
      id
      name
      email
      role
    }
    accessToken
  }
}
```

**Expected Result:**
- ✅ Returns user object with id
- ✅ Returns valid JWT accessToken
- ✅ Sets refresh_token cookie

### Test 2.2: User Login ✓

**GraphQL Mutation:**
```graphql
mutation {
  login(
    email: "teacher@test.com"
    password: "SecurePass123!"
  ) {
    user {
      id
      email
      role
    }
    accessToken
  }
}
```

**Expected Result:**
- ✅ Returns user object
- ✅ Returns valid accessToken
- ✅ Sets refresh_token cookie

### Test 2.3: Invalid Login ✓

**GraphQL Mutation:**
```graphql
mutation {
  login(
    email: "teacher@test.com"
    password: "WrongPassword"
  ) {
    user { id }
    accessToken
  }
}
```

**Expected Result:**
- ✅ Returns error: "Invalid credentials"
- ❌ No token returned

### Test 2.4: Protected Query (with valid token) ✓

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**GraphQL Query:**
```graphql
query {
  me {
    id
    name
    email
    role
  }
}
```

**Expected Result:**
- ✅ Returns authenticated user's data

### Test 2.5: Protected Query (without token) ✓

**No Authorization header**

**GraphQL Query:**
```graphql
query {
  me {
    id
    name
  }
}
```

**Expected Result:**
- ✅ Returns error: "Not authenticated"

### Test 2.6: Token Refresh ✓

**Must have refresh_token cookie from login/signup**

**GraphQL Mutation:**
```graphql
mutation {
  refreshAccessToken
}
```

**Expected Result:**
- ✅ Returns new accessToken string
- ✅ Token is valid and contains correct user data

### Test 2.7: Logout ✓

**GraphQL Mutation:**
```graphql
mutation {
  logout
}
```

**Expected Result:**
- ✅ Returns true
- ✅ Clears refresh_token cookie

---

## 3️⃣ End-to-End Tests - Frontend Flow

### Prerequisites
```bash
# Terminal 1: Auth Service
cd AuthService && pnpm dev

# Terminal 2: Backend
cd Backend && pnpm dev

# Terminal 3: Frontend
cd Frontend && pnpm dev
# Navigate to http://localhost:5173
```

### Test 3.1: Complete Signup Flow ✓

1. Navigate to signup page
2. Fill in form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "Password123!"
   - Role: Select "Teacher"
3. Click "Sign Up"

**Expected:**
- ✅ Redirects to dashboard
- ✅ User is authenticated
- ✅ Can access protected routes
- ✅ Token stored in localStorage/state
- ✅ Refresh cookie set in browser

### Test 3.2: Complete Login Flow ✓

1. Navigate to login page
2. Fill in form:
   - Email: "test@example.com"
   - Password: "Password123!"
3. Click "Login"

**Expected:**
- ✅ Redirects to dashboard
- ✅ User data loaded
- ✅ Protected routes accessible

### Test 3.3: Token Auto-Refresh ✓

1. Login to application
2. Wait 15+ minutes (access token expires)
3. Perform any action that requires auth

**Expected:**
- ✅ Request automatically refreshes token
- ✅ User stays logged in
- ✅ No visible interruption

### Test 3.4: Logout Flow ✓

1. While logged in, click "Logout"

**Expected:**
- ✅ Redirects to login page
- ✅ Token cleared from storage
- ✅ Cookie cleared
- ✅ Cannot access protected routes
- ✅ Redirected to login if attempting protected route

### Test 3.5: Protected Route Without Auth ✓

1. Ensure logged out
2. Navigate directly to `/dashboard` or other protected route

**Expected:**
- ✅ Redirects to login page
- ✅ Shows "Please login" message (if implemented)

---

## 4️⃣ Security Tests

### Test 4.1: JWT Secret Validation ✓

1. Generate token with Auth Service
2. Try to verify with different JWT_SECRET

**Expected:**
- ✅ Verification fails
- ✅ Returns "Invalid token" error

### Test 4.2: Expired Token Handling ✓

1. Generate token with very short expiry (modify JWT_EXPIRES_IN to "1s")
2. Wait 2 seconds
3. Try to use token

**Expected:**
- ✅ Token rejected
- ✅ Error: "Token expired"

### Test 4.3: API Key Brute Force Protection ✓

1. Make 100 requests with wrong API key to Auth Service

**Expected:**
- ✅ All requests return 401
- ⚠️ Consider adding rate limiting

### Test 4.4: SQL/NoSQL Injection in Password ✓

**GraphQL Mutation:**
```graphql
mutation {
  login(
    email: "test@example.com"
    password: "' OR '1'='1"
  ) {
    user { id }
    accessToken
  }
}
```

**Expected:**
- ✅ Login fails
- ✅ Password treated as literal string
- ✅ No database injection

### Test 4.5: XSS in Auth Fields ✓

**GraphQL Mutation:**
```graphql
mutation {
  signUp(input: {
    name: "<script>alert('xss')</script>"
    email: "xss@test.com"
    password: "Pass123!"
    role: TEACHER
  }) {
    user { name }
    accessToken
  }
}
```

**Expected:**
- ✅ Script tags stored as plain text (if allowed)
- ✅ No script execution
- ✅ Proper escaping in frontend

---

## 5️⃣ Performance Tests

### Test 5.1: Auth Service Response Time ✓

```bash
# Install apache bench
# Ubuntu: sudo apt-get install apache2-utils
# Mac: brew install apache2-utils

ab -n 1000 -c 10 \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: YOUR_KEY" \
  -p data.json \
  http://localhost:4001/verify-access-token
```

**data.json:**
```json
{"token":"YOUR_VALID_TOKEN"}
```

**Expected:**
- ✅ Average response time < 50ms
- ✅ No failed requests
- ✅ Consistent performance

### Test 5.2: Concurrent Login Load ✓

```bash
# Use k6 or similar tool
npm install -g k6

# Create load-test.js
k6 run load-test.js
```

**load-test.js:**
```javascript
import http from 'k6/http';

export default function() {
  const mutation = `
    mutation {
      login(email: "test@example.com", password: "Pass123!") {
        accessToken
      }
    }
  `;
  
  http.post('http://localhost:4000/graphql', JSON.stringify({
    query: mutation
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export const options = {
  vus: 50, // 50 virtual users
  duration: '30s',
};
```

**Expected:**
- ✅ P95 latency < 500ms
- ✅ Success rate > 99%
- ✅ No memory leaks

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to Auth Service"
**Solution:**
```bash
# Check Auth Service is running
curl http://localhost:4001/health

# Check AUTH_SERVICE_URL in Backend .env
# Should be: AUTH_SERVICE_URL=http://localhost:4001
```

### Issue 2: "Invalid API key"
**Solution:**
```bash
# Ensure SERVICE_API_KEY matches in both .env files
# AuthService/.env
# Backend/.env
```

### Issue 3: "Token expired immediately"
**Solution:**
```bash
# Check system time is synchronized
# Verify JWT_EXPIRES_IN is not too short
# Default should be: JWT_EXPIRES_IN=15m
```

### Issue 4: "Refresh token not working"
**Solution:**
```bash
# Check cookies are enabled
# Verify CORS credentials: true
# Check cookie path matches: path: "/graphql"
```

---

## ✅ Testing Checklist

### Auth Service (Unit)
- [ ] Health check returns 200
- [ ] Password hashing works
- [ ] Password verification works
- [ ] Token generation works
- [ ] Token verification works
- [ ] API key protection works
- [ ] Error handling works

### Backend Integration
- [ ] Signup creates user
- [ ] Login returns token
- [ ] Invalid credentials rejected
- [ ] Protected routes require auth
- [ ] Token refresh works
- [ ] Logout clears cookie

### Frontend E2E
- [ ] Signup flow complete
- [ ] Login flow complete
- [ ] Logout flow complete
- [ ] Auto token refresh works
- [ ] Protected routes guarded
- [ ] Auth state persists on refresh

### Security
- [ ] JWT secrets validated
- [ ] Expired tokens rejected
- [ ] API key required for protected endpoints
- [ ] No injection vulnerabilities
- [ ] XSS protection in place

### Performance
- [ ] Auth Service response < 50ms
- [ ] Handles 50+ concurrent users
- [ ] No memory leaks
- [ ] Database not overloaded

---

## 📊 Test Results Template

```
# Test Run: [DATE]

## Auth Service Unit Tests
- Health Check: ✅ PASS
- Hash Password: ✅ PASS
- Verify Password: ✅ PASS
- Sign Tokens: ✅ PASS
- Verify Token: ✅ PASS
- API Key Protection: ✅ PASS

## Backend Integration
- Signup: ✅ PASS
- Login: ✅ PASS
- Invalid Login: ✅ PASS
- Protected Query (with token): ✅ PASS
- Protected Query (without token): ✅ PASS
- Token Refresh: ✅ PASS
- Logout: ✅ PASS

## Frontend E2E
- Signup Flow: ✅ PASS
- Login Flow: ✅ PASS
- Token Auto-Refresh: ✅ PASS
- Logout Flow: ✅ PASS
- Protected Routes: ✅ PASS

## Security Tests
- JWT Validation: ✅ PASS
- Expired Token: ✅ PASS
- API Key Protection: ✅ PASS
- Injection Prevention: ✅ PASS

## Performance
- Response Time: ✅ < 50ms avg
- Concurrent Users: ✅ 50+ handled
- Memory: ✅ Stable

## Overall Status: ✅ ALL TESTS PASSED
```

---

## 🎯 Next Steps After Testing

1. ✅ All tests passing → Deploy to staging
2. ⚠️ Some tests failing → Debug and fix issues
3. 📝 Document any edge cases found
4. 🔄 Add automated tests to CI/CD
5. 📊 Set up monitoring and alerts

---

**Happy Testing! 🧪**
