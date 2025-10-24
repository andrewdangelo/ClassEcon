# Railway Monorepo Deployment - Readiness Checklist ✅

This checklist ensures your ClassEcon monorepo is fully ready for Railway deployment.

---

## 📋 Pre-Deployment Checklist

### ✅ Repository Structure
- [x] Monorepo structure with separate service directories
  - [x] `Backend/` - GraphQL backend service
  - [x] `Frontend/` - React frontend application
  - [x] `LandingPage/` - Marketing landing page
  - [x] `AuthService/` - Authentication microservice
- [x] Root-level documentation
- [x] `docker-compose.yml` for local development

### ✅ Docker Configuration

#### Backend
- [x] `Backend/Dockerfile` - Multi-stage build with TypeScript compilation
- [x] `Backend/.dockerignore` - Excludes node_modules, .env, etc.
- [x] `Backend/package.json` - Has `build` and `start` scripts
- [x] Port 4000 exposed in Dockerfile
- [x] Production dependencies properly configured

#### Frontend
- [x] `Frontend/Dockerfile` - Multi-stage build with Vite + nginx
- [x] `Frontend/.dockerignore` - Excludes node_modules, .env, etc.
- [x] `Frontend/nginx.conf` - SPA routing configured
- [x] `Frontend/package.json` - Has `build` script
- [x] Port 80 exposed in Dockerfile
- [x] Build args for VITE_* environment variables

#### LandingPage
- [x] `LandingPage/Dockerfile` - Multi-stage build with Vite + nginx
- [x] `LandingPage/.dockerignore` - Excludes node_modules, .env, etc.
- [x] `LandingPage/nginx.conf` - SPA routing configured
- [x] `LandingPage/package.json` - Has `build` script
- [x] Port 80 exposed in Dockerfile
- [x] Build args for VITE_* environment variables

#### AuthService
- [x] `AuthService/Dockerfile` - Production build configuration
- [x] `AuthService/.dockerignore` - Excludes node_modules, .env, etc.
- [x] `AuthService/package.json` - Has `build` and `start` scripts
- [x] Port 4001 exposed in Dockerfile
- [x] Health check configured

### ✅ Package.json Scripts

#### Backend
```json
✅ "build": "tsc -p tsconfig.json"
✅ "start": "node dist/index.js"
✅ "dev": "tsx watch src/index.ts"
```

#### Frontend
```json
✅ "build": "vite build"
✅ "dev": "vite"
```

#### LandingPage
```json
✅ "build": "vite build"
✅ "dev": "vite"
```

#### AuthService
```json
✅ "build": "tsc -p tsconfig.json"
✅ "start": "node dist/index.js"
✅ "dev": "tsx watch src/index.ts"
```

### ✅ Environment Variables Documentation
- [x] Environment variables documented in `RAILWAY_DEPLOYMENT_GUIDE.md`
- [x] Backend environment variables listed
- [x] Frontend environment variables listed (VITE_* prefixed)
- [x] LandingPage environment variables listed (VITE_* prefixed)
- [x] AuthService environment variables listed
- [x] OAuth configuration documented

### ✅ Documentation
- [x] `RAILWAY_DEPLOYMENT_GUIDE.md` - Complete step-by-step guide
- [x] `DOCKER_RAILWAY_READY.md` - Docker configuration summary
- [x] `README.md` - Project overview and quick start
- [x] Environment variable templates provided
- [x] Troubleshooting section included

---

## 🚀 Railway Deployment Requirements

### Service Configuration Summary

| Service | Root Directory | Dockerfile | Port | Build Tool |
|---------|---------------|------------|------|------------|
| Backend | `Backend` | ✅ | 4000 | Docker |
| Frontend | `Frontend` | ✅ | 80 | Docker |
| LandingPage | `LandingPage` | ✅ | 80 | Docker |
| AuthService | `AuthService` | ✅ | 4001 | Docker |

### Required Environment Variables

