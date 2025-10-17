# AuthService Railway Deployment Checklist

## Pre-Deployment Preparation

### 1. Generate Required Secrets

Generate three random secrets locally (save them for Railway):

```bash
# JWT Secret (64 characters)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Refresh JWT Secret (64 characters) 
node -e "console.log('REFRESH_JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Service API Key (32 characters is sufficient)
node -e "console.log('SERVICE_API_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Save these values** - you'll need them in Railway!

---

## Railway Deployment Steps

### 1. Create AuthService on Railway

1. Go to your Railway project
2. Click **"+ New"** → **"GitHub Repo"**
3. Select **ClassEcon** repository
4. Railway will create a new service

### 2. Configure Service Settings

**Settings → General:**
- Service Name: `AuthService` (or `auth-service`)

**Settings → Source:**
- Root Directory: `AuthService`
- Build Command: _(leave empty, uses Dockerfile)_
- Dockerfile Path: _(leave empty, auto-detected)_

### 3. Add Environment Variables

**Settings → Variables:**

Click **"New Variable"** and add each of these:

```bash
# Required Variables
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=<paste-generated-value>
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=<paste-generated-value>
REFRESH_JWT_EXPIRES_IN=7d
SERVICE_API_KEY=<paste-generated-value>
```

**Optional OAuth Variables** (leave empty if not using):
```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=
```

> **Note:** Railway automatically provides `PORT` - don't set it manually!

### 4. Deploy

Click **"Deploy"** or push to GitHub to trigger deployment.

### 5. Monitor Deployment

**Deployments → View Logs:**

Look for:
```
✅ Building...
✅ Build succeeded
✅ Starting Container
✅ 🔐 Auth Service ready at http://0.0.0.0:8080
✅ Starting Healthcheck
✅ All replicas are healthy
```

### 6. Get Service URL

Once deployed, Railway provides a public URL:
```
https://authservice-production-xxxx.up.railway.app
```

**Settings → Networking → Public URL** - Copy this URL!

---

## Post-Deployment Configuration

### Update Backend Service

In **Backend** service on Railway:

1. Go to **Settings → Variables**
2. Update or add:
   ```bash
   AUTH_SERVICE_URL=https://authservice-production-xxxx.up.railway.app
   SERVICE_API_KEY=<same-value-as-authservice>
   ```
3. Save and redeploy Backend

### Update Frontend Service

In **Frontend** service on Railway:

1. Go to **Settings → Variables**
2. Add:
   ```bash
   VITE_AUTH_SERVICE_URL=https://authservice-production-xxxx.up.railway.app
   ```
3. Save and redeploy Frontend

### Update LandingPage Service

In **LandingPage** service on Railway:

1. Go to **Settings → Variables**
2. Add:
   ```bash
   VITE_AUTH_SERVICE_URL=https://authservice-production-xxxx.up.railway.app
   ```
3. Save and redeploy LandingPage

### Update AuthService CORS

Once Frontend and Landing are deployed, update AuthService:

1. Go to **AuthService → Settings → Variables**
2. Update `CORS_ORIGIN` to include both:
   ```bash
   CORS_ORIGIN=https://frontend-production-xxxx.up.railway.app,https://landing-production-xxxx.up.railway.app
   ```
3. Save and redeploy AuthService

---

## Verification

### 1. Test Health Endpoint
```bash
curl https://authservice-production-xxxx.up.railway.app/health
```
**Expected response:**
```json
{"status":"ok","service":"auth-service"}
```

### 2. Test Backend Connection

Check Backend logs after redeploying:
```
✅ Auth service connection verified
```

### 3. Test from Backend

Try creating a user or logging in through Backend GraphQL:
- Backend should successfully hash passwords via AuthService
- Backend should receive JWT tokens from AuthService

---

## Troubleshooting

### ❌ Health check failing

**Check:**
- Railway logs for errors
- Environment variables are set (especially JWT secrets)
- Server is binding to `0.0.0.0` (check logs for "ready at http://0.0.0.0:...")

**Fix:**
- Verify all required env vars are set in Railway
- Check for TypeScript compilation errors in build logs

### ❌ Backend can't connect to AuthService

**Check:**
- AUTH_SERVICE_URL in Backend matches AuthService's public URL
- SERVICE_API_KEY matches in both Backend and AuthService
- AuthService logs show incoming requests

**Fix:**
- Update Backend's AUTH_SERVICE_URL with correct Railway URL
- Ensure SERVICE_API_KEY is identical in both services
- Redeploy Backend after updating variables

### ❌ CORS errors in Frontend

**Check:**
- CORS_ORIGIN in AuthService includes Frontend URL
- Frontend is making requests to correct AuthService URL

**Fix:**
- Update CORS_ORIGIN with Frontend's Railway URL
- Ensure VITE_AUTH_SERVICE_URL in Frontend is correct
- Redeploy AuthService after CORS update

---

## Environment Variables Summary

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `PORT` | Auto | `8080` | Railway provides automatically |
| `CORS_ORIGIN` | ✅ | `https://frontend.railway.app` | Frontend URL |
| `JWT_SECRET` | ✅ | `64-char-hex` | Generate with crypto |
| `JWT_EXPIRES_IN` | ✅ | `15m` | Access token lifetime |
| `REFRESH_JWT_SECRET` | ✅ | `64-char-hex` | Generate with crypto |
| `REFRESH_JWT_EXPIRES_IN` | ✅ | `7d` | Refresh token lifetime |
| `SERVICE_API_KEY` | ✅ | `32-char-hex` | Must match Backend |
| `GOOGLE_CLIENT_ID` | ⏸️ | Optional | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ⏸️ | Optional | For Google OAuth |
| `GOOGLE_REDIRECT_URI` | ⏸️ | Optional | For Google OAuth |
| `MICROSOFT_CLIENT_ID` | ⏸️ | Optional | For Microsoft OAuth |
| `MICROSOFT_CLIENT_SECRET` | ⏸️ | Optional | For Microsoft OAuth |
| `MICROSOFT_REDIRECT_URI` | ⏸️ | Optional | For Microsoft OAuth |

---

## Current Deployment Status

- ✅ Backend: Deployed and healthy
- 🔄 Frontend: Deploying with nginx PORT fix
- 🔄 LandingPage: Deploying with nginx PORT fix  
- ⏳ **AuthService: Ready to deploy (this guide)**

---

**Next Steps After This Deployment:**
1. ✅ Deploy AuthService
2. Update Backend AUTH_SERVICE_URL
3. Update Frontend VITE_AUTH_SERVICE_URL
4. Update LandingPage VITE_AUTH_SERVICE_URL
5. Update AuthService CORS_ORIGIN with all frontend URLs
6. Test complete authentication flow

---

**Date:** October 17, 2025  
**Last Updated:** Post nginx PORT fix
