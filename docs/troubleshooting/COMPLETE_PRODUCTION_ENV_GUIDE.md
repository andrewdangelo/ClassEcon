# 🚀 Complete Production Environment Variables Guide

## Overview

This guide provides the **exact environment variables** needed for each service when deploying to Railway.

---

## 1️⃣ Backend Service

**Railway Service Name:** `Backend`  
**Root Directory:** `Backend`

### Environment Variables

```bash
# Server
NODE_ENV=production
PORT=4000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/classecon?retryWrites=true&w=majority

# CORS - Allow Frontend, Landing Page, and Apollo Studio
CORS_ORIGINS=https://frontend-production-xxxx.railway.app,https://landing-production-xxxx.railway.app,https://studio.apollographql.com

# Auth Service
AUTH_SERVICE_URL=https://authservice-production-xxxx.railway.app
SERVICE_API_KEY=<generate-with-openssl-rand-base64-32>

# JWT (Backend manages its own tokens for admin/internal use)
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRES_IN=7d
```

**Generation Commands:**
```bash
openssl rand -base64 32  # For SERVICE_API_KEY
openssl rand -base64 32  # For JWT_SECRET
```

---

## 2️⃣ AuthService

**Railway Service Name:** `AuthService`  
**Root Directory:** `AuthService`

### Environment Variables

```bash
# Server
NODE_ENV=production
PORT=4001

# CORS - Frontend URL
CORS_ORIGIN=https://frontend-production-xxxx.railway.app

# JWT Configuration
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRES_IN=15m

# Refresh Token
REFRESH_JWT_SECRET=<generate-with-openssl-rand-base64-32>
REFRESH_JWT_EXPIRES_IN=7d

# Inter-Service API Key (MUST match Backend's SERVICE_API_KEY)
SERVICE_API_KEY=<same-value-as-backend>

# OAuth Google (Optional - leave empty if not using)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# OAuth Microsoft (Optional - leave empty if not using)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=
```

**Generation Commands:**
```bash
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For REFRESH_JWT_SECRET (use different value!)
# SERVICE_API_KEY: Copy the same value from Backend
```

---

## 3️⃣ Frontend

**Railway Service Name:** `Frontend`  
**Root Directory:** `Frontend`

### Environment Variables

```bash
# API URLs
VITE_GRAPHQL_URL=https://backend-production-e546.up.railway.app/graphql
VITE_AUTH_SERVICE_URL=https://authservice-production-xxxx.railway.app

# Landing Page URL
VITE_LANDING_PAGE_URL=https://landing-production-xxxx.railway.app

# OAuth (Optional - leave empty if not using)
VITE_GOOGLE_CLIENT_ID=
VITE_MICROSOFT_CLIENT_ID=

# Feature Flags
VITE_ENABLE_OAUTH=false

# Environment
VITE_NODE_ENV=production
```

**⚠️ Important:** 
- `VITE_GRAPHQL_URL` - Already have: `https://backend-production-e546.up.railway.app/graphql` ✅
- Update other URLs after deploying those services

---

## 4️⃣ LandingPage

**Railway Service Name:** `LandingPage`  
**Root Directory:** `LandingPage`

### Environment Variables

```bash
# Backend API for Beta Code Validation
VITE_GRAPHQL_URL=https://backend-production-e546.up.railway.app/graphql

# Frontend URL (where to redirect after successful beta code validation)
VITE_FRONTEND_URL=https://frontend-production-xxxx.railway.app

# Environment
VITE_NODE_ENV=production
```

**⚠️ Critical:** `VITE_FRONTEND_URL` must be set or beta codes will redirect to localhost!

---

## 🔄 Deployment Order & Updates

### Phase 1: Initial Setup

1. **Backend** ✅ (Already deployed)
   - Set MongoDB, CORS (temporary), SERVICE_API_KEY, JWT_SECRET
   - Get URL: `https://backend-production-e546.up.railway.app`

### Phase 2: Deploy AuthService

2. **AuthService** 
   - Set all required env vars (use Backend URL, temporary CORS)
   - Deploy
   - Get URL: `https://authservice-production-xxxx.railway.app`
   - **Update Backend:** Set `AUTH_SERVICE_URL` to AuthService URL
   - **Redeploy Backend**

### Phase 3: Deploy Frontend

3. **Frontend**
   - Set `VITE_GRAPHQL_URL` to Backend ✅
   - Set `VITE_AUTH_SERVICE_URL` to AuthService URL
   - Set `VITE_LANDING_PAGE_URL` to temporary `http://localhost:5174`
   - Deploy
   - Get URL: `https://frontend-production-xxxx.railway.app`

### Phase 4: Deploy Landing Page