#### Backend (Production)
```bash
# Core
✅ PORT=4000
✅ NODE_ENV=production
✅ DATABASE_URL=mongodb+srv://...

# CORS & URLs
✅ CORS_ORIGINS=https://frontend.railway.app,https://landing.railway.app
✅ FRONTEND_URL=https://frontend.railway.app
✅ LANDING_PAGE_URL=https://landing.railway.app
✅ AUTH_SERVICE_URL=https://auth.railway.app

# JWT Secrets
✅ JWT_SECRET=<generate-32-char-secret>
✅ JWT_EXPIRES_IN=15m
✅ REFRESH_JWT_SECRET=<generate-32-char-secret>
✅ REFRESH_JWT_EXPIRES_IN=7d

# Service Authentication
✅ SERVICE_API_KEY=<generate-secret>

# OAuth (Optional)
⚠️  GOOGLE_CLIENT_ID=<from-google-console>
⚠️  GOOGLE_CLIENT_SECRET=<from-google-console>
⚠️  GOOGLE_CALLBACK_URL=https://backend.railway.app/auth/google/callback
```

#### Frontend (Production)
```bash
# Environment
✅ VITE_NODE_ENV=production

# API URLs
✅ VITE_GRAPHQL_URL=https://backend.railway.app/graphql
✅ VITE_GRAPHQL_HTTP_URL=https://backend.railway.app/graphql
✅ VITE_GRAPHQL_WS_URL=wss://backend.railway.app/graphql

# Service URLs
✅ VITE_LANDING_PAGE_URL=https://landing.railway.app
✅ VITE_AUTH_SERVICE_URL=https://auth.railway.app

# OAuth (Optional)
⚠️  VITE_ENABLE_OAUTH=true
⚠️  VITE_GOOGLE_CLIENT_ID=<from-google-console>
⚠️  VITE_OAUTH_REDIRECT_URI=https://frontend.railway.app/auth/callback
```

#### LandingPage (Production)
```bash
# Environment
✅ VITE_NODE_ENV=production

# API URL
✅ VITE_GRAPHQL_URL=https://backend.railway.app/graphql

# Frontend URL
✅ VITE_FRONTEND_URL=https://frontend.railway.app
```

#### AuthService (Production)
```bash
# Core
✅ PORT=4001
✅ NODE_ENV=production

# CORS
✅ CORS_ORIGIN=https://frontend.railway.app

# JWT Secrets (same as Backend)
✅ JWT_SECRET=<same-as-backend>
✅ REFRESH_JWT_SECRET=<same-as-backend>

# Service Authentication
✅ SERVICE_API_KEY=<same-as-backend>

# OAuth (Optional)
⚠️  GOOGLE_CLIENT_ID=<from-google-console>
⚠️  GOOGLE_CLIENT_SECRET=<from-google-console>
⚠️  GOOGLE_CALLBACK_URL=https://auth.railway.app/auth/google/callback
```

---

## 🔐 Security Checklist

### Secrets Generation
- [ ] Generate JWT_SECRET: `openssl rand -base64 32`
- [ ] Generate REFRESH_JWT_SECRET: `openssl rand -base64 32`
- [ ] Generate SERVICE_API_KEY: `openssl rand -base64 32`
- [ ] Set up Google OAuth credentials (if using OAuth)
- [ ] Set up Microsoft OAuth credentials (if using OAuth)

### MongoDB Setup
- [ ] Create MongoDB Atlas cluster
- [ ] Create database user with strong password
- [ ] Whitelist Railway IPs (use 0.0.0.0/0 for Railway)
- [ ] Get connection string
- [ ] Test connection from local machine

### CORS Configuration
- [ ] Backend CORS includes Frontend URL
- [ ] Backend CORS includes Landing Page URL
- [ ] AuthService CORS includes Frontend URL
- [ ] No trailing slashes in URLs
- [ ] Use HTTPS in production

---

## 📦 Deployment Order

Deploy services in this specific order to avoid missing environment variables:

### 1️⃣ AuthService (if using separate auth)
```
Reason: Backend and Frontend need AUTH_SERVICE_URL
Root Directory: AuthService
Environment: Set all AuthService env vars
Generate Domain: Save URL for Backend and Frontend
```

