# 🚂 Railway Deployment - Quick Start

> **Status**: ✅ PRODUCTION READY  
> **Last Updated**: October 17, 2025

Your ClassEcon monorepo is fully configured and ready to deploy to Railway!

---

## 📋 Pre-Flight Checklist

Run the verification script:

**Linux/Mac:**
```bash
bash verify-railway-ready.sh
```

**Windows:**
```bash
verify-railway-ready.bat
```

You should see: ✅ **ALL CHECKS PASSED!**

---

## 🚀 Deploy in 3 Steps

### Step 1: Prepare Secrets

Generate your secrets:

```bash
# Generate 3 secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # REFRESH_JWT_SECRET
openssl rand -base64 32  # SERVICE_API_KEY
```

Save these - you'll need them for **all services**.

### Step 2: Set Up MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string

### Step 3: Deploy to Railway

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Railway deployment ready"
   git push origin main
   ```

2. **Go to Railway**: https://railway.app

3. **Create New Project** → "Deploy from GitHub repo" → Select `ClassEcon`

4. **Deploy services in this order:**
   
   #### a) AuthService (Optional)
   - Root Directory: `AuthService`
   - Add environment variables (see below)
   - Generate domain → Save URL
   
   #### b) Backend
   - Root Directory: `Backend`
   - Add environment variables (see below)
   - Generate domain → Save URL
   
   #### c) Frontend
   - Root Directory: `Frontend`
   - Add environment variables (see below)
   - Generate domain → Save URL
   
   #### d) LandingPage
   - Root Directory: `LandingPage`
   - Add environment variables (see below)
   - Generate domain

5. **Update URLs**
   - Go back to Backend → Update `CORS_ORIGINS`, `FRONTEND_URL`, `LANDING_PAGE_URL`
   - Go back to Frontend → Update `VITE_LANDING_PAGE_URL`
   - Redeploy affected services

---

## 🔐 Environment Variables

### Backend
```bash
PORT=4000
NODE_ENV=production
DATABASE_URL=mongodb+srv://...  # From MongoDB Atlas
CORS_ORIGINS=https://frontend.railway.app,https://landing.railway.app  # Update after deployment
FRONTEND_URL=https://frontend.railway.app  # Update after deployment
LANDING_PAGE_URL=https://landing.railway.app  # Update after deployment
AUTH_SERVICE_URL=https://auth.railway.app  # Update after deployment
JWT_SECRET=<your-generated-secret-1>
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=<your-generated-secret-2>
REFRESH_JWT_EXPIRES_IN=7d
SERVICE_API_KEY=<your-generated-secret-3>
```

### Frontend
```bash
VITE_NODE_ENV=production
VITE_GRAPHQL_URL=https://backend.railway.app/graphql  # Update with Backend URL
VITE_GRAPHQL_HTTP_URL=https://backend.railway.app/graphql
VITE_GRAPHQL_WS_URL=wss://backend.railway.app/graphql
VITE_LANDING_PAGE_URL=https://landing.railway.app  # Update after deployment
VITE_AUTH_SERVICE_URL=https://auth.railway.app  # Update with AuthService URL
```

### LandingPage
```bash
VITE_NODE_ENV=production
VITE_GRAPHQL_URL=https://backend.railway.app/graphql  # Update with Backend URL
VITE_FRONTEND_URL=https://frontend.railway.app  # Update with Frontend URL
```

### AuthService
```bash
PORT=4001
NODE_ENV=production
CORS_ORIGIN=https://frontend.railway.app  # Update with Frontend URL
JWT_SECRET=<same-as-backend>
REFRESH_JWT_SECRET=<same-as-backend>
SERVICE_API_KEY=<same-as-backend>
```

---

## ✅ Verify Deployment

After deploying all services:

1. **Backend**: Visit `https://your-backend.railway.app/graphql`
   - Should see Apollo GraphQL Playground

2. **Frontend**: Visit `https://your-frontend.railway.app`
   - Should load without errors
   - Check browser console (no CORS errors)

3. **Landing**: Visit `https://your-landing.railway.app`
   - Should load without errors
   - Test beta access flow

4. **End-to-End Test**:
   - Generate beta code via Backend GraphQL
   - Visit Landing Page
   - Enter beta code
   - Should redirect to Frontend
   - Should grant access

---

## 📚 Full Documentation

| Document | Description |
|----------|-------------|
| **RAILWAY_DEPLOYMENT_GUIDE.md** | 📖 Complete step-by-step guide (40+ pages) |
| **RAILWAY_MONOREPO_CHECKLIST.md** | ✅ Comprehensive verification checklist |
| **DEPLOYMENT_READY_SUMMARY.md** | 📊 Status overview and quick reference |
| **DOCKER_RAILWAY_READY.md** | 🐳 Docker architecture details |

---

## 💡 Pro Tips

- **Test Docker locally first**: `docker build -t test ./Backend`
- **Deploy one service at a time**: Don't rush
- **Save all URLs**: You'll need them for env vars
- **Monitor Railway logs**: Watch for errors
- **Use Railway CLI**: `npm install -g @railway/cli`

---

## 🚨 Common Issues

### CORS Errors
**Problem**: Browser shows CORS policy blocked

**Solution**:
1. Update Backend `CORS_ORIGINS` with exact Frontend and Landing URLs
2. No trailing slashes
3. Use `https://` not `http://`
4. Redeploy Backend

### Environment Variables Not Working
**Problem**: Frontend shows undefined for API URLs

**Solution**:
1. Vite bakes env vars at build time
2. Must rebuild/redeploy to apply changes
3. Verify variables start with `VITE_`

### MongoDB Connection Failed
**Problem**: Backend can't connect to database

**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check MongoDB Atlas IP whitelist (`0.0.0.0/0`)
3. URL-encode password if it has special characters

---

## 💰 Pricing

- **Free Tier**: $5 credit/month
- **Hobby Plan**: $5/month (recommended for production)
- **Estimated Cost**: $10-25/month for all 4 services

---

## 🎯 Success Criteria

✅ All 4 services deployed and running  
✅ All domains generated  
✅ Backend GraphQL endpoint accessible  
✅ Frontend loads without errors  
✅ Landing page loads and redirects work  
✅ No CORS errors  
✅ Beta access flow works  
✅ Users can create accounts and log in  

---

## 📞 Need Help?

- **Detailed Guide**: `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **MongoDB Docs**: https://docs.atlas.mongodb.com

---

## 🎉 You're Ready!

Everything is configured. Just follow the 3 steps above and you'll be live in 30-60 minutes!

**Good luck! 🚀**

---

**Files Created for Railway Deployment:**
- ✅ 4 Dockerfiles (Backend, Frontend, Landing, Auth)
- ✅ 4 .dockerignore files
- ✅ 2 nginx.conf files (Frontend, Landing)
- ✅ docker-compose.yml
- ✅ Complete documentation
- ✅ Verification scripts

**Status**: 🟢 PRODUCTION READY
