# 🚀 AuthService Production Environment Variables

## Generate Your Secrets First

Run these commands locally to generate secure random secrets:

```bash
# Generate JWT Secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate Refresh JWT Secret
node -e "console.log('REFRESH_JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate Service API Key
node -e "console.log('SERVICE_API_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output and save it** - you'll paste these into Railway!

---

## Railway Environment Variables Template

Copy this template and fill in your generated secrets:

### Required Variables (Set in Railway → AuthService → Variables)

```bash
# CORS Configuration
# For now, use localhost. Update with actual Frontend URL after it's deployed
CORS_ORIGIN=http://localhost:5173

# JWT Configuration
JWT_SECRET=<PASTE_GENERATED_64_CHAR_HEX_HERE>
JWT_EXPIRES_IN=15m

REFRESH_JWT_SECRET=<PASTE_GENERATED_64_CHAR_HEX_HERE>
REFRESH_JWT_EXPIRES_IN=7d

# Service API Key (for Backend <-> AuthService communication)
SERVICE_API_KEY=<PASTE_GENERATED_32_CHAR_HEX_HERE>
```

### Optional OAuth Variables (Leave empty if not using OAuth)

```bash
# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Microsoft OAuth (optional)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=
```

---

## Quick Deployment Steps

### 1. Create Service on Railway
1. Go to your Railway project
2. Click **"+ New"** → **"GitHub Repo"** → Select **ClassEcon**
3. Service name: `AuthService`

### 2. Configure Root Directory
- Go to **Settings → Source**
- Set **Root Directory:** `AuthService`
- Leave **Dockerfile Path** empty (auto-detected)

### 3. Add Environment Variables
- Go to **Settings → Variables**
- Click **"New Variable"** for each variable above
- Paste your generated secrets

### 4. Deploy
- Click **Deploy** or push to trigger deployment
- Monitor logs for: `🔐 Auth Service ready at http://0.0.0.0:8080`

### 5. Get Your AuthService URL
- After deployment, go to **Settings → Networking**
- Copy the **Public URL** (e.g., `https://authservice-production-xxxx.up.railway.app`)

---

## After AuthService Deploys

### Update Backend

In **Backend** service on Railway, add/update:
```bash
AUTH_SERVICE_URL=https://authservice-production-xxxx.up.railway.app
SERVICE_API_KEY=<SAME_VALUE_AS_AUTHSERVICE>
```

### Update Frontend

In **Frontend** service on Railway, add:
```bash
VITE_AUTH_SERVICE_URL=https://authservice-production-xxxx.up.railway.app
```

### Update LandingPage

In **LandingPage** service on Railway, add:
```bash
VITE_AUTH_SERVICE_URL=https://authservice-production-xxxx.up.railway.app
```

### Update AuthService CORS

Once Frontend is deployed, update AuthService:
```bash
CORS_ORIGIN=https://frontend-production-xxxx.up.railway.app,https://landing-production-xxxx.up.railway.app
```

---

## Test After Deployment

```bash
# Test health endpoint
curl https://authservice-production-xxxx.up.railway.app/health

# Expected response:
# {"status":"ok","service":"auth-service"}
```

---

## Files Ready for Deployment

✅ **Dockerfile** - Multi-stage build, optimized for Railway  
✅ **railway.toml** - Health check configured at `/health`  
✅ **src/index.ts** - Server binds to `0.0.0.0` (Railway compatible)  
✅ **tsconfig.json** - CommonJS output  
✅ **package.json** - Build and start scripts configured  

---

## Important Notes

⚠️ **Railway provides PORT automatically** - don't set it manually!  
⚠️ **SERVICE_API_KEY must be identical in Backend and AuthService**  
⚠️ **Update CORS_ORIGIN after Frontend deploys** (initially localhost is OK)  
⚠️ **Keep your secrets secure** - never commit them to git  

---

**Date:** October 17, 2025  
**Status:** ✅ Ready to deploy  
**Documentation:** See `RAILWAY_DEPLOYMENT_CHECKLIST.md` for detailed steps
