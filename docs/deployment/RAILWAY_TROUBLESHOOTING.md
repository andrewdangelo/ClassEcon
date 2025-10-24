# 🔧 Railway Deployment Troubleshooting

## Issue: "Dockerfile does not exist"

### Problem
Railway shows error: `Dockerfile 'Dockerfile' does not exist`

### Root Cause
When you set the **Root Directory** to `Backend` (or any service directory), Railway changes its working context to that directory. It then looks for the Dockerfile **relative to that root**, not the repository root.

### ✅ Solution (Already Fixed)
Updated all `railway.toml` files to remove explicit `dockerfilePath` since Railway auto-detects `Dockerfile` when it's in the root of the configured directory.

**Fixed files:**
- ✅ `Backend/railway.toml`
- ✅ `Frontend/railway.toml`
- ✅ `LandingPage/railway.toml`
- ✅ `AuthService/railway.toml`

---

## 🎯 How Railway Root Directory Works

When you configure Railway:

```
Railway Service Settings:
  Root Directory: Backend
```

Railway's working directory becomes:
```
ClassEcon/Backend/    ← Railway starts here
├── Dockerfile        ← Railway finds this
├── package.json
├── src/
└── railway.toml
```

**NOT:**
```
ClassEcon/            ← Railway is NOT here
├── Backend/
│   └── Dockerfile    ← Would need path "Backend/Dockerfile"
```

---

## ✅ Correct Railway Configuration

### Step-by-Step for Each Service

#### Backend Service

1. **Railway Dashboard** → Your Project → Backend Service
2. **Settings** → **Source**
   - Root Directory: `Backend`
3. **Settings** → **Build**
   - Should show: "Builder: Docker"
4. **Redeploy**

Railway will now:
- Set working directory to `Backend/`
- Find `Backend/railway.toml`
- Read `builder = "DOCKERFILE"`
- Look for `Backend/Dockerfile` ✅ (exists!)
- Build successfully

#### Frontend Service

1. **Settings** → **Source**
   - Root Directory: `Frontend`
2. Railway finds `Frontend/Dockerfile` ✅

#### LandingPage Service

1. **Settings** → **Source**
   - Root Directory: `LandingPage`
2. Railway finds `LandingPage/Dockerfile` ✅

#### AuthService

1. **Settings** → **Source**
   - Root Directory: `AuthService`
2. Railway finds `AuthService/Dockerfile` ✅

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Wrong Root Directory
```
Root Directory: /Backend     ← WRONG (leading slash)
Root Directory: ./Backend    ← WRONG (dot-slash)
Root Directory: Backend/     ← WRONG (trailing slash)
```

### ✅ Correct:
```
Root Directory: Backend      ← CORRECT
```

### ❌ Mistake 2: Specifying Full Path in railway.toml
```toml
[build]
dockerfilePath = "Backend/Dockerfile"  # WRONG - when Root is already Backend
```

### ✅ Correct:
```toml
[build]
builder = "DOCKERFILE"  # Let Railway auto-detect
```

### ❌ Mistake 3: Not Setting Root Directory
If you don't set Root Directory, Railway tries to build from repository root and fails because there's no Dockerfile there.

---

## 🧪 Testing Your Configuration

### 1. Check File Structure
```bash
# From repository root
ls Backend/Dockerfile     # Should exist
ls Frontend/Dockerfile    # Should exist
ls LandingPage/Dockerfile # Should exist
ls AuthService/Dockerfile # Should exist
```

### 2. Check railway.toml Files
```bash
cat Backend/railway.toml
# Should show:
# [build]
# builder = "DOCKERFILE"
```

### 3. Verify Railway Settings
In Railway Dashboard for each service:
- ✅ Settings → Source → Root Directory is set
- ✅ Settings → Build → Shows "Builder: Docker"
- ✅ Latest commit is deployed

---

## 📋 Deployment Checklist

Before deploying each service:

- [ ] Root Directory is set correctly (Backend, Frontend, LandingPage, or AuthService)
- [ ] railway.toml exists in the service directory
- [ ] Dockerfile exists in the service directory
- [ ] Environment variables are set
- [ ] Latest code is pushed to GitHub

---

## 🔄 How to Redeploy After Fix

1. **Code is already pushed** ✅ (done)
2. **In Railway Dashboard:**
   - Go to your Backend service
   - Click **"Deployments"** tab
   - Click **"Redeploy"** on the latest deployment
   
   OR
   
   - Go to **Settings**
   - Scroll down
   - Click **"Redeploy"**

3. **Watch the build logs** - should now succeed!

---

## 📊 Expected Build Process

### Successful Backend Build:
```
✓ Checking out code
✓ Setting root directory to Backend/
✓ Found railway.toml
✓ Builder set to DOCKERFILE
✓ Found Dockerfile
✓ Building Docker image...
  [1/2] Build stage
  [2/2] Production stage
✓ Image built successfully
✓ Deploying...
✓ Deployment successful
```

### Successful Frontend/Landing Build:
```
✓ Checking out code
✓ Setting root directory to Frontend/
✓ Found railway.toml
✓ Builder set to DOCKERFILE
✓ Found Dockerfile
✓ Building Docker image...
  [1/2] Build stage (Vite)
  [2/2] Production stage (nginx)
✓ Image built successfully
✓ Deploying...
✓ Deployment successful
```

---

## 🎯 Current Status

**Files Updated & Pushed**: ✅
- All `railway.toml` files fixed
- Changes committed and pushed to GitHub

**Next Steps**:
1. Go to Railway Dashboard
2. Redeploy Backend service
3. Should build successfully now!

---

## 📞 Still Having Issues?

### If build still fails:

1. **Check Railway Logs**
   - Click on deployment → View Logs
   - Look for the exact error message

2. **Verify Root Directory**
   - Settings → Source → Root Directory
   - Must be exactly: `Backend` (no extra characters)

3. **Verify railway.toml**
   - Should exist at `Backend/railway.toml`
   - Should contain `builder = "DOCKERFILE"`

4. **Try Clean Deploy**
   - Delete the service
   - Create new service
   - Set Root Directory to `Backend`
   - Deploy

5. **Manual Override**
   - In Railway Settings → Build
   - Toggle "Custom Build Command"
   - Leave it empty (Railway will use Dockerfile)

---

## ✅ Summary

**The Fix**: Removed `dockerfilePath` from `railway.toml` so Railway auto-detects the Dockerfile in the service's root directory.

**Status**: ✅ Fixed and pushed to GitHub

**Action**: Redeploy your Backend service in Railway - it should work now! 🚀