4. **LandingPage**
   - Set `VITE_GRAPHQL_URL` to Backend ✅
   - Set `VITE_FRONTEND_URL` to Frontend URL from Phase 3 ⚠️ **CRITICAL**
   - Deploy
   - Get URL: `https://landing-production-xxxx.railway.app`

### Phase 5: Final Updates

5. **Update All Services**
   - **Frontend:** Update `VITE_LANDING_PAGE_URL` to Landing URL
   - **Backend:** Update `CORS_ORIGINS` to include Frontend + Landing URLs
   - **AuthService:** Update `CORS_ORIGIN` to Frontend URL
   - **Redeploy:** Frontend, Backend, AuthService

---

## ⚠️ Critical Requirements

### Must Match Between Services

| Variable | Services | Requirement |
|----------|----------|-------------|
| `SERVICE_API_KEY` | Backend + AuthService | **MUST BE IDENTICAL** |
| `VITE_GRAPHQL_URL` | Frontend + Landing | Point to Backend URL |
| `VITE_FRONTEND_URL` | Landing | **REQUIRED** for beta code redirect |
| `CORS_ORIGINS` | Backend | Include Frontend + Landing |
| `CORS_ORIGIN` | AuthService | Include Frontend |

### Don't Set These (Railway Provides Automatically)

- ❌ `PORT` - Railway assigns dynamically
- ❌ `DATABASE_URL` - Use `MONGODB_URI` instead
- ❌ `HOST` - Not needed

---

## 🧪 Testing After Deployment

### 1. Backend Health
```bash
curl https://backend-production-e546.up.railway.app/health
# Expected: {"status":"healthy"}
```

### 2. AuthService Health
```bash
curl https://authservice-production-xxxx.railway.app/health
# Expected: {"status":"ok","service":"auth-service"}
```

### 3. Frontend Loads
```bash
curl -I https://frontend-production-xxxx.railway.app
# Expected: 200 OK
```

### 4. Landing Page Loads
```bash
curl -I https://landing-production-xxxx.railway.app
# Expected: 200 OK
```

### 5. Beta Code Redirect (Most Important!)
1. Go to Landing Page
2. Click "Get Early Access"
3. Enter valid beta code
4. Should redirect to: `https://frontend-production-xxxx.railway.app/auth?betaCode=XXXXX`
5. **NOT** to: `http://localhost:5173/auth` ❌

---

## 🐛 Troubleshooting

### Beta Code Redirects to Localhost

**Problem:** After entering beta code, redirects to `http://localhost:5173/auth`

**Solution:** 
1. Check if `VITE_FRONTEND_URL` is set in LandingPage service
2. If missing, add: `VITE_FRONTEND_URL=https://frontend-production-xxxx.railway.app`
3. Redeploy LandingPage

### Backend Can't Connect to AuthService

**Problem:** Backend logs show auth service errors

**Solution:**
1. Verify `AUTH_SERVICE_URL` in Backend matches AuthService's public URL
2. Verify `SERVICE_API_KEY` is identical in both services
3. Redeploy Backend

### CORS Errors

**Problem:** Frontend shows CORS errors when calling Backend/AuthService

**Solution:**
1. Update `CORS_ORIGINS` in Backend to include Frontend URL
2. Update `CORS_ORIGIN` in AuthService to include Frontend URL
3. Redeploy Backend and AuthService

---

## 📋 Quick Copy-Paste Checklist

### Before Starting
- [ ] MongoDB Atlas cluster created with IP whitelist `0.0.0.0/0`
- [ ] Generated `SERVICE_API_KEY` (same for Backend + AuthService)
- [ ] Generated `JWT_SECRET` for Backend
- [ ] Generated `JWT_SECRET` and `REFRESH_JWT_SECRET` for AuthService

### Deployment Checklist
- [ ] Backend deployed ✅
- [ ] AuthService deployed with correct env vars
- [ ] Backend updated with `AUTH_SERVICE_URL`
- [ ] Frontend deployed with Backend + AuthService URLs
- [ ] LandingPage deployed with `VITE_FRONTEND_URL` ⚠️ **CRITICAL**
- [ ] All services updated with final CORS settings
- [ ] All services redeployed with updated URLs

### Verification Checklist
- [ ] Backend health check passes
- [ ] AuthService health check passes
- [ ] Frontend loads in browser
- [ ] Landing page loads in browser
- [ ] Beta code redirect goes to Frontend (not localhost!) ⚠️
- [ ] Can log in on Frontend
- [ ] GraphQL playground works

---

**Date:** October 17, 2025  
**Last Updated:** Fixed beta code redirect documentation  
**Status:** Backend ✅ | AuthService ⏳ | Frontend ⏳ | Landing ⏳
