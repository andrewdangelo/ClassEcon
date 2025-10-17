# Railway Deployment Guide for ClassEcon

This guide walks you through deploying all three services (Backend, Frontend, Landing Page) to Railway using Docker.

---

## 📋 Prerequisites

1. **Railway Account**: Sign up at https://railway.app
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **MongoDB Atlas**: Set up a production MongoDB database at https://cloud.mongodb.com
4. **Railway CLI** (optional): Install with `npm install -g @railway/cli`

---

## 🚀 Deployment Order

Deploy in this order to get the URLs for environment variables:

1. **Backend** (provides GraphQL API URL)
2. **Frontend** (provides app URL for landing page redirect)
3. **Landing Page** (uses Backend and Frontend URLs)

---

## 1️⃣ Backend Deployment

### Step 1: Create New Project
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your `ClassEcon` repository
4. Click "Add variables" (don't deploy yet)

### Step 2: Configure Environment Variables

Add these variables in Railway:

```bash
# Server
PORT=4000
NODE_ENV=production

# Database - Get from MongoDB Atlas
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/classecon?retryWrites=true&w=majority

# CORS - Will update after deploying Frontend & Landing Page
CORS_ORIGINS=https://your-frontend.railway.app,https://your-landing.railway.app

# URLs - Will update after other services are deployed
FRONTEND_URL=https://your-frontend.railway.app
LANDING_PAGE_URL=https://your-landing.railway.app

# Auth Service - If you have a separate auth service
AUTH_SERVICE_URL=https://your-auth.railway.app

# JWT Secrets - Generate with: openssl rand -base64 32
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=your-production-refresh-secret-min-32-chars
REFRESH_JWT_EXPIRES_IN=7d

# OAuth (if enabled)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/auth/google/callback
```

### Step 3: Configure Deployment Settings
1. Click "Settings" tab
2. Under "Build", set:
   - **Root Directory**: `Backend`
   - **Docker Build**: Enabled (auto-detected from Dockerfile)
3. Under "Deploy", click "Deploy"

### Step 4: Get Backend URL
1. Once deployed, go to "Settings" > "Networking"
2. Click "Generate Domain" 
3. Copy the URL (e.g., `https://backend-production-xxxx.up.railway.app`)
4. **Important**: Save this URL - you'll need it for Frontend & Landing Page

### Step 5: Update CORS (After Frontend & Landing are deployed)
1. Come back here after deploying Frontend and Landing Page
2. Update `CORS_ORIGINS`, `FRONTEND_URL`, and `LANDING_PAGE_URL`
3. Click "Deploy" to restart with new variables

---

## 2️⃣ Frontend Deployment

### Step 1: Create New Service
1. In Railway, click "New" > "GitHub Repo"
2. Select your `ClassEcon` repository
3. Click "Add variables"

### Step 2: Configure Environment Variables

Railway needs build-time variables for Vite:

```bash
# Environment
VITE_NODE_ENV=production

# API - Use the Backend URL from Step 1
VITE_GRAPHQL_URL=https://your-backend.railway.app/graphql
VITE_GRAPHQL_HTTP_URL=https://your-backend.railway.app/graphql
VITE_GRAPHQL_WS_URL=wss://your-backend.railway.app/graphql

# Landing Page - Will update after deploying Landing Page
VITE_LANDING_PAGE_URL=https://your-landing.railway.app

# Auth Service (if separate)
VITE_AUTH_SERVICE_URL=https://your-auth.railway.app

# OAuth (if enabled)
VITE_ENABLE_OAUTH=true
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_OAUTH_REDIRECT_URI=https://your-frontend.railway.app/auth/callback
```

### Step 3: Configure Deployment Settings
1. Click "Settings" tab
2. Under "Build", set:
   - **Root Directory**: `Frontend`
   - **Docker Build**: Enabled
3. Under "Deploy", click "Deploy"

### Step 4: Get Frontend URL
1. Once deployed, go to "Settings" > "Networking"
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://frontend-production-xxxx.up.railway.app`)
4. **Important**: Save this URL for Landing Page and Backend CORS

### Step 5: Update Backend CORS
1. Go back to Backend service
2. Update `CORS_ORIGINS` to include this Frontend URL
3. Update `FRONTEND_URL` variable
4. Redeploy Backend

---

## 3️⃣ Landing Page Deployment

### Step 1: Create New Service
1. In Railway, click "New" > "GitHub Repo"
2. Select your `ClassEcon` repository
3. Click "Add variables"

### Step 2: Configure Environment Variables

```bash
# Environment
VITE_NODE_ENV=production

# API - Use Backend URL from Step 1
VITE_GRAPHQL_URL=https://your-backend.railway.app/graphql

# Frontend - Use Frontend URL from Step 2
VITE_FRONTEND_URL=https://your-frontend.railway.app
```

### Step 3: Configure Deployment Settings
1. Click "Settings" tab
2. Under "Build", set:
   - **Root Directory**: `LandingPage`
   - **Docker Build**: Enabled
3. Under "Deploy", click "Deploy"

### Step 4: Get Landing Page URL
1. Once deployed, go to "Settings" > "Networking"
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://landing-production-xxxx.up.railway.app`)

### Step 5: Final Updates
1. **Update Backend**: Add Landing Page URL to `CORS_ORIGINS` and `LANDING_PAGE_URL`
2. **Update Frontend**: Add Landing Page URL to `VITE_LANDING_PAGE_URL`
3. Redeploy both services

---

## 🔧 MongoDB Atlas Setup

### Create Production Database

1. Go to https://cloud.mongodb.com
2. Create a new cluster (or use existing)
3. Click "Database Access" > "Add New Database User"
   - Username: `classecon-prod`
   - Password: Generate a strong password
   - Roles: `readWrite` to your database
4. Click "Network Access" > "Add IP Address"
   - **Important**: Railway uses dynamic IPs, so add `0.0.0.0/0` (allow from anywhere)
   - Or use Railway's IP whitelist if they provide static IPs
5. Click "Connect" > "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database password
8. Add to Backend's `DATABASE_URL` variable

---

## 🎯 Generate Beta Access Codes

After Backend is deployed, create beta codes:

### Option 1: Using Railway Shell
1. Go to Backend service in Railway
2. Click "Settings" > "Deployments"
3. Click on latest deployment > "View Logs"
4. You can't run commands directly, so use Option 2

### Option 2: Temporarily add a mutation endpoint
Create codes using GraphQL Playground at `https://your-backend.railway.app/graphql`:

```graphql
mutation {
  createBetaCode(
    code: "LAUNCH2025"
    description: "Production launch beta access"
    maxUses: 100
    expiresAt: "2025-12-31T23:59:59Z"
  ) {
    success
    message
    code {
      code
      currentUses
      maxUses
      isActive
    }
  }
}
```

---

## ✅ Post-Deployment Checklist

### Verify Backend
- [ ] Visit `https://your-backend.railway.app/graphql`
- [ ] Should see Apollo GraphQL Playground
- [ ] Test a simple query: `{ __typename }`

### Verify Frontend
- [ ] Visit `https://your-frontend.railway.app`
- [ ] Should show beta access guard
- [ ] Should redirect to landing page if no code

### Verify Landing Page
- [ ] Visit `https://your-landing.railway.app`
- [ ] Click "Sign In" or "Get Started"
- [ ] Enter a valid beta code
- [ ] Should redirect to `https://your-frontend.railway.app/auth?betaCode=YOURCODE`
- [ ] Frontend should validate and grant access

### Test Beta Access Flow
1. Generate a beta code (see above)
2. Visit landing page
3. Enter beta code
4. Verify redirect to frontend with code in URL
5. Verify frontend validates code with backend
6. Verify access granted

### Monitor Services
- [ ] Check Railway logs for each service
- [ ] Verify no errors in deployment logs
- [ ] Check MongoDB Atlas for connections
- [ ] Verify CORS works (no CORS errors in browser console)

---

## 🔍 Troubleshooting

### Issue: Build Fails

**Backend:**
```bash
# Check logs in Railway
# Common issues:
# - Missing dependencies in package.json
# - TypeScript compilation errors
# - Node version mismatch
```

**Frontend/Landing:**
```bash
# Common issues:
# - Missing environment variables during build
# - Vite build errors
# - nginx configuration issues
```

**Solution:**
- Check deployment logs in Railway
- Verify all environment variables are set
- Test build locally: `docker build -t test .`

### Issue: CORS Errors

**Symptom:** Browser console shows CORS errors

**Solution:**
1. Verify Backend `CORS_ORIGINS` includes exact Frontend and Landing URLs
2. No trailing slashes in URLs
3. Use `https://` not `http://` in production
4. Redeploy Backend after changing CORS settings

### Issue: Environment Variables Not Working

**Frontend/Landing (Vite apps):**
- Environment variables must be prefixed with `VITE_`
- They are **baked into the build** - must rebuild to change them
- Railway automatically passes variables as build args

**Backend:**
- Loaded at runtime from Railway environment
- No rebuild needed - just redeploy

### Issue: Beta Code Not Working

**Check:**
1. Backend logs for validation errors
2. Network tab in browser for failed API calls
3. Verify GraphQL URL is correct
4. Test GraphQL endpoint directly

### Issue: MongoDB Connection Failed

**Check:**
1. Connection string is correct
2. Password is URL-encoded (special characters)
3. IP address `0.0.0.0/0` is whitelisted in MongoDB Atlas
4. Database user has correct permissions
5. Backend logs show connection attempt

---

## 🌐 Custom Domains (Optional)

### Add Custom Domains in Railway

1. Go to each service > "Settings" > "Networking"
2. Click "Custom Domain"
3. Enter your domain (e.g., `api.classecon.com`)
4. Add the CNAME record to your DNS provider
5. Wait for DNS propagation (can take up to 48 hours)

**Recommended domains:**
- Backend: `api.classecon.com`
- Frontend: `app.classecon.com`
- Landing: `classecon.com` or `www.classecon.com`

After adding custom domains:
1. Update all environment variables to use new domains
2. Update `CORS_ORIGINS` in Backend
3. Update `VITE_*` variables in Frontend and Landing
4. Redeploy all services

---

## 💰 Railway Pricing Notes

- **Free Tier**: $5 of free usage per month
- **Hobby Plan**: $5/month per project (recommended for production)
- **Charges**: Based on usage (CPU, memory, network)
- **Estimate**: ~$5-20/month for all three services with light traffic

**Cost Optimization:**
- Use free MongoDB Atlas tier (512 MB storage)
- Scale down resources during low traffic
- Monitor usage in Railway dashboard

---

## 📊 Monitoring & Logs

### View Logs in Railway
1. Go to service > "Deployments"
2. Click on latest deployment
3. "View Logs"

### Set Up Alerts
1. Railway doesn't have built-in alerts yet
2. Use external monitoring:
   - UptimeRobot (free uptime monitoring)
   - Sentry (error tracking)
   - LogRocket (session replay)

---

## 🔄 Redeployment

### Trigger Redeploy
1. Push to GitHub (auto-deploys if connected)
2. Or click "Deploy" in Railway service settings
3. Or use Railway CLI: `railway up`

### Rolling Back
1. Go to "Deployments"
2. Find previous successful deployment
3. Click "Redeploy"

---

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/

---

## 🎉 Success!

Once all three services are deployed and verified:

1. Your Backend should be serving GraphQL API
2. Your Frontend should be accessible and protected by beta access
3. Your Landing Page should redirect to Frontend after beta code validation
4. All services should communicate correctly with environment variables

**Your ClassEcon app is now live in production!** 🚀

---

## Quick Reference - Environment Variables

### Backend
```bash
PORT=4000
NODE_ENV=production
DATABASE_URL=mongodb+srv://...
CORS_ORIGINS=https://frontend.railway.app,https://landing.railway.app
FRONTEND_URL=https://frontend.railway.app
LANDING_PAGE_URL=https://landing.railway.app
AUTH_SERVICE_URL=https://auth.railway.app
JWT_SECRET=secret32chars
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=refresh32chars
REFRESH_JWT_EXPIRES_IN=7d
```

### Frontend
```bash
VITE_NODE_ENV=production
VITE_GRAPHQL_URL=https://backend.railway.app/graphql
VITE_GRAPHQL_HTTP_URL=https://backend.railway.app/graphql
VITE_GRAPHQL_WS_URL=wss://backend.railway.app/graphql
VITE_LANDING_PAGE_URL=https://landing.railway.app
VITE_AUTH_SERVICE_URL=https://auth.railway.app
```

### Landing Page
```bash
VITE_NODE_ENV=production
VITE_GRAPHQL_URL=https://backend.railway.app/graphql
VITE_FRONTEND_URL=https://frontend.railway.app
```