### 2️⃣ Backend
```
Reason: Frontend and Landing need GRAPHQL_URL
Root Directory: Backend
Environment: Set DATABASE_URL, JWT secrets, temp CORS_ORIGINS
Generate Domain: Save URL for Frontend and Landing
```

### 3️⃣ Frontend
```
Reason: Landing Page needs FRONTEND_URL
Root Directory: Frontend
Environment: Set VITE_GRAPHQL_URL, VITE_AUTH_SERVICE_URL
Generate Domain: Save URL for Landing and update Backend CORS
```

### 4️⃣ LandingPage
```
Reason: Final service in the chain
Root Directory: LandingPage
Environment: Set VITE_GRAPHQL_URL, VITE_FRONTEND_URL
Generate Domain: Update Backend and Frontend env vars
```

### 5️⃣ Update All Services
```
Update Backend:
- CORS_ORIGINS with Frontend and Landing URLs
- FRONTEND_URL with actual URL
- LANDING_PAGE_URL with actual URL

Update Frontend:
- VITE_LANDING_PAGE_URL with actual URL

Redeploy all services
```

---

## ✅ Post-Deployment Verification

### Backend Health Checks
- [ ] Visit `https://your-backend.railway.app/graphql`
- [ ] Apollo GraphQL Playground loads
- [ ] Run test query: `{ __typename }`
- [ ] Check logs for errors
- [ ] Verify MongoDB connection in logs

### AuthService Health Checks (if deployed)
- [ ] Visit `https://your-auth.railway.app/health`
- [ ] Should return `{"status":"ok"}`
- [ ] Check logs for errors

### Frontend Health Checks
- [ ] Visit `https://your-frontend.railway.app`
- [ ] Page loads without errors
- [ ] Beta access guard appears (if enabled)
- [ ] Check browser console for errors
- [ ] Check browser console for CORS errors (should be none)
- [ ] Test beta code flow

### Landing Page Health Checks
- [ ] Visit `https://your-landing.railway.app`
- [ ] Page loads without errors
- [ ] Click "Get Started" or "Sign In"
- [ ] Beta access modal appears
- [ ] Enter beta code and test redirect
- [ ] Should redirect to Frontend with code in URL

### End-to-End Testing
- [ ] Generate beta code via GraphQL
- [ ] Visit Landing Page
- [ ] Enter beta code
- [ ] Redirected to Frontend
- [ ] Beta code validated
- [ ] Access granted to app
- [ ] Can create account
- [ ] Can log in
- [ ] Can perform basic operations

### Performance Checks
- [ ] All pages load in < 3 seconds
- [ ] No memory leaks in Railway logs
- [ ] GraphQL queries respond quickly
- [ ] WebSocket connections work (if using subscriptions)

---

## 🐛 Common Issues & Solutions

### Issue: Build Fails

**Frontend/Landing:**
```
Error: Missing environment variables during build

Solution:
1. Verify all VITE_* variables are set in Railway
2. Check variable names (must start with VITE_)
3. Redeploy to rebuild with correct env vars
```

**Backend:**
```
Error: TypeScript compilation errors

Solution:
1. Test build locally: cd Backend && pnpm build
2. Fix TypeScript errors
3. Push changes and redeploy
```

### Issue: CORS Errors

```
Browser console: CORS policy blocked

Solution:
1. Check Backend CORS_ORIGINS includes Frontend URL
2. Check Backend CORS_ORIGINS includes Landing URL
3. Verify no trailing slashes
4. Ensure URLs use https:// not http://
5. Redeploy Backend
```

### Issue: Environment Variables Not Applied

```
Frontend shows undefined for API URLs

Solution:
1. Vite bakes env vars at build time
2. Must rebuild/redeploy to apply changes
3. Verify variables are prefixed with VITE_
4. Check Railway build logs for env vars
```

### Issue: MongoDB Connection Failed

