# AuthService - Railway Environment Variables

## Required Environment Variables

Set these in Railway Dashboard → AuthService → Variables:

### Core Configuration

```bash
# Railway automatically provides PORT - no need to set it manually
# PORT will be assigned dynamically (e.g., 8080, 3000, etc.)

# CORS Configuration
# ⚠️ UPDATE after deploying Frontend to Railway
CORS_ORIGIN=https://your-frontend.railway.app

# Example for multiple origins (Frontend + Landing):
# CORS_ORIGIN=https://your-frontend.railway.app,https://your-landing.railway.app
```

### JWT Secrets (Required)

```bash
# Access Token Secret (generate a strong random string)
JWT_SECRET=<GENERATE_RANDOM_STRING_HERE>
JWT_EXPIRES_IN=15m

# Refresh Token Secret (generate a different strong random string)
REFRESH_JWT_SECRET=<GENERATE_DIFFERENT_RANDOM_STRING_HERE>
REFRESH_JWT_EXPIRES_IN=7d
```

**How to generate secure secrets:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Using online generator
# Visit: https://generate-secret.vercel.app/64
```

### Service API Key (Required)

```bash
# API key for inter-service communication (Backend <-> AuthService)
# Generate a strong random string
SERVICE_API_KEY=<GENERATE_RANDOM_STRING_HERE>

# ⚠️ IMPORTANT: Set the SAME value in Backend's SERVICE_API_KEY variable!
```

### OAuth Configuration (Optional)

Only set these if you want to enable OAuth login:

#### Google OAuth

```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-frontend.railway.app/auth/callback/google
```

**How to get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-frontend.railway.app/auth/callback/google`

#### Microsoft OAuth

```bash
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_REDIRECT_URI=https://your-frontend.railway.app/auth/callback/microsoft
```

**How to get Microsoft OAuth credentials:**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory → App registrations
3. Create a new registration
4. Add redirect URI: `https://your-frontend.railway.app/auth/callback/microsoft`
5. Generate a client secret in Certificates & secrets

---

## Complete Environment Variables Checklist

Copy this template and fill in the values in Railway:

```bash
# ✅ Core (Required)
CORS_ORIGIN=https://your-frontend.railway.app
JWT_SECRET=<64-char-random-hex>
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET=<64-char-random-hex>
REFRESH_JWT_EXPIRES_IN=7d
SERVICE_API_KEY=<random-api-key>

# ⏸️ OAuth Google (Optional - leave empty to disable)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# ⏸️ OAuth Microsoft (Optional - leave empty to disable)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=
```

---

## After Deployment

Once AuthService is deployed, you'll get a Railway URL like:
```
https://your-auth-service.up.railway.app
```

### Update Backend Environment Variables

In **Backend** service on Railway, update:
```bash
AUTH_SERVICE_URL=https://your-auth-service.up.railway.app
SERVICE_API_KEY=<same-value-as-auth-service>
```

### Update Frontend Environment Variables

In **Frontend** service on Railway, add:
```bash
VITE_AUTH_SERVICE_URL=https://your-auth-service.up.railway.app
```

---

## Testing After Deployment

### 1. Health Check
```bash
curl https://your-auth-service.up.railway.app/health
# Expected: {"status":"ok","service":"auth-service"}
```

### 2. Test Password Hashing (requires SERVICE_API_KEY)
```bash
curl -X POST https://your-auth-service.up.railway.app/hash-password \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_SERVICE_API_KEY" \
  -d '{"password":"test123"}'
```

### 3. Verify Backend Connection
After updating Backend's AUTH_SERVICE_URL, check Backend logs for:
```
✅ Auth service connection verified
```

---

## Security Notes

1. **Never commit secrets to git** - Railway variables are encrypted
2. **Use different secrets for JWT_SECRET and REFRESH_JWT_SECRET**
3. **SERVICE_API_KEY must match between Backend and AuthService**
4. **CORS_ORIGIN should only include your actual frontend domains**
5. **Generate new secrets for production** - don't use the same as development

---

## Troubleshooting

### Service unavailable / Health check fails
- Check Railway logs for errors
- Verify PORT binding (should be 0.0.0.0)
- Check if JWT_SECRET, REFRESH_JWT_SECRET, and SERVICE_API_KEY are set

### Backend can't connect to AuthService
- Verify AUTH_SERVICE_URL in Backend includes `https://`
- Verify SERVICE_API_KEY matches in both services
- Check AuthService logs for incoming requests

### OAuth not working
- Verify redirect URIs match exactly in OAuth provider settings
- Check if GOOGLE_CLIENT_ID/MICROSOFT_CLIENT_ID are set
- Ensure Frontend URL is correct in redirect URI

---

**Date:** October 17, 2025  
**Service:** AuthService  
**Deployment Platform:** Railway
