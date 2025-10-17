# 🚨 Railway Monorepo Setup - IMPORTANT

## The Problem You're Experiencing

Railway is trying to deploy from the **root directory** of your monorepo, but it can't determine which service to build because there's no package.json or Dockerfile at the root level.

## ✅ The Solution

Railway requires you to create **separate services** for each part of your monorepo, each with its own **Root Directory** configuration.

---

## 🎯 Correct Railway Setup Process

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Click **"Empty Project"** (don't use "Deploy from GitHub repo" directly)
4. Give your project a name (e.g., "ClassEcon")

### Step 2: Add Services One by One

You need to add **4 separate services** to your Railway project:

#### Service 1: Backend

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose your `ClassEcon` repository
4. Click **"Add Service"**

**CRITICAL CONFIGURATION:**

1. Click on the service (it will be named after your repo)
2. Go to **Settings**
3. Under **"Source"** section, find **"Root Directory"**
4. Set it to: `Backend`
5. Under **"Build"** section:
   - Builder should auto-detect as **Docker**
   - If not, the `railway.toml` file will force it
6. Go to **Variables** tab and add environment variables (see below)
7. Go to **Settings** > **Networking** > **Generate Domain**

#### Service 2: Frontend

1. In your Railway project, click **"+ New"** again
2. Select **"GitHub Repo"**
3. Choose your `ClassEcon` repository again (yes, same repo!)
4. Click **"Add Service"**

**CRITICAL CONFIGURATION:**

1. Click on the new service
2. Go to **Settings**
3. Under **"Source"** section, find **"Root Directory"**
4. Set it to: `Frontend`
5. Builder should auto-detect as **Docker**
6. Go to **Variables** tab and add environment variables
7. Go to **Settings** > **Networking** > **Generate Domain**

#### Service 3: LandingPage

1. In your Railway project, click **"+ New"** again
2. Select **"GitHub Repo"**
3. Choose your `ClassEcon` repository again
4. Click **"Add Service"**

**CRITICAL CONFIGURATION:**

1. Click on the new service
2. Go to **Settings**
3. Under **"Source"** section, find **"Root Directory"**
4. Set it to: `LandingPage`
5. Builder should auto-detect as **Docker**
6. Go to **Variables** tab and add environment variables
7. Go to **Settings** > **Networking** > **Generate Domain**

#### Service 4: AuthService (Optional)

1. In your Railway project, click **"+ New"** again
2. Select **"GitHub Repo"**
3. Choose your `ClassEcon` repository again
4. Click **"Add Service"**

**CRITICAL CONFIGURATION:**

1. Click on the new service
2. Go to **Settings**
3. Under **"Source"** section, find **"Root Directory"**
4. Set it to: `AuthService`
5. Builder should auto-detect as **Docker**
6. Go to **Variables** tab and add environment variables
7. Go to **Settings** > **Networking** > **Generate Domain**

---

## 📸 Visual Guide

Your Railway project should look like this:

```
ClassEcon Project
├── Service: Backend (Root: Backend/)
├── Service: Frontend (Root: Frontend/)
├── Service: LandingPage (Root: LandingPage/)
└── Service: AuthService (Root: AuthService/)
```

Each service is built from the **same GitHub repository** but with a **different root directory**.

---

## 🔧 What the railway.toml Files Do

I've created `railway.toml` files in each service directory. These files:

1. **Tell Railway to use Docker** instead of trying to auto-detect
2. **Specify the Dockerfile path** (relative to the root directory)
3. **Configure health checks** for each service
4. **Set restart policies**

Railway will automatically detect and use these files.

---

## 🎯 Step-by-Step Fix for Your Current Issue

### Option A: Start Fresh (Recommended)

1. **Delete your current Railway deployment**
2. **Create a new empty project** in Railway
3. **Follow the steps above** to add 4 separate services
4. **Set the Root Directory** for each service
5. **Add environment variables**
6. **Deploy**

### Option B: Fix Existing Service

If you already have a service created:

1. Click on the service in Railway
2. Go to **Settings**
3. Scroll to **"Source"** section
4. Find **"Root Directory"**
5. Enter one of: `Backend`, `Frontend`, `LandingPage`, or `AuthService`
6. Click **"Save"**
7. Go back and trigger a redeploy

---

## 📋 Environment Variables Quick Reference

### Backend
```bash
PORT=4000
NODE_ENV=production
DATABASE_URL=mongodb+srv://...
CORS_ORIGINS=https://your-frontend.railway.app,https://your-landing.railway.app
FRONTEND_URL=https://your-frontend.railway.app
LANDING_PAGE_URL=https://your-landing.railway.app
AUTH_SERVICE_URL=https://your-auth.railway.app
JWT_SECRET=<generate-with-openssl>
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=<generate-with-openssl>
REFRESH_JWT_EXPIRES_IN=7d
SERVICE_API_KEY=<generate-with-openssl>
```

### Frontend
```bash
VITE_NODE_ENV=production
VITE_GRAPHQL_URL=https://your-backend.railway.app/graphql
VITE_GRAPHQL_HTTP_URL=https://your-backend.railway.app/graphql
VITE_GRAPHQL_WS_URL=wss://your-backend.railway.app/graphql
VITE_LANDING_PAGE_URL=https://your-landing.railway.app
VITE_AUTH_SERVICE_URL=https://your-auth.railway.app
```

### LandingPage
```bash
VITE_NODE_ENV=production
VITE_GRAPHQL_URL=https://your-backend.railway.app/graphql
VITE_FRONTEND_URL=https://your-frontend.railway.app
```

### AuthService
```bash
PORT=4001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.railway.app
JWT_SECRET=<same-as-backend>
REFRESH_JWT_SECRET=<same-as-backend>
SERVICE_API_KEY=<same-as-backend>
```

---

## ✅ Verification Checklist

After setting up all services:

- [ ] 4 services created in Railway project
- [ ] Each service has correct Root Directory set
- [ ] Each service shows "Builder: Docker" in settings
- [ ] All environment variables added
- [ ] All services have generated domains
- [ ] All services deployed successfully

---

## 🚨 Common Mistakes to Avoid

1. ❌ **Don't deploy from root** - Always set Root Directory
2. ❌ **Don't create 4 different Railway projects** - Create 1 project with 4 services
3. ❌ **Don't forget to set Root Directory** - This is the most critical step
4. ❌ **Don't skip railway.toml files** - They ensure Docker is used

---

## 🎯 Quick Fix Command

If you need to recreate the railway.toml files:

```bash
# Already done! Files are created at:
# - Backend/railway.toml
# - Frontend/railway.toml
# - LandingPage/railway.toml
# - AuthService/railway.toml
```

---

## 📞 Still Having Issues?

### Railway Support
- **Docs**: https://docs.railway.app/deploy/deployments
- **Discord**: https://discord.gg/railway
- **Monorepo Guide**: https://docs.railway.app/deploy/monorepos

### Debug Steps
1. Check Railway logs for the service
2. Verify Root Directory is set correctly
3. Verify railway.toml exists in the directory
4. Verify Dockerfile exists in the directory
5. Try redeploying the service

---

## 🎉 Summary

**The key issue**: Railway needs to know which directory to build from.

**The solution**: 
1. Create 4 separate services in ONE Railway project
2. Set Root Directory for each service
3. Railway will use the Dockerfile in each directory

**Files created**:
- ✅ `Backend/railway.toml`
- ✅ `Frontend/railway.toml`
- ✅ `LandingPage/railway.toml`
- ✅ `AuthService/railway.toml`

Now commit and push these files, then follow the setup process above!

```bash
git add .
git commit -m "Add Railway configuration files"
git push origin main
```

---

**Next**: Follow the step-by-step setup above to create your services correctly! 🚀
