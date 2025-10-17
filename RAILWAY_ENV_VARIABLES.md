# 🔐 Railway Environment Variables - Complete Guide

## 🚨 Critical Fix Applied

**Issue Fixed**: Server was binding to `localhost` which blocked Railway's health check.  
**Solution**: Changed to bind to `0.0.0.0` to accept external connections.  
**Status**: ✅ Committed and pushed

---

## 📋 Your Current Environment Variables (Need Updates!)

You currently have these set, but several need to be updated for Railway:

```bash
PORT="4000"                          # ✅ CORRECT
CORS_ORIGIN="http://localhost:5173"  # ❌ WRONG - needs Railway Frontend URL
DATABASE_URL="mongodb+srv://..."     # ✅ CORRECT (but see security note below)
MONGO_DB="classroomecon"            # ⚠️  Not used by code - can remove
JWT_SECRET="..."                     # ✅ CORRECT
JWT_EXPIRES_IN="15m"                # ✅ CORRECT
REFRESH_TOKEN_EXPIRES_IN="7d"       # ❌ WRONG NAME - should be REFRESH_JWT_EXPIRES_IN
REFRESH_JWT_SECRET="..."            # ✅ CORRECT
AUTH_SERVICE_URL="http://localhost:4001"  # ❌ WRONG - needs Railway Auth URL
SERVICE_API_KEY="..."               # ✅ CORRECT
```

---

## ✅ Correct Environment Variables for Railway Production

### 🎯 Step 1: Update These Immediately

After you deploy Frontend, Landing, and Auth services, update these variables:

```bash
# Core Server
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=mongodb+srv://adangelo:kuaZnfB2scqRMvma@ce-dev-use1-01.gomjxgi.mongodb.net/?retryWrites=true&w=majority&appName=ce-dev-use1-01

# JWT Authentication (keep your existing values)
JWT_SECRET=superlongrandomstring_change_me
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=another_superlong_random_string
REFRESH_JWT_EXPIRES_IN=7d  # ⚠️ Fix the name - you have REFRESH_TOKEN_EXPIRES_IN

# CORS & Service URLs (UPDATE THESE with your Railway URLs!)
CORS_ORIGINS=https://your-frontend.railway.app,https://your-landing.railway.app
FRONTEND_URL=https://your-frontend.railway.app
LANDING_PAGE_URL=https://your-landing.railway.app

# Auth Service (UPDATE THIS with your Railway Auth URL!)
AUTH_SERVICE_URL=https://your-auth.railway.app
SERVICE_API_KEY=d0a7d1964bf0576c430f0a5cb6844fcd56a57ff6de4ed57d1e6610954be657fe
```

### 📝 Variables to ADD:
```bash
CORS_ORIGINS=<your-urls-here>
FRONTEND_URL=<your-frontend-url>
LANDING_PAGE_URL=<your-landing-url>
```

### 📝 Variables to FIX:
```bash
# Change this:
REFRESH_TOKEN_EXPIRES_IN=7d

# To this:
REFRESH_JWT_EXPIRES_IN=7d
```

### 📝 Variables to REMOVE (not used):
```bash
MONGO_DB=classroomecon  # Not used by your code
```

---

## 🔄 Deployment Order & URL Updates

### Step 1: Deploy Backend (Current)
```bash
PORT=4000
NODE_ENV=production
DATABASE_URL=<your-mongodb-url>
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=<your-secret>
REFRESH_JWT_EXPIRES_IN=7d
SERVICE_API_KEY=<your-key>

# Temporary values (will update later):
CORS_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
LANDING_PAGE_URL=http://localhost:5174
AUTH_SERVICE_URL=http://localhost:4001
```

**Generate Domain** → Save URL (e.g., `https://backend-production-xxxx.up.railway.app`)

---

### Step 2: Deploy AuthService
Set these variables:
```bash
PORT=4001
NODE_ENV=production
JWT_SECRET=<same-as-backend>
REFRESH_JWT_SECRET=<same-as-backend>
SERVICE_API_KEY=<same-as-backend>

# Use Backend URL from Step 1:
CORS_ORIGIN=https://backend-production-xxxx.up.railway.app
```

**Generate Domain** → Save URL (e.g., `https://auth-production-xxxx.up.railway.app`)

---