```
Backend logs: MongoError: connection refused

Solution:
1. Verify DATABASE_URL is correct
2. Check MongoDB Atlas IP whitelist (0.0.0.0/0)
3. Verify database user has correct permissions
4. URL-encode password special characters
5. Test connection string locally
```

### Issue: Service Can't Communicate

```
Frontend can't reach Backend

Solution:
1. Check VITE_GRAPHQL_URL is set correctly
2. Verify Backend is deployed and running
3. Check Backend logs for errors
4. Test GraphQL endpoint directly in browser
5. Verify CORS is configured correctly
```

---

## 💰 Cost Estimation

### Railway Pricing
- **Free Tier**: $5 credit/month
- **Hobby Plan**: $5/month (recommended)
- **Usage-based**: CPU, memory, network

### Estimated Monthly Costs
- **4 Services** (Backend, Frontend, Landing, Auth): $10-25/month
- **MongoDB Atlas Free Tier**: $0/month (512MB)
- **Total**: ~$10-25/month for light-moderate traffic

### Cost Optimization Tips
- Use MongoDB Atlas free tier
- Enable auto-scaling
- Monitor usage in Railway dashboard
- Scale down during low traffic periods
- Use Railway's free tier for development

---

## 📊 Monitoring & Observability

### Railway Built-in
- [ ] View deployment logs
- [ ] Monitor resource usage
- [ ] Track costs
- [ ] Set up usage alerts

### External Services (Optional)
- [ ] **Uptime Monitoring**: UptimeRobot (free)
- [ ] **Error Tracking**: Sentry
- [ ] **Analytics**: Google Analytics
- [ ] **APM**: New Relic or Datadog

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ All 4 services deployed and running
- ✅ All services have generated domains
- ✅ Backend GraphQL Playground accessible
- ✅ Frontend loads and shows beta access guard
- ✅ Landing page loads and redirects work
- ✅ No CORS errors in browser console
- ✅ MongoDB connected (check Backend logs)
- ✅ Beta access flow works end-to-end
- ✅ Users can create accounts and log in
- ✅ GraphQL queries/mutations work
- ✅ All service-to-service communication works

---

## 📚 Additional Resources

- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html

---

## 🎉 Ready to Deploy!

### Your monorepo includes:
✅ 4 production-ready Dockerfiles  
✅ Optimized multi-stage builds  
✅ nginx configurations for SPAs  
✅ Complete documentation  
✅ Environment variable templates  
✅ Troubleshooting guides  
✅ Security best practices  

### Next Steps:
1. ✅ Review this checklist
2. 📝 Generate JWT secrets
3. 🗄️ Set up MongoDB Atlas
4. 🚀 Follow `RAILWAY_DEPLOYMENT_GUIDE.md`
5. 🧪 Test each service after deployment
6. 🎯 Verify end-to-end functionality

---

**Your ClassEcon monorepo is Railway-ready! 🚀**

Follow the step-by-step guide in `RAILWAY_DEPLOYMENT_GUIDE.md` to deploy.

---

## Quick Reference Commands

```bash
# Generate JWT secrets
openssl rand -base64 32

# Test Docker build locally
cd Backend && docker build -t classecon-backend .
cd Frontend && docker build --build-arg VITE_GRAPHQL_URL=http://localhost:4000/graphql -t classecon-frontend .
cd LandingPage && docker build --build-arg VITE_GRAPHQL_URL=http://localhost:4000/graphql --build-arg VITE_FRONTEND_URL=http://localhost:5173 -t classecon-landing .
cd AuthService && docker build -t classecon-auth .

# Run containers locally
docker run -p 4000:4000 --env-file Backend/.env classecon-backend
docker run -p 80:80 classecon-frontend
docker run -p 80:80 classecon-landing
docker run -p 4001:4001 --env-file AuthService/.env classecon-auth

# Install Railway CLI
npm install -g @railway/cli

# Deploy with Railway CLI (from each service directory)
railway up
```

---

**Last Updated**: October 17, 2025  
**Status**: ✅ Production Ready
