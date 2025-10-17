# Nginx Port Binding Fix for Railway

## Problem

Railway health checks were failing for LandingPage and Frontend services with the error:
```
nginx: [emerg] invalid port in "${PORT:-80}" of the "listen" directive
```

This happened because:
1. **Railway assigns a dynamic PORT** environment variable to each service
2. **nginx was hardcoded to port 80** in the config
3. The nginx template auto-processing wasn't working as expected
4. Railway's health check tried to connect to the assigned PORT, but nginx wasn't listening there

## Solution

Created a **custom entrypoint script** that:
1. Reads the `PORT` environment variable from Railway (defaults to 80 if not set)
2. Uses `envsubst` to substitute `${PORT}` in the nginx config template
3. Outputs the processed config to `/etc/nginx/conf.d/default.conf`
4. Starts nginx on the correct port

## Files Changed

### LandingPage & Frontend (identical changes)

**docker-entrypoint.sh** (NEW)
```bash
#!/bin/sh
set -e

export PORT=${PORT:-80}
echo "Starting nginx on port $PORT..."

envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
```

**Dockerfile**
- Copy nginx.conf to `/etc/nginx/templates/default.conf.template` (not `/etc/nginx/conf.d/`)
- Copy entrypoint script and make it executable
- Use `ENTRYPOINT` instead of `CMD`

**nginx.conf**
- Changed `listen 80;` to `listen ${PORT:-80};`
- This syntax gets substituted by the entrypoint script

**railway.toml**
- Removed `startCommand` (handled by ENTRYPOINT now)

## How It Works

1. **Railway sets PORT** (e.g., `PORT=3000`)
2. **Container starts** → runs `/docker-entrypoint.sh`
3. **Entrypoint substitutes** `${PORT}` → `3000` in nginx config
4. **nginx starts** listening on port 3000
5. **Railway health check** hits port 3000 → ✅ Success!

## Testing Locally

To test the PORT substitution locally:

```bash
# Build and run with custom PORT
docker build -t landing-page ./LandingPage
docker run -p 8080:3000 -e PORT=3000 landing-page

# Should see: "Starting nginx on port 3000..."
# Access at http://localhost:8080
```

## Environment Variables

**No need to manually set PORT in Railway!** Railway automatically provides it.

The entrypoint script handles the default: `${PORT:-80}` means:
- Use Railway's PORT if provided
- Otherwise default to 80

## Deployment Status

After this fix:
- ✅ Backend: Deployed and healthy
- 🔄 LandingPage: Redeploying with PORT fix
- 🔄 Frontend: Redeploying with PORT fix
- ⏳ AuthService: Not yet deployed

---

**Date:** October 17, 2025  
**Commit:** `6f682f1` - Fix nginx PORT binding with custom entrypoint script