### Step 3: Deploy Frontend
Set these variables:
```bash
VITE_NODE_ENV=production

# Use Backend URL from Step 1:
VITE_GRAPHQL_URL=https://backend-production-xxxx.up.railway.app/graphql
VITE_GRAPHQL_HTTP_URL=https://backend-production-xxxx.up.railway.app/graphql
VITE_GRAPHQL_WS_URL=wss://backend-production-xxxx.up.railway.app/graphql

# Use Auth URL from Step 2:
VITE_AUTH_SERVICE_URL=https://auth-production-xxxx.up.railway.app

# Temporary (will update after Landing):
VITE_LANDING_PAGE_URL=http://localhost:5174
```

**Generate Domain** → Save URL (e.g., `https://frontend-production-xxxx.up.railway.app`)

---

### Step 4: Deploy LandingPage
Set these variables:
```bash
VITE_NODE_ENV=production

# Use Backend URL from Step 1:
VITE_GRAPHQL_URL=https://backend-production-xxxx.up.railway.app/graphql

# Use Frontend URL from Step 3:
VITE_FRONTEND_URL=https://frontend-production-xxxx.up.railway.app
```

**Generate Domain** → Save URL (e.g., `https://landing-production-xxxx.up.railway.app`)

---

### Step 5: Update Backend & Frontend
Go back and update:

**Backend - Add/Update:**
```bash
CORS_ORIGINS=https://frontend-production-xxxx.up.railway.app,https://landing-production-xxxx.up.railway.app
FRONTEND_URL=https://frontend-production-xxxx.up.railway.app
LANDING_PAGE_URL=https://landing-production-xxxx.up.railway.app
AUTH_SERVICE_URL=https://auth-production-xxxx.up.railway.app
```

**Frontend - Update:**
```bash
VITE_LANDING_PAGE_URL=https://landing-production-xxxx.up.railway.app
```

**Redeploy both services**

---

## 🔒 Security Notes

### ⚠️ MongoDB Password Visible
Your MongoDB password is `kuaZnfB2scqRMvma` - I can see it in your connection string. After deployment:

1. **Rotate the password** in MongoDB Atlas
2. **Update DATABASE_URL** in Railway with new password
3. **Never commit** `.env` files to git

### ✅ Better Secrets
Generate stronger secrets for production:
```bash
# Generate new secrets
openssl rand -base64 32  # New JWT_SECRET
openssl rand -base64 32  # New REFRESH_JWT_SECRET
openssl rand -base64 32  # New SERVICE_API_KEY
```

---

## 🧪 Testing After Deployment

### 1. Test Backend Health
```bash
curl https://your-backend.railway.app/graphql
# Should return: "GET query missing"
```

### 2. Test GraphQL Playground
Visit: `https://your-backend.railway.app/graphql`
Should show Apollo GraphQL Playground

### 3. Test Simple Query
```graphql
query {
  __typename
}
```
Should return: `{ "data": { "__typename": "Query" } }`

---

## 📋 Quick Checklist

Before redeploying Backend:

- [x] Code fix committed (bind to 0.0.0.0) ✅
- [ ] Fix variable name: `REFRESH_JWT_EXPIRES_IN` (not `REFRESH_TOKEN_EXPIRES_IN`)
- [ ] Remove unused variable: `MONGO_DB`
- [ ] Add `NODE_ENV=production`
- [ ] Deploy Auth, Frontend, Landing services
- [ ] Update all service URLs in Backend
- [ ] Update `CORS_ORIGINS` with actual Railway URLs
- [ ] Redeploy Backend
- [ ] Test health check passes
- [ ] Test GraphQL endpoint works

---

## 🎯 Next Steps

1. **Fix the environment variable name** in Railway:
   - Delete: `REFRESH_TOKEN_EXPIRES_IN`
   - Add: `REFRESH_JWT_EXPIRES_IN=7d`

2. **Add missing variable**:
   - Add: `NODE_ENV=production`

3. **Redeploy Backend** - Health check should pass now!

4. **Deploy other services** (Auth, Frontend, Landing)

5. **Update Backend URLs** with actual Railway URLs

6. **Test end-to-end** functionality

---

**Status**: 🟢 Code fix pushed - Ready to redeploy with corrected environment variables!

The health check will pass once you redeploy with the new code (0.0.0.0 binding). 🚀
