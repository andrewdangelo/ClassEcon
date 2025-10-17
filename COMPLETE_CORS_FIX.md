# 🚨 CRITICAL: Complete CORS & Environment Variable Fix

## Current Issue

Frontend can't communicate with Backend due to:
1. ❌ Backend CORS_ORIGINS doesn't include Frontend URL
2. ❌ Frontend might not have VITE_GRAPHQL_URL embedded properly

## ✅ Complete Fix - Do Both Steps

### Step 1: Fix Backend CORS

**Railway → Backend Service → Variables**

Add or update:
```bash
CORS_ORIGINS=https://classecon-production-aeea.up.railway.app,https://classecon-production.up.railway.app,https://studio.apollographql.com
```

**Important:**
- No spaces after commas
- Include both Frontend and LandingPage URLs
- Save and wait for Backend to redeploy (~2 min)

---

### Step 2: Fix Frontend Environment Variables

**Railway → Frontend Service → Variables**

Verify these are set:

```bash
# Backend GraphQL API
VITE_GRAPHQL_URL=https://backend-production-e546.up.railway.app/graphql

# Alternative format (if using HTTP/WS split)
VITE_GRAPHQL_HTTP_URL=https://backend-production-e546.up.railway.app/graphql
VITE_GRAPHQL_WS_URL=wss://backend-production-e546.up.railway.app/graphql

# Landing Page URL
VITE_LANDING_PAGE_URL=https://classecon-production.up.railway.app

# Auth Service (when deployed)
VITE_AUTH_SERVICE_URL=https://authservice-production-xxxx.railway.app

# Environment
VITE_NODE_ENV=production
```

**After setting/verifying:**
- Click **Save**
- Trigger a redeploy of Frontend (or wait for auto-deploy)
- This ensures VITE_* variables are embedded during build

---

## 🧪 Verification Steps

### 1. Check Backend CORS Headers

```bash
curl -I -X OPTIONS https://backend-production-e546.up.railway.app/graphql \
  -H "Origin: https://classecon-production-aeea.up.railway.app" \
  -H "Access-Control-Request-Method: POST"
```

**Look for:**
```
Access-Control-Allow-Origin: https://classecon-production-aeea.up.railway.app
```

### 2. Check Frontend Environment Variables

Open **Frontend** in browser → Console (F12) → Type:
```javascript
console.log({
  VITE_GRAPHQL_URL: import.meta.env.VITE_GRAPHQL_URL,
  VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV
});
```

**Expected:**
```javascript
{
  VITE_GRAPHQL_URL: "https://backend-production-e546.up.railway.app/graphql", // ✅ Should be set!
  VITE_NODE_ENV: "production"
}
```

**If undefined:** Frontend wasn't rebuilt with the environment variables.

### 3. Test Beta Code Flow

1. Go to LandingPage: `https://classecon-production.up.railway.app`
2. Click "Get Early Access"
3. Enter valid beta code
4. Should redirect to Frontend `/auth`
5. Check console - **should NOT see CORS errors**
6. Should see: `✅ Beta code validated successfully`

### 4. Test Login

1. Go to Frontend: `https://classecon-production-aeea.up.railway.app/auth`
2. Try to log in
3. Check console - **should NOT see CORS errors**
4. Should see GraphQL requests succeeding

---

## 📋 Complete Environment Variables Reference

### Backend
```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=mongodb+srv://...
CORS_ORIGINS=https://classecon-production-aeea.up.railway.app,https://classecon-production.up.railway.app,https://studio.apollographql.com
AUTH_SERVICE_URL=https://authservice-production-xxxx.railway.app
SERVICE_API_KEY=<your-service-api-key>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=7d
```

### Frontend
```bash
VITE_GRAPHQL_URL=https://backend-production-e546.up.railway.app/graphql
VITE_GRAPHQL_HTTP_URL=https://backend-production-e546.up.railway.app/graphql
VITE_GRAPHQL_WS_URL=wss://backend-production-e546.up.railway.app/graphql
VITE_LANDING_PAGE_URL=https://classecon-production.up.railway.app
VITE_AUTH_SERVICE_URL=https://authservice-production-xxxx.railway.app
VITE_NODE_ENV=production
```

### LandingPage
```bash
VITE_GRAPHQL_URL=https://backend-production-e546.up.railway.app/graphql
VITE_FRONTEND_URL=https://classecon-production-aeea.up.railway.app
VITE_NODE_ENV=production
```

---

## ⏱️ Timeline

1. **Update Backend CORS_ORIGINS** → Save → Wait 2 min for redeploy
2. **Verify Frontend env vars** → Save (if changed) → Wait 3 min for redeploy
3. **Test** → Beta code flow → Login

**Total time:** ~5-10 minutes

---

## 🐛 Troubleshooting

### Still Getting CORS Error After Backend Redeploy

**Check Backend Logs:**
Look for this line when Backend starts:
```
[Startup] Allowed CORS origins: [
  "https://classecon-production-aeea.up.railway.app",
  "https://classecon-production.up.railway.app"
]
```

**If not there:**
- CORS_ORIGINS variable wasn't set correctly
- Check for spaces after commas (invalid)
- Check for typos in URLs

### Frontend Still Using localhost

**Check Console:**
```javascript
import.meta.env.VITE_GRAPHQL_URL
// If undefined or localhost, Frontend needs rebuild
```

**Solution:**
1. Verify VITE_GRAPHQL_URL is set in Railway
2. Trigger manual redeploy of Frontend
3. Wait for build to complete
4. Hard refresh browser (Ctrl+Shift+R)

### Beta Code Validation Fails

**Check:**
1. Backend CORS includes Frontend URL ✅
2. Frontend has VITE_GRAPHQL_URL set ✅
3. Backend is running and healthy at `/health` ✅
4. GraphQL endpoint is accessible at `/graphql` ✅

### Login Fails

**Check:**
1. All of the above ✅
2. MongoDB connection string is correct ✅
3. User exists in database ✅
4. Password is hashed correctly ✅

---

## 🎯 Quick Fix Summary

**What you need to do RIGHT NOW:**

1. ✅ **Backend** → Add `CORS_ORIGINS` variable
2. ✅ **Frontend** → Verify `VITE_GRAPHQL_URL` is set
3. ⏳ Wait for both to redeploy
4. ⏳ Test beta code flow
5. ⏳ Test login

**Priority:** 🔴 **CRITICAL** - Blocks all Frontend functionality

---

**Date:** October 17, 2025  
**Issue:** CORS blocking + Missing environment variables  
**Affected:** Frontend → Backend communication  
**Impact:** Beta validation, login, all GraphQL queries
