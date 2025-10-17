# 🚨 URGENT: Fix CORS Error - Frontend Can't Access Backend

## The Error

```
Access to fetch at 'https://backend-production-e546.up.railway.app/' 
from origin 'https://classecon-production-aeea.up.railway.app' 
has been blocked by CORS policy
```

## Root Cause

The Backend's `CORS_ORIGINS` environment variable doesn't include the Frontend and LandingPage production URLs.

## ✅ Immediate Fix

### Go to Railway → Backend Service → Variables

**Add or Update** the `CORS_ORIGINS` variable:

```bash
CORS_ORIGINS=https://classecon-production-aeea.up.railway.app,https://classecon-production.up.railway.app,https://studio.apollographql.com
```

**Breakdown:**
- `https://classecon-production-aeea.up.railway.app` - Your Frontend
- `https://classecon-production.up.railway.app` - Your LandingPage  
- `https://studio.apollographql.com` - Apollo GraphQL Studio (for testing)

### Save and Redeploy

After updating the variable:
1. Click **Save**
2. Railway will automatically redeploy the Backend
3. Wait ~2-3 minutes for deployment to complete

## 🧪 Test After Deploy

### 1. Test CORS Headers

```bash
curl -I -X OPTIONS https://backend-production-e546.up.railway.app/graphql \
  -H "Origin: https://classecon-production-aeea.up.railway.app" \
  -H "Access-Control-Request-Method: POST"
```

Should see:
```
Access-Control-Allow-Origin: https://classecon-production-aeea.up.railway.app
```

### 2. Test Frontend Auth Page

1. Go to: `https://classecon-production-aeea.up.railway.app/auth`
2. Open browser console (F12)
3. Should see: `✅ Beta code validated successfully` (no CORS error)

### 3. Test Beta Code Flow

1. Go to LandingPage
2. Enter valid beta code
3. Redirects to Frontend `/auth`
4. Should validate without CORS errors

## 📋 Complete Backend Environment Variables

Your Backend should have these environment variables set in Railway:

```bash
# Server
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/classecon?retryWrites=true&w=majority

# CORS - CRITICAL: Must include all frontend URLs
CORS_ORIGINS=https://classecon-production-aeea.up.railway.app,https://classecon-production.up.railway.app,https://studio.apollographql.com

# Auth Service
AUTH_SERVICE_URL=https://authservice-production-xxxx.railway.app
SERVICE_API_KEY=<your-service-api-key>

# JWT (legacy, for admin/internal use)
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=7d
```

## ⚠️ Important Notes

### CORS_ORIGINS Format
- **Comma-separated** list (no spaces around commas)
- **Full URLs** with `https://` protocol
- **No trailing slashes**

✅ Correct:
```
CORS_ORIGINS=https://frontend.railway.app,https://landing.railway.app
```

❌ Incorrect:
```
CORS_ORIGINS=frontend.railway.app, landing.railway.app/
```

### Why This Error Happens

CORS (Cross-Origin Resource Sharing) is a browser security feature. When your Frontend makes requests to the Backend:

1. Browser sends "preflight" OPTIONS request
2. Backend must respond with `Access-Control-Allow-Origin` header
3. Header must match the requesting origin
4. If not, browser blocks the request

Without the Frontend URL in `CORS_ORIGINS`, the Backend doesn't allow the request.

## 🔄 Update Checklist

- [ ] Add `CORS_ORIGINS` variable in Railway Backend
- [ ] Include Frontend URL: `https://classecon-production-aeea.up.railway.app`
- [ ] Include LandingPage URL: `https://classecon-production.up.railway.app`
- [ ] Include Apollo Studio: `https://studio.apollographql.com`
- [ ] Save and wait for automatic redeploy
- [ ] Test OPTIONS request with curl
- [ ] Test Frontend `/auth` page
- [ ] Test full beta code flow

## 🐛 If Still Not Working

### Check Backend Logs

After redeploying, check Railway logs for:
```
[Startup] Allowed CORS origins: [
  "https://classecon-production-aeea.up.railway.app",
  "https://classecon-production.up.railway.app",
  "https://studio.apollographql.com"
]
```

### Verify Variable Format

Ensure there are **no spaces** after commas:
```bash
# ✅ Correct
CORS_ORIGINS=https://a.com,https://b.com

# ❌ Wrong (spaces will break parsing)
CORS_ORIGINS=https://a.com, https://b.com
```

### Check for Typos

Compare your URLs exactly:
- Frontend: `https://classecon-production-aeea.up.railway.app`
- LandingPage: `https://classecon-production.up.railway.app`

One wrong character and CORS will fail!

---

**Priority:** 🔴 **HIGH** - Frontend is completely blocked without this  
**Impact:** Beta code validation, login, all GraphQL queries  
**ETA:** ~5 minutes (update var + redeploy)

---

**Date:** October 17, 2025  
**Issue:** CORS blocking Frontend → Backend requests  
**Fix:** Add Frontend/Landing URLs to Backend CORS_ORIGINS
