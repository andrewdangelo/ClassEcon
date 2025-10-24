# ✅ FINAL CORRECT ENVIRONMENT VARIABLES

## Copy-Paste Ready - Use These Exact Values

### 🔵 Backend Service

**Delete this variable:**
```
CORS_ORIGIN   ← DELETE THIS (wrong variable name)
```

**Add/Update these:**
```bash
CORS_ORIGINS=https://classecon-production-aeea.up.railway.app,https://classecon-production.up.railway.app,https://studio.apollographql.com
PORT=4000
DATABASE_URL=mongodb+srv://adangelo:kuaZnfB2scqRMvma@ce-dev-use1-01.gomjxgi.mongodb.net/?retryWrites=true&w=majority&appName=ce-dev-use1-01
MONGO_DB=classroomecon
JWT_SECRET=superlongrandomstring_change_me
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
REFRESH_JWT_SECRET=another_superlong_random_string
SERVICE_API_KEY=d0a7d1964bf0576c430f0a5cb6844fcd56a57ff6de4ed57d1e6610954be657fe
```

**⚠️ AUTH_SERVICE_URL:** You need the PUBLIC URL of AuthService (not `.railway.internal`).  
Get it from: Railway → AuthService → Settings → Networking → Public Domain

```bash
AUTH_SERVICE_URL=https://your-authservice-public-url.railway.app
```

---

### 🟢 Frontend Service

```bash
VITE_GRAPHQL_URL=https://backend-production-e546.up.railway.app/graphql
VITE_LANDING_PAGE_URL=https://classecon-production.up.railway.app
VITE_GOOGLE_CLIENT_ID=
VITE_MICROSOFT_CLIENT_ID=
VITE_ENABLE_OAUTH=false
VITE_NODE_ENV=production
```

**⚠️ VITE_AUTH_SERVICE_URL:** You need the PUBLIC URL of AuthService (not `.railway.internal`).

```bash
VITE_AUTH_SERVICE_URL=https://your-authservice-public-url.railway.app
```

---

### 🟡 AuthService

```bash
NODE_ENV=production
PORT=4001
CORS_ORIGIN=https://classecon-production-aeea.up.railway.app
JWT_SECRET=<GENERATE_REAL_SECRET>
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=<GENERATE_REAL_SECRET>
REFRESH_JWT_EXPIRES_IN=7d
SERVICE_API_KEY=d0a7d1964bf0576c430f0a5cb6844fcd56a57ff6de4ed57d1e6610954be657fe
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=
```

---

## 🔧 Step-by-Step Fix

### 1. Backend Service
1. Go to Railway → Backend → Variables
2. **Find `CORS_ORIGIN`** → Click the trash icon to **DELETE** it
3. Click **"New Variable"**
4. Name: `CORS_ORIGINS`
5. Value: `https://classecon-production-aeea.up.railway.app,https://classecon-production.up.railway.app,https://studio.apollographql.com`
6. Click **Add**
7. Click **Deploy** (or wait for auto-deploy)

### 2. Frontend Service
1. Go to Railway → Frontend → Variables
2. **Find `VITE_GRAPHQL_URL`**
3. Change from: `https://backend-production-e546.up.railway.app/`
4. Change to: `https://backend-production-e546.up.railway.app/graphql`
5. **Find `VITE_LANDING_PAGE_URL`**
6. Change from: `https://classecon-production.up.railway.app/`
7. Change to: `https://classecon-production.up.railway.app`
8. Click **Deploy** (or wait for auto-deploy)

### 3. AuthService
1. Go to Railway → AuthService → Variables
2. **Find `CORS_ORIGIN`**
3. Change from: `https://classecon-production-aeea.up.railway.app/`
4. Change to: `https://classecon-production-aeea.up.railway.app`
5. **Generate real JWT secrets** (currently showing placeholders!)
   ```bash
   openssl rand -base64 32
   ```
6. Update `JWT_SECRET` and `REFRESH_JWT_SECRET` with generated values
7. Click **Deploy** (or wait for auto-deploy)

---

## 🧪 Verification After Deploy

### 1. Test CORS (should return 200)
```bash
curl -I -X OPTIONS https://backend-production-e546.up.railway.app/graphql \
  -H "Origin: https://classecon-production-aeea.up.railway.app" \
  -H "Access-Control-Request-Method: POST"
```

**Look for:**
```
HTTP/2 204
access-control-allow-origin: https://classecon-production-aeea.up.railway.app
```

### 2. Test GraphQL Endpoint
```bash
curl https://backend-production-e546.up.railway.app/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

**Should return:**
```json
{"data":{"__typename":"Query"}}
```

### 3. Check Frontend Console
Open Frontend → F12 → Console → Type:
```javascript
console.log({
  GRAPHQL: import.meta.env.VITE_GRAPHQL_URL,
  LANDING: import.meta.env.VITE_LANDING_PAGE_URL
});
```

**Should show:**
```javascript
{
  GRAPHQL: "https://backend-production-e546.up.railway.app/graphql",  // ✅ No trailing slash!
  LANDING: "https://classecon-production.up.railway.app"   // ✅ No trailing slash!
}
```

---

## ❌ Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct | Issue |
|----------|-----------|-------|
| `CORS_ORIGIN` | `CORS_ORIGINS` | Backend code expects plural |
| `https://backend.app/` | `https://backend.app/graphql` | Missing GraphQL endpoint |
| `https://frontend.app/` | `https://frontend.app` | Trailing slash breaks paths |
| `.railway.internal` | `.railway.app` | Internal URLs don't work from browser |
| `<generate-secret>` | `abcd1234...` | Placeholders aren't valid secrets |

---

## 📝 Checklist

- [ ] Backend: Delete `CORS_ORIGIN` (singular)
- [ ] Backend: Add `CORS_ORIGINS` (plural)
- [ ] Frontend: Change `VITE_GRAPHQL_URL` to include `/graphql`
- [ ] Frontend: Remove trailing slashes from all URLs
- [ ] AuthService: Remove trailing slash from `CORS_ORIGIN`
- [ ] AuthService: Generate real JWT secrets
- [ ] All services: Replace `.railway.internal` with `.railway.app`
- [ ] Save all changes
- [ ] Wait for all services to redeploy (~5 min)
- [ ] Test CORS with curl
- [ ] Test Frontend in browser
- [ ] Verify no CORS errors in console

---

**Date:** October 17, 2025  
**Critical Issues:** Wrong variable name (CORS_ORIGIN vs CORS_ORIGINS), trailing slashes, missing /graphql  
**Priority:** 🔴 CRITICAL - Fix immediately
